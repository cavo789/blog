# Reader review : ubuntu-install

**Détecté :** 2026-08-09
**Article :** blog/2024/05/20/ubuntu-install/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **76 %** (preuve ligne 103 sur un corps de 96 lignes, T=30, E=126).
Drapeaux : aucun marqueur littéral (`<Prerequisite>` / `apt install` / `## Prerequisites`),
mais l'article démarre directement sur une étape de préparation Windows ("Turn off Bitlocker
first") avant tout résultat lié à Ubuntu.
Redondance : aucune, pas de répétition notable.

Test des 30 secondes : *"j'abandonne"* — le lecteur qui pèse encore le fait d'installer
Ubuntu sur une vieille machine tombe d'abord sur une manipulation Windows (désactiver
Bitlocker) avant toute preuve que l'installation vaut le coup. Le vrai "scoop" de
l'article — le bug Secure Boot / pilote NVIDIA à éviter — n'apparaît qu'à la ligne 79
(≈63 % du corps), et la capture "Installation is completed" seulement à la ligne 103.

## Risque

Le contenu le plus utile de l'article (l'avertissement NVIDIA/Secure Boot, qui a fait perdre
vingt minutes à l'auteur) est enterré aux deux tiers du texte, après plusieurs sections de
préparation. Un lecteur pressé qui a déjà installé un OS avant ne voit pas ce piège avant
d'y être potentiellement déjà confronté lui-même.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + TLDR (inchangé) | l. 24-28 |
| 2 | "Le résultat" : capture "Installation is completed" + AlertBox NVIDIA/Secure Boot en avant-première (le piège à éviter) | l. 79-85, 103 |
| 3 | "Turn off Bitlocker first" (inchangé) | l. 32-45 |
| 4 | "Download Ubuntu and create your bootable USB stick" (inchangé) | l. 47-53 |
| 5 | "Think to plug an Ethernet cable" (inchangé) | l. 55-57 |
| 6 | "Start the installation wizard" — sans redupliquer l'AlertBox NVIDIA déjà montrée en avant-première | l. 59-101 |
| 7 | "Reboot and enable Ubuntu Pro" (inchangé) | l. 105-113 |
| 8 | "Time to add software" (inchangé, sert déjà de conclusion) | l. 115-126 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
