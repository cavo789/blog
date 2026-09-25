---
name: feedback_todo_triage
description: "User rejects reader-engagement features (polls, questions, share/bookmark, counters) as WONT_DO due to low traffic"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 85838d8c-eb86-435d-af17-0b7596f1b2e7
---

Christophe systematically marks reader-engagement TODO proposals as WONT_DO (moved to `.todos/WONT_DO/`) when they require ongoing interaction or add UI surface for a small audience.

**Why:** He has too few visitors to justify the effort/maintenance cost of these features (his own words: "j'ai trop peu de visiteurs pour perdre du temps à cette feature" / "trop peu d'intérêt"). For live-reply features specifically, he also can't commit to answering visitors in real time.

Confirmed WONT_DO so far:

- 002 — Interactive polls (`<Poll />` component)
- 004 — Reader question widget (live Q&A form) — redundant with the existing typo/suggestion popup, and he can't answer visitors live
- 006 — Code block copy counter
- 008 — Reading list / bookmarks (localStorage)
- 012 — Share highlight (Twitter/X share + Text Fragment API)

**How to apply:** When triaging or proposing new `.todos/*.md` ideas, be skeptical of anything in the "visitor engagement / social feature / analytics gimmick" family (polls, live chat/Q&A, share widgets, bookmarking, vanity counters). Don't pitch these proactively — he already has a lightweight typo/suggestion popup covering feedback needs. Favor TODOs that improve content quality, DX, or SEO/reach instead of interactive widgets requiring an audience or live response.

## Profil lecteur / localStorage global — reposé et re-refusé le 2026-09-23

Question posée en brainstorming : une page « Profil » (variables du lecteur en localStorage, donc
zéro RGPD) et des variables `<Vars>` « globales » valables sur tous les articles. Verdict de
l'auteur : « pas utile, c'est trop léger » — question close « encore pour quelques mois ».

**Why:** les mesures sur le corpus ne portent pas la feature, et le refus était déjà écrit dans
le brief d'origine de `Vars` (`.todos/PARTIAL/PARTIAL_0088` : « Ne pas transformer ça en profil
lecteur »). Chiffres relevés, à réutiliser plutôt qu'à recalculer :

- `port` = 176 marqueurs mais **16 valeurs par défaut distinctes**, `name` = 120 pour **17** :
  ce sont des valeurs *par service*, pas *par lecteur*. Un `port` global ferait entrer en
  collision Ollama, Oracle, Uptime Kuma… Signal interne : `docker-adminer-pgadmin-phpmyadmin`
  a dû préfixer en `port_phpmyadmin`/`port_pgadmin`/`port_adminer`.
- Seul cluster authentiquement « lecteur » : `vmUser`/`vmIp`/`sshKey` (+ `devUser`, `linuxHost`,
  `linuxAlias`) — partagé par **2 articles seulement** (`vscode-remote-ssh-proxyjump-devcontainer`
  publié + `.unpublished/ssh-config-tips`).
- Le localStorage existant n'a aucune matière à afficher : 3 drapeaux « astuce vue », un cache
  GitHub, un anti-spam typo, `cmdk_recently_viewed` (déjà exposé dans ⌘K), `reaction_`/`tried_it_`
  (« j'ai voté », compteurs côté serveur).
- Deux frictions : navbar saturée 997-1260px (voir [[project_navbar_width_budget]]), et le
  contrat SSR de `Vars` (`getServerSnapshot` vide, application post-montage) interdit justement
  d'appliquer une valeur avant le premier paint.

**How to apply:** si la question revient, ne pas repartir de zéro — rappeler ces chiffres. La
seule forme qui resterait défendable est un **scope opt-in par variable**
(`<Vars scope="global" …>` → clé `docusaurus:vars:@<name>`), jamais une page Profil, et son
déclencheur est **un troisième article partageant les variables SSH**. Voir [[project_components]].

## Lot du 2026-09-25 — 3 refus (0136, 0122, 0134)

**Le fait de workflow qui a tranché deux d'entre eux, à retenir en priorité :** l'auteur écrit un
article, le fait traduire, puis **ne le modifie plus**. Toute classe de bug qui suppose une
réédition de l'anglais *après* sa traduction est donc hypothétique chez lui.

- **0136 — badge de niveau (débutant/intermédiaire/avancé), classé par Ollama.** Refusé sur deux
  motifs : le **bounce rate d'environ 90 %** (les lecteurs arrivent par recherche sur un sujet
  précis et repartent — ils ne comparent jamais plusieurs articles, donc une facette de tri ne
  sert personne, et le badge en en-tête arrive trop tard), et surtout la **charge récurrente** :
  chaque nouvel article devrait porter son badge. Le TODO vendait « le classifieur tourne une
  fois », ce qui est vrai du corpus et faux du régime permanent. Note : `WONT_DO_009` refusait
  déjà l'étiquetage de difficulté (variante avec vote lecteur) — **deuxième refus du même sujet**.
- **0122 — props identifiantes non propagées aux traductions.** Bug réel et bien analysé, mais son
  unique déclencheur est la réédition post-traduction → éliminé par le workflow ci-dessus.
- **0134 — vérifier que les traductions disent la même chose que l'original.** Refusé d'abord par
  **confiance dans le traducteur** : les traductions viennent de Claude via l'API, l'auteur ne
  s'attend pas à ce qu'un juge trouve quoi que ce soit. Le coût n'a fait que confirmer.

**Why:** deux règles durables en sortent. (1) Ne pas proposer d'outillage dont le rôle est de
**confirmer que l'outil Claude a bien travaillé** — l'auteur lui fait confiance ; le déclencheur
légitime serait une erreur réellement constatée à la lecture, jamais une inquiétude théorique.
(2) Une fonctionnalité qui impose **une étape de plus à chaque publication** part avec un lourd
handicap, même si sa génération est gratuite — voir [[feedback_article_weight]].

**How to apply:** avant de chiffrer un TODO en « coût nul car modèle local », **mesurer l'unité de
travail réelle**. 0134 annonçait « 258 paires, coût nul » ; l'unité était le paragraphe, pas
l'article — **9 516 paires**, et **11,6 h de GPU mesurées** (`code-quality`, lot de 8, 35 s/lot,
4,37 s/paire). « Gratuit » ne vaut que pour la facture API ; le temps GPU est un coût. Et vérifier
un chiffre avant de laisser l'auteur décider dessus : mon estimation intermédiaire de 2,6 h était
fausse d'un facteur 4,5, il a fallu un vrai appel pour le voir — voir
[[feedback_verification_discipline]].

Acquis gratuit conservé dans `WONT_DO_0134`, à ne pas recalculer : les **258 paires EN/FR
s'apparient exactement bloc à bloc** (0 divergence de structure sur tout le corpus), 13 376 blocs
dont 2 569 identiques et 1 291 de markup pur.
