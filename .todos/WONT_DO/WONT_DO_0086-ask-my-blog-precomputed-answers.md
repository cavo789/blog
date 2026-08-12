# 0086 — « Ask my blog » : des réponses précalculées, pas seulement des liens

- **Priority**: High
- **Batch**: blog-questions
- **Depends**: 0083
- **Files**: `scripts/generate-questions.mjs`, `scripts/check-questions-freshness.mjs`, `plugins/questions-index-plugin/index.cjs`, `src/components/AskMyBlog/index.js`, `src/components/AskMyBlog/questionsIndex.js`, `src/components/CommandPalette/index.js`, `src/pages/faq.js`, `src/components/FaqThemePage/index.js`

## ⚠️ Avant toute chose : inventorier l'existant

**Une session Claude parallèle travaille (ou a travaillé) sur une « chatbox » en bas à droite
qui expose la feature « Ask my blog ».** Ce TODO a été rédigé sans visibilité sur ce
chantier. La première étape n'est donc pas d'écrire du code, mais de constater ce qui est
déjà là :

1. `git log --oneline -30` et `git diff` — repérer tout composant `Chat*`/`ChatBox`/`Assistant`
   ajouté depuis la rédaction de ce TODO.
2. Lister `src/components/` et chercher un nouveau dossier de chatbox ; lire `src/theme/Layout/index.js`
   et `src/theme/Root.js` pour voir ce qui y est monté.
3. Vérifier si `plugins/questions-index-plugin/index.cjs` produit encore **un seul**
   `questions-index.json` monolithique, ou s'il a déjà été shardé.
4. Vérifier si `scripts/generate-questions.mjs` produit déjà un champ `answer` dans les
   sidecars — auquel cas la partie génération de ce TODO est caduque.

Puis **réconcilier** : si la chatbox existe déjà, ce TODO ne crée aucune UI nouvelle, il
alimente celle qui existe. Si des décisions y ont été prises qui contredisent ce qui suit
(format de l'index, shardage, emplacement des réponses), ce sont **celles de la chatbox qui
gagnent** — mettre à jour ce TODO plutôt que de diverger.

## Problème

L'index de questions ([[0083]]) contient ~2 500 questions générées, chacune avec son
`anchor`, son `permalink` et son `title`. `AskMyBlog` les classe en BM25 pur côté client, et
le résultat d'une recherche est… **une liste de liens**.

C'est un excellent moteur de recherche. Ce n'est pas ce que le lecteur croit obtenir quand
on lui présente une boîte intitulée « Ask my blog », et encore moins quand cette boîte prend
la forme d'une chatbox : une bulle de conversation qui répond par six liens bleus crée une
attente qu'elle ne tient pas.

Le corpus contient déjà la réponse — elle est dans la section pointée par l'`anchor`. Elle
n'est simplement jamais extraite.

## Solution

Générer **la réponse en même temps que la question**, au build, par le même pipeline Ollama
que `generate-questions.mjs` et que les ELI5. Chaque entrée de l'index passe de :

```json
{ "question": "…", "anchor": "…", "permalink": "…", "title": "…", "mainTag": "…" }
```

à la même chose plus un champ `answer` : **2 à 3 phrases extractives**, tirées du texte de la
section ancrée, jamais inventées.

Le contrat qui rend la chose défendable :

- **Extractif, pas génératif.** Le prompt impose de reformuler _uniquement_ à partir du
  contenu de la section. Une réponse qui introduit un fait absent de la section est un bug,
  au même titre qu'un ELI5 faux.
- **Zéro appel LLM au runtime.** La réponse est servie depuis un fichier statique : réponse
  en quelques millisecondes, hors-ligne, sans coût, sans clé d'API, sans rate limit.
- **Toujours sourcée.** La réponse s'affiche avec le titre de l'article et un
  « lire la section complète → » vers `permalink#anchor`. La réponse n'est jamais un
  remplacement de l'article, c'est son accroche.
- **Relu avant publication.** Même règle que 0083 : lot pilote relu à la main avant le lot
  complet. `yarn questions:edit` (`scripts/faq-edit.mjs`) doit permettre de corriger une
  réponse comme il permet déjà de corriger une question.

### Le vrai piège : le poids de l'index

`.docusaurus/questions-index-plugin/static/questions-index.json` fait **472 Ko aujourd'hui**.
Ajouter 2-3 phrases par entrée le pousse vers ~2 Mo. C'est inacceptable pour un fichier que
`AskMyBlog` fetch en entier au montage de `/faq`, et pire encore pour une chatbox montée sur
**toutes** les pages.

Trois options, à trancher explicitement avant d'écrire la génération :

| Option                                     | Principe                                                                                                       | Coût                                               |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **A. Shard par thème**                     | un `questions-<theme>.json` par thème ; l'index global ne garde que `question` + `theme` + pointeur            | fetch supplémentaire au premier résultat affiché   |
| **B. Index léger + réponses à la demande** | l'index reste tel quel (questions seules, 472 Ko) ; la réponse est fetchée par entrée au moment de l'affichage | N petits fetches, mais chargement initial inchangé |
| **C. Réponse tronquée dans l'index**       | 1 phrase dans l'index global, la réponse longue à la demande                                                   | compromis, deux formats à maintenir                |

**Recommandation : B.** Elle ne change rien au chargement actuel, ne casse pas
`AskMyBlog`/`CommandPalette` qui consomment déjà l'index tel quel, et se marie bien avec une
chatbox qui n'affiche de toute façon que 3-5 réponses à la fois. A est plus élégant mais
impose de retoucher les trois consommateurs de l'index d'un coup.

**Ce choix contraint la chatbox de l'autre session.** Si elle se câble sur le fichier
monolithique, il faudra la recâbler — d'où l'inventaire en tête de ce TODO.

## Risque

- **Sur-confiance du lecteur.** Une réponse affichée avec assurance sera lue comme une
  vérité. Si le corpus est périmé sur ce point, le lecteur repart avec une info fausse sans
  jamais ouvrir l'article. Mitigation : le lien vers la section est obligatoire, jamais
  optionnel, et `review_date` de l'article source doit rester visible.
- **Volume de relecture.** 2 500 réponses à relire, c'est plus lourd que 2 500 questions
  (une question fausse se repère en un coup d'œil, une réponse fausse demande d'ouvrir la
  section). Prévoir de générer par thème, pas d'un bloc, et de commencer par les thèmes les
  plus consultés (Matomo).
- **Dérive avec le contenu.** `yarn questions:check` détecte déjà la péremption d'un sidecar
  face à son article ; il doit couvrir les réponses au même titre que les questions.

## Acceptance

- [ ] L'inventaire de l'existant (section en tête) est fait et consigné ; le TODO est
      réconcilié avec ce que la session chatbox a produit
- [ ] Le choix A/B/C est tranché et justifié en une phrase dans ce fichier
- [ ] `generate-questions.mjs` produit un champ `answer` extractif ; `faq-edit.mjs` permet de
      l'éditer ; `check-questions-freshness.mjs` le prend en compte
- [ ] Un lot pilote (≥ 15 articles, ≥ 100 questions) est généré **et relu à la main** avant
      tout lot complet — même règle que [[0083]]
- [ ] La réponse s'affiche dans `AskMyBlog`, dans le mode `?` de la palette ([[0084]]) et
      dans la chatbox, toujours accompagnée de sa source cliquable
- [ ] Le poids du payload chargé sur une page d'article **n'augmente pas** (vérifié dans
      l'onglet réseau, pas seulement supposé)
- [ ] `yarn lint && yarn format:check && yarn build` passent

## Status — WONT_DO (2026-08-12)

Écarté par l'auteur après relecture, avant tout début d'implémentation.

**Raison :** la prémisse du TODO ne tient pas. Il postule qu'une liste de liens est un défaut
à corriger (« une bulle de conversation qui répond par six liens bleus crée une attente
qu'elle ne tient pas »). L'auteur ne partage pas ce diagnostic : renvoyer vers la bonne
section d'un article est un résultat satisfaisant en soi, et c'est même le comportement
attendu d'un blog — le but est d'amener le lecteur dans l'article, pas de le dispenser de
l'ouvrir.

Ce qui tombe avec cette décision :

- aucun champ `answer` à générer, donc pas de second passage de relecture sur ~2 500
  réponses, et pas de risque de sur-confiance du lecteur face à une réponse extraite ;
- l'index de questions **reste monolithique** — le choix A/B/C sur le shardage devient sans
  objet, et la chatbox peut se câbler sans contrainte sur `questions-index.json` tel qu'il
  est aujourd'hui.

À rouvrir seulement si l'usage réel montre que les lecteurs ne cliquent pas les résultats —
ce que le trafic actuel ne permet pas de mesurer.
