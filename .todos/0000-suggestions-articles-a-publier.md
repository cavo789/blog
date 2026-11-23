# Suggestions d'articles à publier

Backlog d'idées d'articles, distinct des TODOs "code" habituels : ce fichier n'est **pas** traité
par `/todos:run` ni listé par `/todos:plan` (exclu comme les journaux `0000-*.md`). Il vit tant qu'il y a
des idées, et n'est jamais archivé dans `DONE/`/`PARTIAL/` — une idée quitte le fichier dès que son draft
existe.

**Maintenu par** [`/suggestions:add`](../.claude/commands/suggestions/add.md) (ajoute une idée),
[`/suggestions:write`](../.claude/commands/suggestions/write.md) (choisit une ou plusieurs idées,
rédige le draft dans `.unpublished/`, puis **supprime** l'idée de ce fichier) et
[`/suggestions:iterate`](../.claude/commands/suggestions/iterate.md) (même chose, en autonomie, pour
toutes les idées). Peut aussi être édité à la main.

Une idée rédigée est supprimée, pas cochée : le draft fait foi, et ce fichier ne contient donc que
des idées encore à écrire.

## Statut

Le pipeline `.unpublished/` contient déjà une cinquantaine de drafts — le goulot est la publication,
pas l'idéation. Les idées ci-dessous restent donc à l'état de **proposition**, sans contenu rédigé,
jusqu'à ce qu'une soit explicitement choisie via `/suggestions:write`.

## Idées

### Série « Automate your tasks with n8n » (suite de `n8n-latest-ci-check`)

Chaque article part du workflow *Latest CI* construit dans le n°1 et y ajoute une pièce.

- **n8n : l'alerte sur le téléphone** — brancher la branche `true` du *If* sur ntfy / Telegram / e-mail (credentials dans l'UI).
- **n8n : recevoir les webhooks GitHub et GitLab** — le workflow `CI alerts` (normalise GitHub + GitLab, déjà écrit : `.unpublished/n8n-everyday/files/ci-alerts.json`, retiré de l'article n°1 avec sa démo) branché pour de vrai ; exposition HTTPS, `WEBHOOK_URL`, authentification du nœud Webhook.
- **n8n + Ollama** — nœuds Ollama de n8n : résumé RSS matinal, tri de mails, explication d'un log en échec ; lien avec la série « Ollama daily use ».
- **n8n : surveiller sa machine** — Schedule + contrôle disque / conteneur, alerte.
- **n8n : workflows dans Git** — export/import JSON, `n8n import:workflow`, une instance reconstruite à l'identique.
- **n8n au quotidien** — la fonction shell `n8n` (up/stop/logs/status) retirée de l'article n°1, déjà écrite et testée bash + zsh : `.unpublished/n8n-everyday/files/n8n.sh`.
