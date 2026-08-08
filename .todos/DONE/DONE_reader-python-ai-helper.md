# Reader review : python-ai-helper

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/12/31/python-ai-helper/index.md (actuellement `.unpublished/python-ai-helper/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Squelette manquant écrit (accroche, `<!-- truncate -->`, `description` en frontmatter, Conclusion) et contenu existant réorganisé. La preuve promise a été produite réellement : l'image Docker `cavo789/ai-agent` a été construite et exécutée contre un vrai script Python (via le modèle `qwen2.5-coder:7b` déjà pullé sur l'instance Ollama de ce host) — docstring générée avec succès, test généré et exécuté par pytest (1 passed, 1 failed, l'échec étant une vraie erreur de calcul du modèle) — capturée dans `files/terminal_run.txt`.

## Problème

Time to value : **100 %** — aucune preuve nulle part dans les 64 lignes du fichier. Cas
particulier du lot : l'article n'a ni `<TLDR>`, ni accroche, ni `<!-- truncate -->`, ni
`## Conclusion`, et le frontmatter n'a même pas de champ `description`. Ce n'est pas un article
mal ordonné, c'est un brouillon à l'état de notes (commande + breakdown de flags), qui manque des
briques de base plutôt que d'avoir les bonnes briques au mauvais endroit.

Test des 30 secondes : "j'abandonne" — dès la première ligne, le lecteur voit une commande à
construire/lancer (`make build && clear && make run ...`) sans savoir ce que l'outil fait, pour
qui, ni pourquoi — aucune preuve d'un docstring généré ou d'un test généré nulle part dans le
fichier.

## Risque

Le contenu existant (la commande `docker run`, le breakdown détaillé de chaque flag) est du bon
matériel pour une section "Under the Hood" — mais publié tel quel, l'article n'a rien qui
ressemble aux six autres mouvements attendus (accroche, résultat, pourquoi ça marche, installation
présentée comme telle, plus de démos, conclusion).

## Solution

Contrairement aux autres TODO de ce lot, ce n'est pas un réordonnancement : il faut d'abord écrire
le squelette manquant, puis y intégrer le contenu existant tel quel. Rien n'est à jeter.

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | **À rédiger** : accroche (frustration réelle — documenter/tester du code Python sans y passer des heures) + promesse en une phrase | nouveau contenu |
| 2 | Ajouter `<!-- truncate -->` après l'accroche | nouveau (marqueur) |
| 3 | **À rédiger** : `## What ai-agent Does For You` — la commande `docker run` (déjà existante) suivie d'une preuve réelle : un extrait de docstring généré, ou la sortie de `pytest` sur un test généré | commande existante (l. 20-25) + preuve à ajouter |
| 4 | **À rédiger** : 3-5 puces "pourquoi ça marche" (docstring + tests + exécution immédiate via `--run-tests`, sans code custom) | synthèse à partir de l. 56-64 (existant, reformulé) |
| 5 | `## Command Line Explained` → renommer en section "Under the Hood (skip this if you just want to use it)" | l. 34-64 (existant, déplacé tel quel) |
| 6 | **À rédiger** : `## Conclusion` — ce qu'on retient, lien vers l'article suivant de la série IA | nouveau contenu |
| 7 | Ajouter `description:` au frontmatter | frontmatter (existant, à compléter) |

Cible : time to value < 15 %, une fois les mouvements manquants écrits. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
