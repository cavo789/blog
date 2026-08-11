# Reader review : wslg-rpd-connection

**Détecté :** 2026-08-11
**Article :** blog/2023/11/02/wslg-rpd-connection/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **31 %** (preuve ligne 62 sur un corps de 74 lignes, `<!-- truncate -->` l. 39).
La preuve est `./images/desktop.webp` — le bureau Xfce complet servi par xrdp, c'est-à-dire
exactement ce que le titre promet. Elle arrive après trois écrans de configuration.

Drapeaux : **install-avant-preuve**, et il est dans l'excerpt. Le `<Terminal>` des l. 32-37
(`sudo apt update && sudo apt -y upgrade`, `sudo apt-get install -y xrdp`) est **avant** le
truncate : sur la page d'index du blog, la vignette de l'article se termine sur une commande
d'installation, sans qu'aucun pixel de bureau Linux n'ait été montré.

Les trois éléments visuels antérieurs à la preuve ne prouvent rien :

- l. 43 `<Terminal source="./files/terminal-2.txt" />` — un bloc de `sed` sur `xrdp.ini`,
  aucune sortie ;
- l. 51 `rdp_localhost.webp` — la boîte de dialogue `mstsc.exe` où l'on tape `localhost:3390` ;
- l. 58 `authentication.webp` — l'écran de login.

Redondance : 🟢, rien de significatif.
Pas de `## Conclusion` : l'article s'arrête sur `settings_keyboard_belgian.webp`, une capture
de réglage de clavier belge.

Test des 30 secondes : **j'abandonne** — on me demande d'installer `xrdp`, de patcher
`xrdp.ini` au `sed` et de changer un numéro de port avant de m'avoir montré une seule fois à
quoi ressemble le résultat, alors que la capture existe déjà à 40 lignes plus bas.

## Risque

Le lecteur d'une minute repart avec l'impression d'un article de bricolage système (`sed` sur
un fichier de conf, conflit de port 3389/3390) et jamais avec l'image qui vend l'idée : un
bureau Xfce complet de son instance WSL2, dans une fenêtre Windows.

Le matériel est pourtant déjà écrit et déjà co-localisé :

- `desktop.webp` existe et est la meilleure preuve possible ;
- la l. 66 la commente déjà parfaitement (« *By default, you will just get a bash console and
  not the desktop as illustrated on the image above* ») — cette phrase est actuellement
  **après** l'image, comme une note de bas de page, alors qu'elle est la légende idéale ;
- l'article ne perd aucune section dans la réorganisation, il n'y a que des déplacements.

Second effet : le raccourci « `desktop.webp` = ce que donne xrdp » est faux tel quel. L'image
montre le bureau **après** `apt-get install xubuntu-desktop` + réécriture de `startwm.sh`
(l. 64-102). Placée en tête avec sa légende, elle devient la promesse honnête de l'article ;
placée l. 62 juste après l'écran d'authentification, elle laisse croire qu'elle arrive toute
seule.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Prose WSLg + les 3 `<Link>` internes (docker-run-linux-gui, docker-lubuntu, wsl-windows-explorer) — **sans** le `<Terminal>` d'installation | l. 26-30 |
| 2. `<!-- truncate -->` | — | l. 39 |
| 3. `## What an RDP Session Into WSL Actually Looks Like` | `desktop.webp` + la phrase « by default you just get a bash console, here is the full Xfce desktop » en légende, + une phrase de transition « four commands and one config file below » | image l. 62, légende l. 66 |
| 4. `## Get xrdp Running` | `apt update && apt -y upgrade` + `apt-get install -y xrdp`, puis le bloc `sed` port 3390 (`terminal-2.txt`) et son explication du conflit 3389, puis `sudo service xrdp start` | l. 32-37 (excerpt) + l. 41-49 |
| 5. `## Connect From Windows` | `mstsc.exe` + `localhost:3390`, `rdp_localhost.webp`, l'`AlertBox variant="caution"` sur le service arrêté, `authentication.webp` | l. 51-60 |
| 6. `## Get the Full Desktop Environment` | `apt-get install -y xubuntu-desktop xfce4 xfce4-goodies`, le choix `gdm3`/`lightdm`, les deux `<Snippet filename="/etc/xrdp/startwm.sh">`, `terminal-1.txt`, `service xrdp restart`, l'`AlertBox variant="info"` sur `service xrdp stop` | l. 64-102 |
| 7. `### Set your keyboard` | Inchangé, en sous-section de 6 | l. 105-113 |
| 8. `## Conclusion` | **À écrire** : rappel de la frustration d'ouverture (WSLg ne donne que des fenêtres isolées, ici on a le bureau entier), + un lien de sortie vers <Link to="/blog/docker-lubuntu">le bureau lubuntu dans Docker</Link> ou <Link to="/blog/wsl-windows-explorer">Explorer côté Linux</Link> pour qui n'a besoin que des fichiers | nouveau |

Note : les deux liens de référence externes (`nextofwindows.com`, `medium.com`) actuellement
en l. 19-20 (avant le TLDR) et l. 45 peuvent rester où ils sont ou être regroupés en fin de
section 4 ; ils ne pèsent pas sur le TTV.

Cible : time to value < 15 % — avec `desktop.webp` en section 3, la preuve tombe ~4 lignes
après le truncate, soit **~5 %**.
Structure de référence : `.claude/skills/blog-post-structure/SKILL.md`.
