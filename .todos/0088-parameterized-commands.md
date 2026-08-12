# 0088 — Commandes paramétrées : le lecteur saisit ses valeurs une fois, l'article s'adapte

- **Priority**: Medium
- **Batch**: blog-commands
- **Depends**: —
- **Files**: `src/components/Terminal/index.js`, `src/components/Snippet/index.js`, `src/theme/MDXComponents.js`, `plugins/markdown-export-plugin/degrade.cjs`

## Problème

Les articles Docker sont truffés de valeurs que le lecteur doit adapter à sa machine, et
qu'il adapte **à la main, à chaque bloc de code** :

- `-p 8080:80` — port hôte, à changer si 8080 est déjà pris (mesuré : 28 articles publiés
  contiennent au moins un mapping de port ; `-p 8080:80` apparaît 12 fois, `-p 80:80` 9 fois) ;
- `--name mysite` — nom du conteneur (23 articles) ;
- **21 articles contiennent les deux**, souvent répétés sur cinq ou six commandes successives.

Un lecteur qui décide d'utiliser le port 9000 au lieu de 8080 doit faire la substitution
mentalement dans chaque commande jusqu'à la fin de l'article, et il se trompera au moins une
fois. Le corpus contient déjà deux tentatives artisanales de contourner le problème
(`<your_image>`, `YOUR_IP_HERE`) — la preuve que le besoin est réel, et qu'il n'a pas de
solution outillée.

## Solution

Une barre « tes valeurs » en haut de l'article : le lecteur saisit son port, son nom de
projet, sa version de PHP — **une fois** — et toutes les commandes de la page se réécrivent.

Le contrat qui rend la chose sûre :

- **Déclaratif, jamais deviné.** L'auteur déclare les variables explicitement en tête
  d'article (`<Vars port="8080" name="mysite" />` ou équivalent) et utilise des marqueurs
  dans ses blocs de code. **Aucun scan du DOM à la recherche de motifs `-p \d+:\d+`** : une
  substitution automatique finirait par réécrire le port d'un `docker-compose.yml` d'exemple
  ou une sortie de terminal, et l'article mentirait sur ce qu'il montre.
- **Valeur par défaut = le texte actuel.** Sans interaction, l'article s'affiche exactement
  comme aujourd'hui. C'est ce qui garantit qu'un retrofit ne change rien tant que le lecteur
  ne touche à rien, et que le SSR reste correct pour le SEO.
- **Le copier-coller donne la valeur du lecteur**, pas le marqueur. C'est tout l'intérêt ;
  un bouton « copier » qui recrache `{{PORT}}` détruit la fonctionnalité.
- **Persistant sur la page, pas sur le site.** La valeur vit le temps de la lecture
  (localStorage optionnel). Ne pas transformer ça en profil lecteur — voir le refus
  historique des features à état côté lecteur ([[008]]).

### Points à trancher pendant l'implémentation

- **Où se fait la substitution ?** `<Terminal>` et `<Snippet>` sont les deux composants qui
  portent les commandes, et `<Snippet>` a un chemin de rendu particulier (ELI5 ligne par
  ligne, `Eli5CodeBlock`) : la substitution doit fonctionner dans les deux, y compris quand
  un tooltip ELI5 cite la ligne.
- **Les blocs ` ``` ` bruts** ne passent par aucun des deux composants. Décider s'ils sont
  couverts (via un remark plugin, dans l'esprit de `remark-replace-terms`) ou explicitement
  hors périmètre — et le dire dans `AGENTS.md`.
- **Export Markdown.** `plugins/markdown-export-plugin/degrade.cjs` doit recevoir une entrée
  dans `COMPONENT_RULES` pour le nouveau composant, sinon le build émet un avertissement
  « unknown component » (la règle est documentée dans le readme du plugin). Le miroir `.md`
  et `llms.txt` doivent contenir les **valeurs par défaut**, jamais les marqueurs — un LLM
  qui lit `{{PORT}}` produira une commande invalide.

### Retrofit

Ne pas retrofitter les 28 articles d'un bloc. Un article pilote, validé visuellement, puis
les 21 qui cumulent port + nom, par lots. Les meilleurs candidats sont ceux où la même valeur
revient sur plusieurs commandes : `docker-adminer-pgadmin-phpmyadmin`, `docker-wordpress`,
`docker-localhost-ssl`, `docker-oracle-database-server`, `running-docusaurus-using-docker`.

## Risque

- **Faire mentir un article.** Une substitution trop large qui touche une sortie de terminal
  ou un fichier de conf d'exemple rend l'article faux sans que personne s'en aperçoive. C'est
  la raison du « déclaratif, jamais deviné » ci-dessus, et le point à vérifier en priorité en
  relecture.
- **SSR / hydratation.** Le HTML servi doit contenir les valeurs par défaut ; une
  substitution qui ne s'applique qu'au montage provoquerait un flash, voire une erreur
  d'hydratation (cf. [[057]], déjà vécu avec Iconify).
- **Régression du copier-coller.** Le bouton de copie de Docusaurus lit le DOM ; si la
  substitution se fait ailleurs qu'au rendu, la copie repartira avec le marqueur.
- **Charge d'auteur.** Si déclarer les variables coûte plus cher que d'écrire la commande en
  dur, l'auteur ne le fera pas. L'API doit tenir sur une ligne.

## Acceptance

- [ ] Un article pilote fonctionne de bout en bout : saisie → toutes les commandes réécrites
      → copier-coller correct
- [ ] Sans interaction du lecteur, l'article est **identique** à sa version actuelle (vérifié
      sur le HTML SSR, pas seulement à l'œil)
- [ ] `<Terminal>` et `<Snippet>` (y compris le chemin ELI5) gèrent la substitution
- [ ] Le sort des blocs ` ``` ` bruts est tranché et écrit dans `AGENTS.md`
- [ ] `degrade.cjs` a sa règle ; le `.md` exporté et `llms.txt` contiennent les valeurs par
      défaut et **aucun marqueur** (vérifié par grep sur `build/`)
- [ ] Aucun avertissement « unknown component » au build
- [ ] `yarn lint && yarn format:check && yarn build` passent
