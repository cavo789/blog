# 0085 — BrowserWindow : seconde passe sur les captures restantes

- **Priority**: medium
- **Batch**: unassigned
- **Depends**: —
- **Files**: TBD

## Context

Une première passe a wrappé 30 captures de navigateur dans `<BrowserWindow>` (adoption
18 → 36 posts), croppé 21 images pour supprimer le chrome devenu redondant avec la barre
d'adresse du composant, et retiré `className="screenshot"` des 52 images situées dans un
`BrowserWindow` (double encadrement). La règle est désormais dans `AGENTS.md`, section
_Blog Content Guidelines_.

Restent deux lots qui demandent un arbitrage visuel image par image, trop bruités pour
un traitement automatique :

1. **~58 captures candidates au wrap** — images dont l'URL n'apparaît pas dans les 4 lignes
   qui précèdent mais plus haut dans la même section. Beaucoup de faux positifs (captures
   VS Code, sorties CLI, Docker Desktop). Lots les plus prometteurs : `docker-memos` (4),
   `running-docusaurus-using-docker` (4), `quarto-industrialisation` (3),
   `docusaurus-series` (2), `blog-post-feed` (2), `bruno` (2).
2. **Images dans un `BrowserWindow` non croppées** — le détecteur de chrome a un taux de
   faux positifs d'environ 50 % (il s'accroche à un bord de contenu quand l'image n'a pas
   de chrome du tout). Les cas rejetés en première passe le sont pour trois raisons
   distinctes, à re-trancher au cas par cas :
   - **pas de chrome** : image déjà cadrée sur le contenu (heimdall, oracle-ords, pentaho,
     python-fastapi) → rien à faire ;
   - **le chrome est le sujet** : `docker-docusaurus-own-blog/favicon.webp` (flèche rouge
     vers l'onglet), `docker-extra-hosts/mysite.webp` (badge « Not secure » +
     `mysite.local:8080`), `docker-joomla-part-2/project_1_2.webp` et `project_1_2_3.webp`
     (composites de 2-3 fenêtres, flèches vers les ports) → ne jamais cropper ;
   - **cas limite** : `docker-localhost-ssl/running_https.webp` (popup d'autocomplétion
     ouverte sous la barre d'adresse, et le badge de sécurité illustre le propos de
     l'article) → décider si on crope ou si on garde le chrome comme preuve.

Le script de détection et les planches de contact utilisés en première passe sont
reproductibles : profil de luminance/neutralité par ligne via `sharp`, puis montage de
vignettes avec la ligne de coupe proposée en rouge.

## Acceptance

- [ ] Les ~58 candidates au wrap sont passées en revue ; celles qui montrent réellement un
      navigateur sont wrappées dans `<BrowserWindow>` avec l'URL exacte de la prose
- [ ] Les images à chrome résiduel sont croppées, les images dont le chrome porte le propos
      sont explicitement laissées telles quelles
- [ ] Le sort de `running_https.webp` est tranché
- [ ] `yarn lint && yarn format:check && yarn build` passent
