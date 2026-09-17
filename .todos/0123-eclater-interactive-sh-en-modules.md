# 0123 — `interactive.sh` est devenu un god script, le découper en modules

- **Priority**: Medium — dette de structure, pas un bug ; à faire avant que le fichier ne grossisse encore
- **Batch**: devcontainer-scripts
- **Depends**: —
- **Files**: `.devcontainer/scripts/interactive.sh`, `.devcontainer/docker-entrypoint.sh`, `Dockerfile`, `.devcontainer/devcontainer.json`, `CLAUDE.md`

## Problème

`.devcontainer/scripts/interactive.sh` fait **579 lignes** et mélange trois responsabilités :

1. le *launcher* — sourcer, exporter les fonctions, afficher le cheatsheet au démarrage ;
2. le *moteur du cheatsheet* — `welcome()` et son double `awk` qui parse les annotations
   `@cat`/`@cmd`/`@desc` ;
3. **17 commandes métier** sans rapport entre elles, du serveur de dev à AnythingLLM.

Les trois plus grosses concentrent la moitié du fichier :

| Fonction | Lignes |
| -------- | ------ |
| `run_ci` (+ `_run_ci_links`) | 130 |
| `translate` | 93 |
| `questions` | 58 |
| `start` / `start_fr` / `static` | 93 |

Le fichier est déjà organisé en 7 catégories (`Server`, `Maintenance`, `Metadata`, `Ollama`,
`AnythingLLM`, `CI Parity`, `Translation`) : **le découpage est déjà écrit dans les annotations**,
il suffit de le matérialiser en fichiers.

## Solution proposée

Un sous-dossier, un fichier par catégorie, `interactive.sh` réduit à son rôle de launcher :

```text
.devcontainer/scripts/
  interactive.sh          # launcher : source les modules, exporte, appelle welcome
  helpers/
    _cheatsheet.sh        # welcome() + le parsing awk des annotations
    server.sh             # start, start_fr, static
    maintenance.sh        # build, upgrade, check, format
    metadata.sh           # tags, yaml, links
    ollama.sh             # eli5, faq, questions
    anythingllm.sh        # ai-index, ai-search
    ci.sh                 # run_ci, _run_ci_links
    translation.sh        # translate
```

Le nom `helpers/` a ma préférence sur `cheatsheet/` : le cheatsheet est **une** des
responsabilités (`_cheatsheet.sh`), pas la nature de l'ensemble.

## Les deux pièges à ne pas rater

**1. Il y a DEUX chemins de chargement, et ils ne pointent pas au même endroit.**

- `Dockerfile:144` fait `COPY --chmod=755 .devcontainer/scripts/interactive.sh /usr/local/bin/`,
  et `.devcontainer/docker-entrypoint.sh:6` fait `source "/usr/local/bin/interactive.sh"` ;
- `devcontainer.json:44` (`postCreateCommand`) ajoute au `.bashrc`
  `source /opt/docusaurus/.devcontainer/scripts/interactive.sh` — le fichier **bind-mounté**.

Donc le launcher doit résoudre ses modules **relativement à lui-même**, pas à un chemin en dur :

```bash
_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for _m in "${_dir}"/helpers/*.sh; do source "${_m}"; done
```

Et le `COPY` du Dockerfile doit passer du fichier au **dossier**, sinon l'image contient le
launcher sans ses modules et tout shell de l'image casse au démarrage.

**2. `welcome()` lit `${BASH_SOURCE[0]}` pour s'auto-parser.** Le double `awk` scanne
`readlink -f "${BASH_SOURCE[0]}"`, c'est-à-dire *son propre fichier*. Une fois les commandes
éclatées, il doit scanner **tous** les modules, sinon le cheatsheet se vide. C'est le test le plus
rapide de la migration : `welcome` doit toujours lister les 17 commandes.

## Critère d'acceptation

Chiffres relevés le 2026-09-17 sur le fichier actuel, à retrouver **à l'identique** après
découpage :

1. `grep -c '^# @cmd '` sur l'ensemble des modules donne **17**, et `welcome` affiche ces
   17 commandes réparties en **7 catégories**.
2. `declare -F` après un `source` liste les **19** fonctions actuellement exportées
   (les 17 commandes + `_run_ci_links` + `welcome`).
3. `docker compose build docusaurus` passe, et un shell neuf dans le conteneur affiche le
   cheatsheet — c'est le seul test qui couvre le chemin `/usr/local/bin/`.
4. `bash -c 'source .devcontainer/scripts/interactive.sh; start_fr'` fonctionne depuis le chemin
   bind-mounté.
5. `bash -n` sur chaque fichier, et aucun module ne dépasse ~120 lignes.

## Liens

- `0111` ajoute une fonction à `run_ci`. Aucune dépendance stricte dans un sens ou dans l'autre,
  mais faire les deux dans le même ordre évite un conflit : si 0123 passe d'abord, le code de 0111
  va dans `helpers/ci.sh`.
- Le fichier a déjà `export -f` pour chaque fonction — à répartir dans les modules ou à garder
  centralisé dans le launcher ; la seconde option documente mieux la surface publique.
