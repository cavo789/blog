# Reader review : gitlab-docker-out-of-docker

**Détecté :** 2026-08-08
**Article :** blog/2025/06/15/gitlab-docker-out-of-docker/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — aucune preuve n'existe dans le corps de l'article. Ni `<Terminal>`
montrant une sortie, ni capture d'écran, nulle part entre `<!-- truncate -->` (l.38) et la fin
(l.97). Le corps entier n'est que des `<Snippet>` de fichiers de configuration
(`config.toml`, `.gitlab-ci.yml`) et des `<AlertBox>` explicatifs.
Drapeaux : **install-avant-preuve** (il n'y a même pas de preuve à précéder — tout est
configuration) ; **abstraction-avant-preuve** — quatre `<Snippet>` avant la moindre
démonstration que ça fonctionne.
Redondance : "docker socket" / "docker.sock" cité 6 fois — 🔴, concentré sur le même fait (il
faut partager le socket) répété dans le texte, l'`<AlertBox>` et le TLDR.

Test des 30 secondes : "on m'explique un fichier `config.toml` de runner GitLab que je n'ai
même pas sous les yeux dans mon propre projet, et je n'ai toujours pas vu un job CI qui
utilise réellement `docker run` avec succès" — rien ne prouve que la configuration proposée
marche.

## Risque

Le TLDR promet la solution mais le corps ne contient aucune preuve du résultat (un job CI qui
exécute `docker run` avec succès grâce au Docker Socket Passthrough). Sans capture du log de
pipeline GitLab montrant la commande `docker run ... phplint .` s'exécuter dans le job, le
lecteur doit croire sur parole que la configuration fonctionne.

## Solution

**Contrairement aux autres fiches de ce lot, un simple réordonnancement ne suffit pas ici : il
manque une preuve à déplacer.** Capturer un extrait du log de pipeline GitLab (ou un
`<Terminal>` reproduisant la sortie du job) montrant le `docker run --rm --volume
"$CI_PROJECT_DIR:/app" ... jakzal/phpqa phplint .` s'exécuter avec succès depuis le container CI,
puis réordonner :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | **Nouvelle preuve** — extrait de log de pipeline GitLab montrant le job DooD réussir | à créer |
| 2 | `## Why it works` — 3-4 puces sans code : Docker Socket Passthrough, partage du dossier `builds`, pas besoin de Docker-in-Docker complet | nouveau, condensé depuis l.87-96 |
| 3 | `## The runner configuration file` (accès serveur requis) | l.42-50 |
| 4 | `## Understanding the process` (exemple simple sans DooD) | l.52-62 |
| 5 | `## Running Docker-out-of-Docker` (configuration complète + explication `$CI_PROJECT_DIR`) | l.64-96 |
| 6 | `## Conclusion` — à ajouter, l'article n'en a pas actuellement | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
