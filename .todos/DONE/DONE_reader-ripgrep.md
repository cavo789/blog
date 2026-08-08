# Reader review : ripgrep

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/07/06/ripgrep/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la comparaison grep/ripgrep déplacée en position 1, avant l'installation.

## Problème

Time to value : **14 %** (preuve — la comparaison côte à côte grep/ripgrep — en ligne 72 sur un
corps de 266 lignes après `<!-- truncate -->`), mais un drapeau plus grave passe devant.
Drapeaux : **install-avant-preuve** — le bloc `<Prerequisite install="sudo apt install
ripgrep -y">` (l.55-62) est lu avant toute démonstration concrète de ce que ripgrep apporte.
Redondance : aucune notable (le `<StepsCard>` final récapitule proprement sans dupliquer).

Test des 30 secondes : "on me demande d'installer un paquet avant de m'avoir montré en quoi
c'est mieux que grep" — la comparaison qui vend l'article (l.68-145) arrive après l'installation.

## Risque

La comparaison grep/ripgrep (l.68-145) est l'argument le plus fort de l'article — plus courte
syntaxe, `.gitignore` respecté nativement — et elle existe déjà, entièrement écrite. Elle est
juste placée après le bloc d'installation, qui n'a aucune valeur tant que le lecteur n'est pas
convaincu.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## ripgrep vs grep — A Side-by-Side Look` (comparaison, déplacée en premier) | l.68-145 |
| 2 | `## What is ripgrep?` (explication, zéro installation) | l.36-49 |
| 3 | `## Installation on Ubuntu / WSL2` (`<Prerequisite>` + astuce version récente) | l.51-66 |
| 4 | `## Configuration — ~/.ripgreprc` | l.147-161 |
| 5 | `## ZSH Setup — ~/.zshrc` | l.163-175 |
| 6 | `## ZSH Functions — ~/.zsh/fns/` | l.177-211 |
| 7 | `## Real-World Use Cases` | l.213-259 |
| 8 | `## Key Takeaways` (StepsCard, inchangé) | l.281-296 |
| 9 | `## Conclusion` (inchangée) | l.298-300 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
