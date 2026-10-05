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
