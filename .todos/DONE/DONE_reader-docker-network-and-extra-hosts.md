# Reader review : docker-network-and-extra-hosts

**Détecté :** 2026-08-11
**Article :** blog/2024/02/20/docker-extra-hosts/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **91 %** pour la vraie preuve (`extra_hosts` qui fonctionne, l. 172 `terminal-1.txt`,
sur un corps de 156 lignes après le `<!-- truncate -->` l. 30).
Mesure mécanique de complaisance : 11 % (l. 47, un `ls -alh` du dossier `/tmp/network`) — mais cette
sortie ne prouve rien du sujet de l'article, elle prouve qu'un `mkdir` a fonctionné.

Drapeaux : **abstraction-avant-preuve** — `<Snippet filename="index.php">` l. 43, `Dockerfile` l. 68,
`compose.yaml` l. 72 arrivent tous avant la moindre démonstration du sujet.

Redondance : le fait « deux conteneurs doivent être sur le même réseau » est énoncé **4 fois**
(AlertBox l. 105, AlertBox l. 137, texte l. 124, Conclusion point 1). 🟠

Test des 30 secondes : *j'abandonne* — le titre promet `extra_hosts`, et les 40 premières lignes du
corps me demandent de créer un dossier temporaire, un `index.php`, un réseau Docker et un conteneur
Apache avant d'avoir vu quoi que ce soit qui ressemble au sujet.

## Risque

Le lecteur d'une minute rate **la seule chose qu'il est venu chercher** : le bloc `extra_hosts` du
`compose.yaml` (l. 168) et la preuve que `curl http://mysite.local:8080` résout depuis le conteneur
(l. 172). Ces deux éléments existent déjà, entièrement rédigés, mais ils sont à 91 % de la page.

Le paradoxe : l'article est excellent en tant que *narration de débogage* (ça ne marche pas → pourquoi
→ ça marche), mais cette narration suppose que le lecteur ait déjà décidé de rester. Il ne l'a pas
encore décidé.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 1-30 |
| 2 | **`## The Two-Line Fix`** — le bloc `extra_hosts` du `compose.yaml`, puis immédiatement le `terminal-1.txt` qui montre `/etc/hosts` peuplé et le `curl` qui répond | l. 168-180 |
| 3 | `## Why It Works` — 3 puces sans code : même réseau obligatoire, Gateway IP, alias hôte invisible du conteneur | condensé de l. 105-108, 111-122, 143-152 (garder **une seule** formulation) |
| 4 | `## Some preparation work` — le décor complet (dossier, `index.php`, réseau, conteneur Apache) | l. 32-60, inchangé |
| 5 | `## Creating our second container` | l. 62-88 |
| 6 | `## When It Doesn't Work (and why)` — l'échec `bridge`, la Gateway IP, le second essai | l. 89-141 |
| 7 | `### Extra use case - aliases` — le cas complet avec le fichier `hosts` Windows et l'échec `Could not resolve host` | l. 143-166 |
| 8 | `## Conclusion` (inchangée, mais retirer le point 1 si déjà dit en mouvement 3) | l. 183-186 |

Note : le mouvement 2 réutilise `files/compose.part3.yaml` et `files/terminal-1.txt` tels quels — aucun
nouvel actif à produire.

Dédoublonnage : garder l'AlertBox l. 105 (la règle générale), supprimer l'AlertBox l. 137
(« Now it's working ») qui redit la même chose une section plus loin.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
