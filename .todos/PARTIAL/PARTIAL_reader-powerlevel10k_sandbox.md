# Reader review : powerlevel10k_sandbox

**Détecté :** 2026-08-11
**Article :** blog/2023/12/31/powerlevel10k_sandbox/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — *aucune preuve dans l'article*. Le seul `<Terminal>` (l. 34,
`./files/terminal-1.txt`) contient la commande `docker run … alpine sh -uec 'apk add git zsh…'`,
c'est-à-dire une **instruction d'installation**, pas une sortie. Corps de 24 lignes (`T = 30`).
Drapeaux : install-avant-preuve (mécaniquement inévitable ici : il n'y a rien d'autre).
Redondance : 🟠 — « tester dans un conteneur puis jeter » énoncé **4 fois** (TLDR l. 21,
paragraphe « test and discard » l. 26, phrase « So, inside a Docker container… » l. 36,
`<AlertBox>` « Everything is done in RAM » l. 38).

Test des 30 secondes : *j'abandonne* — l'article s'appelle « Customize your Linux prompt with
Powerlevel10k » et **ne montre jamais le prompt**. On me demande de lancer un conteneur pour
« voir à quoi ça ressemble » (l. 36) alors qu'une capture répondrait à la question sur-le-champ.

## Risque

C'est le seul article du lot dont le correctif n'est pas uniquement un déplacement : **il manque
un asset**. Un article sur l'apparence d'un prompt qui ne montre pas ce prompt ne peut pas
convaincre. La liste « What I particularly like » (l. 44-50) décrit en mots six éléments visuels
— branche git, nom d'utilisateur, durée de la commande, code de sortie en rouge à droite — que
la moindre capture rendrait immédiatement évidents.

## Solution

**Prérequis :** produire un asset. Deux options, par ordre de préférence :

1. `./files/terminal-2.txt` — une capture textuelle du prompt Powerlevel10k dans le conteneur,
   montrant une branche git, un code de sortie non nul et une durée d'exécution (les trois
   points de la liste l. 44-50). Rendu par `<Terminal>`, cohérent avec le reste du blog.
2. `./images/p10k-prompt.webp` — une capture d'écran, seule façon de rendre les couleurs et les
   glyphes Nerd Font.

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook inchangé (personnaliser son prompt, Powerlevel10k et son wizard) + `<!-- truncate -->` | l. 24-30 |
| 2 | `## What Powerlevel10k Looks Like` — l'asset à produire, avec une légende nommant ce qu'on voit (branche git, exit code, durée) | **nouveau** + libellés issus de l. 44-50 |
| 3 | `## Try It Without Installing Anything` — le `<Terminal>` du `docker run` alpine, présenté comme le bac à sable jetable | l. 32-36 |
| 4 | `<AlertBox>` « Everything is done in RAM » — conservée ici, elle porte le fait neuf (image < 7 MB, rien sur le disque) | l. 38-42 |
| 5 | `## Why I Kept It` — la liste « What I particularly like », allégée des points déjà légendés en movement 2 | l. 44-52 |
| 6 | `## Conclusion` — que faire ensuite si ça plaît : le lien existant vers `zsh-install` (Oh-My-Zsh d'abord) puis le guide d'installation officiel | l. 26 + l. 42 + nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

## Status — PARTIAL (2026-08-11)

### Done

- Restructuration complète appliquée : `## What Powerlevel10k looks like` (mouvement 2),
  `## Try it without installing anything` (le `docker run` alpine), `<AlertBox>` « Everything is
  done in RAM » conservée, `## Why I kept it` (liste allégée), `## Conclusion` créée avec le
  renvoi vers `zsh-install` et le guide officiel.
- Dédoublonnage 🟠 traité : le « tester dans un conteneur puis jeter » n'est plus énoncé que dans
  le TLDR et le hook ; la phrase « So, inside a Docker container… » a été réécrite.
- Un asset **est** désormais affiché en mouvement 2 : `./images/p10k-prompt.webp`, copie de
  `blog/2024/03/28/zsh-install/images/powerlevel10k_prompt.webp` (capture authentique du prompt
  de Christophe). La légende ne décrit que ce qui est réellement visible : dossier, branche git
  `main`, marqueur `?1`, coche verte, `root@AVONTURE-RACOUR`, heure.

### Not done

- L'asset idéal décrit dans la solution — une capture montrant **un code de sortie non nul en
  rouge** et **la durée d'exécution d'une commande** — n'a pas été produit.
  **Reason:** ces deux éléments n'apparaissent sur aucune capture existante du blog, et les
  produire demande de lancer le conteneur Alpine du `docker run`, de répondre au wizard
  Powerlevel10k et de photographier le prompt (glyphes Nerd Font + couleurs). Cela ne peut pas
  être fait de façon fiable depuis une session non interactive ; c'est une capture d'écran à
  prendre à la main.
  La liste `## Why I kept it` mentionne toujours ces deux points en mots : ils resteront non
  illustrés tant que la capture n'est pas faite.
