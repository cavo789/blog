# 0094 — Trois tableaux de bord d'auteur sont publics

- **Priority**: Low
- **Batch**: deploy-pipeline
- **Depends**: —
- **Files**: `static/.htaccess`, `.github/workflows/deploy.yml`, `src/pages/admin.js`, `src/pages/typo-dashboard.js`, `src/pages/reactions-dashboard.js`

## Problème

Trois pages construites pour moi seul sont déployées et joignables par n'importe qui :
`/admin`, `/typo-dashboard`, `/reactions-dashboard`. Vérifié le 2026-08-17 : elles répondent
(301 puis 200), elles ne sont protégées par rien, et rien ne les signale.

À noter d'emblée : **la fuite de données a déjà été traitée**. `/admin-data/drafts.json`, qui
listait tous les brouillons avec titres et descriptions, est désormais exclu du transfert
(`--exclude "admin-data/***"`) et refusé côté serveur (`RewriteRule ^admin-data/ - [F,L]`).
La page `/admin` ne peut donc plus afficher quoi que ce soit de sensible : sa source de données
n'arrive plus jamais sur le serveur.

Ce qui reste est un problème d'hygiène plutôt que de confidentialité :

- ces pages sont indexables par les moteurs — rien dans `robots.txt` ne les exclut ;
- `/admin` est aujourd'hui **cassée en production** puisqu'elle tente de charger un JSON qui
  renvoie 403 ; un visiteur qui tombe dessus voit une page en erreur ;
- `typo-dashboard` et `reactions-dashboard` exposent la structure d'outils internes, ce qui
  n'est pas grave mais n'apporte rien à un lecteur.

C'est pour cette raison que la priorité est `Low` : aucun secret n'est exposé, seulement du
désordre visible.

## Solution

Trois options, par ordre de coût croissant. **Le choix est éditorial et m'appartient.**

**a. Les exclure du déploiement.** Ajouter `admin`, `typo-dashboard` et `reactions-dashboard`
à la liste `--exclude` de la passe 1 du workflow, comme c'est déjà fait pour `admin-data/`.
Elles restent utilisables en local via `yarn start` — ce qui est leur usage réel. Coût : trois
lignes. Inconvénient : plus consultables depuis un téléphone.

**b. Les laisser en ligne mais les désindexer.** Ajouter `Disallow: /admin`, `/typo-dashboard`
et `/reactions-dashboard` à `robots.txt`, plus une balise `noindex`. Corrige l'indexation, pas
la page `/admin` cassée ni l'exposition.

**c. Les protéger par authentification.** `.htaccess` avec `Require valid-user` et un
`.htpasswd` **placé hors de la racine web** — sinon rsync le supprimerait ou le publierait.
Coût : une manipulation serveur, un mot de passe à gérer. Bénéfice : elles restent consultables
partout, y compris depuis un téléphone.

Si `/admin` ne sert qu'à consulter la liste des brouillons, l'option **a** est la bonne : c'est
un outil d'écriture, il a sa place dans l'environnement d'écriture. Si l'usage nomade compte,
c'est l'option **c**, et il faut alors rétablir `admin-data/drafts.json` dans le transfert —
protégé par la même authentification.

## Risque

Nul pour l'option a (rien n'est perdu, tout reste en local). L'option c comporte un piège
identifié : tout fichier déposé dans la racine web qui ne vient pas du build est menacé par un
futur `--delete` élargi — d'où l'obligation de placer `.htpasswd` en dehors et de le référencer
par chemin absolu.

## Acceptance

- Aucune des trois pages n'est joignable anonymement, **ou** elles le sont toutes de façon
  fonctionnelle et délibérée.
- Aucune page d'auteur ne renvoie une erreur applicative à un visiteur.
- Les outils restent utilisables dans le contexte où j'en ai réellement besoin.
