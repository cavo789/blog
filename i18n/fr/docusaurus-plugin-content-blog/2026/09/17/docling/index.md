---
slug: docling
title: Docling - Convertir PDF, Word, PowerPoint, Excel et HTML en Markdown, avec accélération GPU
authors: [christophe, claude]
image: /img/v2/docling.webp
mainTag: markdown
tags: [docker, markdown, python, ai, doc-as-code]
date: 2026-09-17
description: 'Une image Docker batteries-included pour Docling, la bibliothèque de conversion de documents d''IBM : PDF, Word, PowerPoint, Excel et HTML convertis en Markdown propre, avec accélération GPU pour les machines qui ont de la VRAM en rab. Un compagnon de mon article sur Markitdown — même idée, un moteur bien plus lourd en dessous.'
language: fr
ai_assisted: true
---
![Docling - Convertir PDF, Word, PowerPoint, Excel et HTML en Markdown, avec accélération GPU](/img/v2/docling.webp)

<!-- cspell:ignoreCase docling markitdown nvidia cudnn -->

<TLDR>
Cet article fait pour [Docling](https://github.com/docling-project/docling) exactement ce que <Link to="/blog/markitdown">mon article sur Markitdown</Link> faisait pour Markitdown : une image Docker batteries-included et un script wrapper global `docling-convert`, pour que convertir un document en Markdown propre tienne en une commande depuis n'importe quel dossier. **La différence est sous le capot — Docling utilise des modèles dédiés de mise en page, de structure de tableaux et d'OCR au lieu de parsers spécifiques à chaque format, tourne sur GPU si vous en avez un, et a été conçu dès le départ pour exactement le scénario « document sensible, doit rester en local » sur lequel ce blog revient sans arrêt.**
</TLDR>

Un ami qui lisait <Link to="/blog/markitdown">mon article sur Markitdown</Link> m'a suggéré d'essayer [Docling](https://docling.ai/) à la place — projet open source, IBM cette fois, même promesse « convertir des documents bureautiques en Markdown », mais construit autour de vrais modèles de compréhension de mise en page plutôt que de parsers format par format. J'ai 24 Go de VRAM qui dorment sur mon serveur IA ; si un outil peut les mettre au travail pour transformer un PDF mal scanné en quelque chose de lisible, ça vaut dix minutes de test.

<!-- truncate -->

## Convertir cinq formats {#converting-five-formats}

Une fois l'image et le wrapper global en place (on voit ça plus bas), convertir un document tient en une commande :

<Terminal source="./files/terminal-1.txt" typewriter />

PDF, DOCX, PPTX, XLSX et HTML, cinq appels distincts à `docling-convert`, cinq fichiers `.md` propres posés à côté de leurs originaux — pas d'export-vers-Markdown manuel dans Word ou PowerPoint, pas de convertisseur en ligne à qui confier le contenu.

## Ce que Docling fait différemment {#what-docling-does-differently}

<AlertBox variant="info" title="Même sortie, un moteur très différent">
**Pour tous les formats de cet article sauf le PDF** — `.docx`, `.xlsx`, `.pptx` et `.html` — Docling fait ce que fait n'importe quel autre convertisseur : il lit le fichier avec une bibliothèque Python spécifique au format et parcourt le résultat. Rien d'exotique, aucun modèle chargé, et **rien qui nécessite un GPU** — `--pipeline vlm` est tout simplement ignoré sur ces quatre-là.

C'est sur le PDF que ça diverge. Un PDF n'a aucune structure à parcourir : c'est un sac de glyphes à des coordonnées, et chaque convertisseur doit *deviner* où étaient les paragraphes, les titres et les tableaux. Docling le devine avec des modèles — un pour la mise en page, un pour la structure des tableaux, un pour l'OCR, et optionnellement un modèle vision-langage qui lit la page rendue comme le ferait un humain. C'est ce dernier qui justifie la présence d'un GPU dans cet article.
</AlertBox>

Comme toujours, je commence par construire une image Docker — pas de Python, pas de `pip`, rien d'installé globalement sur ma machine.

## Installation {#installation}

### Créer notre image Docker {#create-our-docker-image}

Créons un nouveau dossier et plaçons-nous dedans : `mkdir -p /tmp/docling && cd $_`

Créez ensuite un nouveau fichier appelé `Dockerfile` :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

`ARG DOCLING_VERSION` fige la release exacte au lieu de laisser `pip` attraper la plus récente au moment du build — Docling sort une nouvelle version tous les deux ou trois jours, et un build non figé donne une image différente à chaque reconstruction. Incrémentez cet `ARG` quand vous voulez réellement la plus récente.

<AlertBox variant="note" title="Un nom de package, toute une liste de courses derrière">
Depuis le printemps 2026, `docling` sur PyPI est un simple métapackage : l'installer tire `docling-slim[standard]`, et *c'est lui* qui amène les backends PDF, DOCX, PPTX, XLSX et HTML, PyTorch et les modèles de mise en page. Un simple `pip install docling` couvre donc toujours les cinq formats dont parle cet article, sans extras à retenir — mais c'est aussi pour ça que l'image est lourde. Si vous ne convertissez jamais que du `.docx`, par exemple, `pip install "docling-slim[cli,format-docx,models-local]"` vous donne une image bien plus légère ; la liste complète des extras se trouve sur [la page PyPI du projet](https://pypi.org/project/docling-slim/).
</AlertBox>

### Construire l'image {#build-the-image}

Contrairement à <Link to="/blog/markitdown">Markitdown</Link>, ce setup n'a pas besoin de `compose.yaml` : le container n'est jamais lancé via Compose. Les conversions passent par le script wrapper ci-dessous, qui doit monter le répertoire où vous vous trouvez — ce qu'un fichier Compose posé dans `/tmp/docling` ne peut pas faire. Un simple build suffit donc :

<Terminal wrap={true} typewriter>
$ docker build -t docling .
</Terminal>

Attendez-vous à ce que ce build soit nettement plus long que celui de Markitdown : PyTorch, ses bibliothèques CUDA embarquées et les quatre modèles intégrés donnent ici une image de 8,3 Go. Ces modèles sont la partie qui mérite l'attention — ils sont téléchargés une fois, au moment du build, et vivent *dans* l'image, donc un container `--rm` démarre avec tout ce qu'il lui faut et ne télécharge rien.

Optionnellement, si vous voulez vérifier que l'image est correcte, lancez simplement `docker run --rm docling --help` — [la documentation](https://docling-project.github.io/docling/) couvre chacun des flags listés.

### Créer le wrapper global {#create-the-global-wrapper}

Même schéma que `md-convert`, adapté à la forme réelle de la CLI de Docling. Lancez `sudo vi /usr/local/bin/docling-convert` et collez-y le contenu ci-dessous :

<Snippet filename="/usr/local/bin/docling-convert" source="./files/docling-convert.sh" />

Rendez-le exécutable : `sudo chmod +x /usr/local/bin/docling-convert`.

<AlertBox variant="note" title="Pourquoi un wrapper ?">
Le script sonde `docker info` à la recherche du runtime NVIDIA avant d'ajouter `--gpus all`. Cette vérification n'est pas décorative : `docker run --gpus all` ne se dégrade pas poliment sur une machine sans le toolkit, il refuse carrément de démarrer le container. Avec la sonde, le même script fonctionne sur mon serveur GPU et sur mon portable — plus lent sur le portable, c'est tout, et rien à configurer ni d'un côté ni de l'autre. Mettre ce runtime en place est optionnel, et c'est la fin de cet article.
</AlertBox>

Laissé à lui-même, Docling raconte chaque exécution — sélection du moteur, chargement des modèles, comptage de tokens, une vingtaine de lignes `INFO` pour convertir une seule page — d'où le `--quiet` passé par le wrapper. Ce n'est pas une impasse : Docling ignore `--quiet` dès que `-v` est présent, donc `docling-convert report.pdf -v` ramène tout le log le jour où quelque chose déraille vraiment. Les deux variables `TRANSFORMERS_*` et `HF_HUB_*` du Dockerfile finissent le travail en faisant taire la pile de modèles en dessous, qui a ses propres idées sur les barres de progression.

### Première conversion {#first-conversion}

Il est temps de vérifier que toute la chaîne tient. Les cinq fichiers utilisés tout au long de cet article sont ici — un document, un court bon de livraison, exprimé de cinq façons, pour voir ce que chaque format coûte sur le chemin du Markdown plutôt que de comparer cinq choses sans rapport :

<DownloadButton file="/files/docling/samples.zip" label="samples.zip — les cinq fichiers" title="report.pdf, contract.docx, slides.pptx, budget.xlsx, page.html" />

Vous préférez rester dans le terminal ? L'archive est à une URL fixe, donc `curl` la récupère directement dans le dossier `/tmp/docling` créé plus tôt — dézippée dans un sous-dossier `samples`, pour garder les cinq documents à l'écart du `Dockerfile` déjà présent :

<Terminal title="La première vraie conversion" source="./files/terminal-first-run.txt" typewriter />

`report.md` atterrit à côté de `report.pdf`, titre et paragraphes intacts — aucun dossier de sortie à nommer, aucune redirection à retenir.

Deux choses méritent l'attention ici. La première : `docling-convert report.pdf` a pris quatorze secondes. La seconde : la liste de flags affichée sous le résultat. Elle apparaît sous chaque conversion PDF, les options que vous avez déjà passées en disparaissent, les quatre autres formats n'ont droit à aucun conseil, et `DOCLING_CONVERT_NO_TIP=1` la coupe définitivement.

Reste la question évidente : qu'est-ce que ces quatorze secondes achètent ?

### Pourquoi le pipeline lent est celui par défaut {#why-the-slow-pipeline-is-the-default}

Docling peut lire un PDF de deux façons. Le pipeline standard détecte les régions, en extrait le texte et le réassemble. Le pipeline `vlm` confie la page rendue à un petit modèle vision-langage — GraniteDocling, 258M de paramètres — et lui demande d'en décrire la structure, comme le ferait quelqu'un qui lit la page. C'est celui qu'utilise le wrapper, et voici `report.pdf` — quatre paragraphes justifiés sous un titre en police display — passé dans les deux :

<Terminal title="Pipeline standard vs VLM, même fichier" source="./files/terminal-pipelines.txt" wrap={false} />

Regardez la première ligne du pipeline standard. `Quarterly Delivery Note d titiitl iltil`, suivi d'un `yy` égaré — l'étape OCR s'est déclenchée sur le grand titre et a halluciné des lettres qui n'existent dans aucune version de ce document. Ensuite il a coupé la première proposition en deux, laissant `which is intended to replace it entirely.` seul sur sa ligne. Le VLM n'a produit ni le texte inventé ni l'orphelin. Quatorze secondes contre huit, c'est le prix, et ça achète un fichier que vous pouvez transmettre à quelqu'un sans le relire.

Le chemin rapide n'échoue pas bruyamment : il invente, et le texte inventé ne se détecte qu'en relisant la sortie.

<AlertBox variant="caution" title="Une vraie différence avec md-convert">
Markitdown écrit le Markdown sur stdout, donc `md-convert file.docx > file.md` est la façon de le capturer. La CLI de Docling écrit `<basename>.md` directement dans le répertoire de sortie — il n'y a pas de mode stdout. `docling-convert file.docx` produit `file.md` juste à côté ; aucune redirection `>` nécessaire, et aucune ne fonctionnera.
</AlertBox>

### Un mot sur les images {#a-word-on-images}

Docling rend tout ce que le modèle de mise en page classe comme image — et sur un titre composé en police display, ça peut être le titre lui-même. Laissé à lui-même, il intègre ensuite chacune d'elles dans le Markdown sous forme d'URI `data:` en base64, ce qui garde le fichier autonome et le gonfle énormément. Le wrapper passe plutôt `--image-export-mode referenced` : les images atterrissent comme de vrais fichiers PNG dans un dossier `budget_artifacts/` à côté de `budget.md`, liés en relatif, pour que les deux voyagent ensemble.

Les deux autres modes sont à un flag de distance. `--image-export-mode placeholder` *supprime* les images et laisse un marqueur `<!-- image -->` là où chacune se trouvait — le bon choix quand le Markdown va alimenter un modèle plutôt qu'un humain. `--image-export-mode embedded` ramène le base64, quand vous voulez un document unique et autonome. Une chose à savoir si vous appelez un jour Docling sans le wrapper : ces liens sont relatifs grâce à `--output .`, et un `--output` absolu écrit les chemins internes du container, qui ne résolvent vers rien à l'extérieur.

## Optionnel — Mettre un GPU derrière le pipeline PDF {#optional--putting-a-gpu-behind-the-pdf-pipeline}

Tout ce qui précède fonctionne sans GPU, et cette section est facultative — deux fois plutôt qu'une :

- **Vous ne convertissez que du `.docx`, `.xlsx`, `.pptx` ou `.html` ?** Alors ça ne vous apporte strictement rien. Ces quatre formats ne chargent aucun modèle, il n'y a donc rien à accélérer ; `--gpus` ne change ni la vitesse ni la sortie.
- **Vous convertissez des PDF sur une machine sans carte NVIDIA ?** Ça fonctionne quand même. `--device auto` retombe sur le CPU, le même pipeline VLM tourne, et le même Markdown sort — c'est juste plus long. Le wrapper affiche le temps écoulé à chaque exécution, donc votre propre matériel vous dira combien de temps en plus.

Recommandé pour les PDF, inutile pour les quatre autres, obligatoire pour personne.

### Pourquoi un toolkit est nécessaire {#why-a-toolkit-is-needed-at-all}

Un container ne voit pas votre carte graphique. La carte, sa VRAM et le *driver* NVIDIA vivent sur l'host ; un container n'a ni `/dev/nvidia*` dans sa liste de devices, ni les bibliothèques du driver dans son système de fichiers. Les bibliothèques CUDA que `pip` a installées dans notre image — le wheel `torch` embarque les siennes, c'est pourquoi le Dockerfile part d'un simple `python:3.12-slim-trixie` et non d'une base `nvidia/cuda` — ne sont que la moitié *supérieure* de cette pile : elles parlent au driver, elles ne le remplacent pas. Sans la moitié inférieure, PyTorch ne signale aucun device CUDA et calcule sur le CPU.

Le [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) est la pièce qui relie les deux moitiés : il enregistre un hook dans le daemon Docker qui, à chaque démarrage de container avec `--gpus`, y injecte les nœuds de device GPU et les bibliothèques du driver de l'host. C'est toute la raison de sa présence dans cet article — **pas de toolkit, pas de VRAM**. Installez-le sur l'host Docker, jamais dans l'image, puis vérifiez que le GPU est visible depuis l'intérieur d'un container :

<Terminal title="Vérifier le passthrough GPU" source="./files/terminal-gpu-check.txt" typewriter wrap={false} />

Ce tableau, c'est la carte de l'host lue depuis *l'intérieur* d'un container : 24 Go de VRAM, version du driver, ce qui l'utilise actuellement. L'image `nvidia/cuda` n'est là qu'un support pratique pour `nvidia-smi` — notre propre image n'en a pas besoin.

### Si ce tableau n'apparaît pas {#if-that-table-doesnt-show-up}

Rien n'est cassé : `docling-convert` continue de convertir, sur le CPU, exactement comme durant tout l'article. Si vous voulez vraiment le GPU, trois échecs couvrent presque tous les cas :

| Ce que vous obtenez à la place                                 | Ce que ça veut dire                                                                                           | Quoi faire                                                                                                                                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `could not select device driver "" with capabilities: [[gpu]]` | Docker n'a pas de hook GPU : le toolkit n'est pas installé, ou installé sans jamais avoir été branché au daemon | Installez le toolkit depuis [le repository de packages de NVIDIA](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html), puis lancez les deux commandes ci-dessous |
| `nvidia-smi` échoue **sur l'host aussi**, hors de tout container | Le driver lui-même est absent ou cassé — Docker n'est pas encore en jeu                                        | Installez le driver et redémarrez jusqu'à ce que `nvidia-smi` fonctionne sur l'host. Sous WSL2, ce driver est un driver **Windows** : installez-le sur Windows, jamais dans la distribution |
| `Failed to initialize NVML: Unknown Error`                     | Le hook s'est exécuté, mais le device a été refusé au container — un daemon qui tourne encore avec sa configuration d'avant le toolkit | Les deux commandes ci-dessous                                                                                                                                                         |

Deux de ces trois cas se règlent de la même façon, parce que le package ne fait que poser le hook sur le disque — encore faut-il en informer le daemon :

<Terminal title="Brancher le toolkit dans Docker" source="./files/terminal-gpu-fix.txt" wrap={false} />

Cette dernière commande est exactement la sonde que le script wrapper exécute avant d'ajouter `--gpus all` : dès que `nvidia` apparaît parmi les runtimes de Docker, le PDF suivant passe par le GPU sans rien d'autre à changer.

## Ce que coûtent les cinq fichiers {#what-the-five-files-cost}

Chaque chiffre de cet article a été mesuré sur les fichiers que vous avez dézippés plus haut, et les cinq commandes du tout premier terminal tournent dessus telles quelles. Sur ma machine, les quatre formats bureautiques prennent quatre à cinq secondes chacun, quasi entièrement du démarrage de processus, et `report.pdf` prend quatorze secondes avec le GPU en jeu. Cet écart résume tout : seul le PDF a besoin des modèles.

<AlertBox variant="note" title="Ce que montre vraiment le tableur">
Les cellules fusionnées ne sont pas condensées, elles sont *répétées* : le titre ressort une fois par colonne qu'il couvrait, et chaque ligne de section aussi. Rien n'est perdu, mais n'attendez pas du Markdown qu'il reproduise la fusion visuelle. Et Docling lit les formules, pas leurs résultats — un tableur écrit par un script et jamais ouvert dans Excel se convertit avec tous les totaux vides. C'est pour ça que `budget.xlsx` stocke les valeurs calculées.
</AlertBox>

## À retenir {#key-takeaways}

<StepsCard
  variant="remember"
  title="docling-convert : référence rapide"
  steps={[
    { content: "**Le GPU est optionnel** — `--device auto` retombe proprement sur le CPU si le passthrough n'est pas configuré" },
    { content: "**Un package, cinq formats** — `pip install docling` tire `docling-slim[standard]`, qui couvre PDF, DOCX, PPTX, XLSX et HTML" },
    { content: "**Les modèles sont intégrés** — téléchargés au build, donc un container non privilégié en lecture seule n'a jamais rien à récupérer" },
    { content: "**Écrit des fichiers, pas sur stdout** — `docling-convert file.pdf` produit `file.md` directement, pas de redirection `>`" },
    { content: "**Lent volontairement** — `--pipeline vlm` garde paragraphes et titres intacts ; ajoutez `--pipeline standard` quand la vitesse prime" },
    { content: "**Seuls les PDF ont besoin des modèles** — `.docx`/`.xlsx`/`.pptx`/`.html` passent par un simple parser, sans GPU ni modèle" }
  ]}
/>

## Conclusion {#conclusion}

Entre ceci et <Link to="/blog/markitdown">Markitdown</Link>, j'ai maintenant deux images Docker qui transforment des documents bureautiques en Markdown sans qu'un seul octet ne quitte ma machine — une légère que j'attrape par réflexe, et celle-ci, plus lourde, pour quand la structure d'un PDF mérite qu'on y consacre vingt secondes et un GPU. Et comme les deux produisent du Markdown brut, l'une comme l'autre s'insère directement dans le genre de pipeline que je décrivais dans <Link to="/blog/anythingllm-chat-with-your-docs">Discuter avec vos documents grâce à AnythingLLM</Link> — ou dans le prochain article de la série « Ollama daily use », où ce Markdown devient l'entrée d'un pipeline local de traduction et de résumé, pour des documents qui n'avaient de toute façon rien à faire dans le cloud.
