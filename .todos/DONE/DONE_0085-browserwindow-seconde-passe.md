# 0085 — BrowserWindow : recadrer le chrome résiduel des captures déjà wrappées

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

Restait un second lot, trop bruité pour un traitement automatique : les captures déjà dans un
`BrowserWindow` mais dont le chrome (barre de titre/onglets/adresse du navigateur d'origine)
n'a pas été recadré. Le détecteur de chrome utilisé en première passe a un taux de faux
positifs d'environ 50 % (il s'accroche à un bord de contenu quand l'image n'a pas de chrome du
tout). Les cas rejetés en première passe le sont pour trois raisons distinctes, à re-trancher
au cas par cas :

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

> **Note (2026-08-29) — scope recentré.** Ce TODO couvrait à l'origine un second lot
> (« ~58 captures candidates au wrap », détectées par proximité texte/URL, ~50 % de faux
> positifs) : voir `[[0110]]` `.todos/DONE/DONE_0110-detecter-screenshots-hors-browserwindow.md`,
> qui l'absorbe — la classification visuelle directe (lecture de l'image par Claude) couvre
> tout le corpus plus fiablement que l'heuristique de proximité. Suivi désormais dans
> `.todos/0000-browserwindow-audit-journal.md`. Ce TODO ne porte donc plus que sur le recadrage
> du chrome résiduel décrit ci-dessous.

## Acceptance

- [ ] Les images à chrome résiduel sont croppées, les images dont le chrome porte le propos
      sont explicitement laissées telles quelles
- [ ] Le sort de `running_https.webp` est tranché
- [ ] `yarn lint && yarn format:check && yarn build` passent

## Status — DONE (2026-08-29)

Clos sur décision explicite de l'auteur : le sujet BrowserWindow s'arrête ici (voir aussi
`[[0110]]`, clos le même jour avec un scope réduit). Aucune des actions de recadrage ci-dessus
n'a été faite dans le cadre de ce TODO — l'auteur traitera les cas listés (heimdall,
oracle-ords, pentaho, python-fastapi, `docker-docusaurus-own-blog`, `docker-extra-hosts`,
`docker-joomla-part-2`, `docker-localhost-ssl/running_https.webp`) **manuellement, au cas par
cas**, en dehors du backlog `.todos/`. Ce n'est donc pas un "done" au sens strict de
l'acceptance ci-dessus, mais une clôture volontaire : le sujet ne sera pas repris via un futur
`/todo`.
