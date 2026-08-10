# Reader review : zsh-install

**Détecté :** 2026-08-09
**Article :** blog/2024/03/28/zsh-install/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **17 %** en apparence (capture `zsh_install.webp` l. 50 sur un corps de 93
lignes) — mais c'est juste une bannière de bienvenue, pas la vraie promesse de l'article. La
preuve qui justifie le titre ("power up your terminal with Powerlevel10k") est le prompt
personnalisé final, qui n'apparaît qu'à **62 %** (`powerlevel10k_prompt_no_user.webp`, l. 92).
Drapeaux : **install-avant-preuve** (`apt-get install zsh` + script d'installation Oh-My-Zsh,
l. 41-43, avant toute capture).

Test des 30 secondes : le lecteur voit trois commandes d'installation avant de savoir à quoi va
ressembler son terminal une fois fini — l'accroche du TLDR (Powerlevel10k, `take`, `gst`) reste
une promesse abstraite pendant toute la première moitié de l'article.

## Risque

L'article contient déjà tout ce qu'il faut pour convaincre en un coup d'œil : le prompt
Powerlevel10k final (l. 78 et 92) est nettement plus vendeur que la bannière brute d'installation
(l. 50). Il est simplement enterré après deux sections d'installation (Zsh puis Powerlevel10k).

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : capture du prompt Powerlevel10k final (sans le username) | l. 92 |
| 2 | Pourquoi ça marche : 2-3 puces sur ce que Zsh + Oh-My-Zsh + P10k apportent (auto-complétion, thème, plugins) — zéro commande | à rédiger, s'appuyer sur l. 26, 30 |
| 3 | Installation : Zsh + Oh-My-Zsh (3 commandes) | l. 38-50 |
| 4 | Installation : Powerlevel10k + assistant de configuration | l. 58-74 |
| 5 | Personnalisation : masquer le username | l. 84-92 |
| 6 | Fonctionnalités du quotidien (`take`, `cd ...`, alias git) — déjà bien placées en fin d'article | l. 94-127 |

Cible : time to value < 15 % sur la vraie preuve (le prompt final), pas sur une capture
intermédiaire. Structure de référence : `.claude/skills/blog-post-structure/SKILL.md`.
