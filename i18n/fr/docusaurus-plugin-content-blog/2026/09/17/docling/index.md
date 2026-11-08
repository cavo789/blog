---
slug: docling
title: Docling - Convertir PDF, Word, PowerPoint, Excel et HTML en Markdown, accéléré par GPU
authors: [christophe, claude]
image: /img/v2/docling.webp
mainTag: markdown
tags: [docker, markdown, python, ai, doc-as-code]
date: 2026-09-17
description: "Une image Docker batteries-included pour Docling, la bibliothèque de conversion de documents d'IBM : PDF, Word, PowerPoint, Excel et HTML transformés en Markdown propre, avec accélération GPU pour les machines qui ont de la VRAM en rab. Un complément à mon article Markitdown — même idée, un moteur plus lourd en dessous."
language: fr
ai_assisted: true
updates:
  - date: 2026-11-08
    note: "docling-convert is now a shell function for zsh and bash (~/.zsh/fns or ~/.bash/fns); the Dockerfile and the conversion script live in ~/tools/docling."
---
![Docling - Convertir PDF, Word, PowerPoint, Excel et HTML en Markdown, accéléré par GPU](/img/v2/docling.webp)

<!-- cspell:ignoreCase docling markitdown nvidia cudnn -->

<TLDR>
Cet article fait pour [Docling](https://github.com/docling-project/docling) exactement ce que <Link to="/blog/markitdown">mon article sur Markitdown</Link> faisait pour Markitdown : une image Docker batteries-included et une fonction shell `docling-convert` pour zsh ou bash, afin que convertir un document en Markdown propre tienne en une commande depuis n'importe quel dossier. **La différence est sous le capot — Docling utilise des modèles dédiés de layout, de structure de tableaux et d'OCR plutôt que des parsers spécifiques à chaque format, tourne sur GPU si vous en avez un, et est conçu dès le départ exactement pour le scénario « document sensible, qui doit rester en local » auquel ce blog revient sans cesse.**
</TLDR>

Un ami qui lisait <Link to="/blog/markitdown">mon article sur Markitdown</Link> m'a suggéré d'essayer [Docling](https://docling.ai/) à la place — projet open source, du côté d'IBM cette fois, même promesse « convertir des documents bureautiques en Markdown », mais construit autour de vrais modèles de compréhension de mise en page plutôt que de parsers par format. J'ai 24 Go de VRAM qui dorment sur mon serveur IA ; si un outil peut les mettre au travail pour transformer un PDF mal scanné en quelque chose de lisible, ça vaut dix minutes de test.

<!-- truncate -->

## Convertir cinq formats {#converting-five-formats}

Une fois l'image et la fonction `docling-convert` en place (on voit ça plus bas), convertir un document tient en une commande :

<Terminal source="./files/terminal-1.txt" typewriter />

PDF, DOCX, PPTX, XLSX et HTML, cinq appels distincts à `docling-convert`, cinq fichiers `.md` propres posés à côté de leurs originaux — pas d'export-vers-Markdown manuel dans Word ou PowerPoint, pas de convertisseur en ligne à qui confier le contenu.

## Ce que Docling fait différemment {#what-docling-does-differently}

<AlertBox variant="info" title="Même sortie, un moteur très différent">
**Pour tous les formats de cet article sauf le PDF** — `.docx`, `.xlsx`, `.pptx` et `.html` — Docling fait ce que fait tout autre convertisseur : il lit le fichier avec une bibliothèque Python dédiée au format et parcourt le résultat. Rien d'exotique, aucun modèle chargé, et **rien qui nécessite un GPU** — `--pipeline vlm` est simplement ignoré sur ces quatre-là.

C'est sur le chemin PDF que ça diverge. Un PDF n'a aucune structure à parcourir : c'est un sac de glyphes à des coordonnées, et chaque convertisseur doit *deviner* où se trouvaient les paragraphes, les titres et les tableaux. Docling le déduit avec des modèles — un pour la mise en page, un pour la structure des tableaux, un pour l'OCR, et en option un modèle vision-langage qui lit la page rendue comme le ferait un humain. C'est ce dernier qui justifie la présence d'un GPU dans cet article.
</AlertBox>

Comme toujours, je vais d'abord construire une image Docker — pas de Python, pas de `pip`, rien d'installé globalement sur ma machine.

## Installation {#installation}

### Créer notre image Docker {#create-our-docker-image}

Deux fichiers obtiennent un emplacement permanent, `~/tools/docling`, pour que l'image puisse être reconstruite à tout moment (nouvelle machine, `docker image prune`, nouvelle version de Docling) : le `Dockerfile`, et `docling-convert.sh`, le script qui pilote une conversion (détaillé plus bas) :

<ProjectSetup folderName="~/tools/docling" createFolder={true}>
  <Guideline>
    Maintenant, lancez 'docker build -t docling ~/tools/docling' pour créer l'image Docker.
  </Guideline>
<Snippet filename="Dockerfile" source="./files/Dockerfile" />
<Snippet filename="docling-convert.sh" source="./files/docling-convert.sh" defaultOpen={false} />
</ProjectSetup>

`ARG DOCLING_VERSION` fige la release exacte au lieu de laisser `pip` attraper la plus récente au moment du build — Docling sort une nouvelle version tous les quelques jours, et un build non figé donne une image différente à chaque reconstruction. Montez cet `ARG` quand vous voulez réellement la plus récente.

<AlertBox variant="note" title="Un nom de package, toute une liste de courses derrière">
Depuis le printemps 2026, `docling` sur PyPI est un metapackage léger : l'installer tire `docling-slim[standard]`, et c'est *ça* qui amène les backends PDF, DOCX, PPTX, XLSX et HTML, PyTorch et les modèles de layout. Donc un simple `pip install docling` couvre toujours les cinq formats dont parle cet article, sans extras à retenir — mais c'est aussi pour ça que l'image est lourde. Si vous ne convertissez jamais que du `.docx`, par exemple, `pip install "docling-slim[cli,format-docx,models-local]"` vous donne une image beaucoup plus petite ; la liste complète des extras est sur [la page PyPI du projet](https://pypi.org/project/docling-slim/).
</AlertBox>

### Construire l'image {#build-the-image}

Pas de `compose.yaml` ici : les conversions passent par une fonction shell qui monte le répertoire dans lequel vous vous trouvez, ce qu'un fichier Compose posé dans un dossier fixe ne peut pas faire. Un simple build suffit donc :

<Terminal wrap={true} typewriter>
$ docker build -t docling ~/tools/docling
</Terminal>

Attendez-vous à ce que celui-ci soit nettement plus long que celui de Markitdown : PyTorch, ses bibliothèques CUDA embarquées et les quatre modèles intégrés montent à une image de 8,3 Go ici. Ces modèles sont la partie qui mérite l'attention — ils sont téléchargés une seule fois, au build, et ils vivent *dans* l'image, donc un container `--rm` démarre avec tout ce qu'il lui faut et ne télécharge rien.

Optionnellement, si vous voulez vérifier que l'image est correcte, lancez simplement `docker run --rm docling --help` — [la documentation](https://docling-project.github.io/docling/) couvre chaque flag listé.

### Rendre `docling-convert` disponible partout {#make-docling-convert-available-everywhere}

Même principe que <Link to="/blog/markitdown">`md-convert`</Link>, adapté à la forme réelle de la CLI de Docling. Le vrai travail est fait par `~/tools/docling/docling-convert.sh`, le script que vous venez de créer à côté du Dockerfile :

<Snippet filename="~/tools/docling/docling-convert.sh" source="./files/docling-convert.sh" />

Il reste un script bash volontairement : votre shell ne charge qu'une courte fonction qui vérifie que le script et l'image sont là, puis lance le script avec `bash`, que votre propre shell soit zsh ou bash :

<Snippet filename="docling-convert.sh" source="./files/docling-convert.fn.sh" defaultOpen={true} />

<Tabs groupId="shell">
<TabItem value="zsh" label="zsh" default>

**1. Créez le fichier** dans `~/.zsh/fns/` :

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="docling-convert.zsh" source="./files/docling-convert.fn.sh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.zshrc`.** Déjà fait si vous avez suivi un de mes articles « Ollama au quotidien ». Sinon, ajoutez à la fin de `~/.zshrc` :

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec zsh`).

</TabItem>
<TabItem value="bash" label="bash">

**1. Créez le fichier** dans `~/.bash/fns/` :

<ProjectSetup folderName="~/.bash/fns">
  <Snippet filename="docling-convert.sh" source="./files/docling-convert.fn.sh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.bashrc`.** Ajoutez à la fin de `~/.bashrc` (le test `-r` évite qu'un dossier vide n'affiche une erreur) :

```bash title="~/.bashrc"
for fn_file in ~/.bash/fns/*.sh; do
  [[ -r "$fn_file" ]] && source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec bash`).

</TabItem>
</Tabs>

Vérifiez que le shell connaît la fonction : `type docling-convert` doit répondre `docling-convert is a shell function`.

Si l'image ou le script manque, `docling-convert` affiche la commande `docker build` exacte à lancer, ou renvoie vers cet article quand `~/tools/docling` a disparu aussi.

<AlertBox variant="note" title="Vous venez de la version précédente de cet article ?">
Elle installait `docling-convert` comme script dans `/usr/local/bin/`. Supprimez-le (`sudo rm /usr/local/bin/docling-convert`) : la fonction prend le relais, et l'ancien script traînerait sinon sur votre disque.
</AlertBox>

<AlertBox variant="note" title="Pourquoi un wrapper ?">
Le script interroge `docker info` pour détecter le runtime NVIDIA avant d'ajouter `--gpus all`. Cette vérification n'est pas décorative : `docker run --gpus all` ne se dégrade pas poliment sur une machine sans le toolkit, il refuse carrément de démarrer le container. Avec la sonde en place, le même script fonctionne sur mon serveur GPU et sur mon portable — plus lentement sur le portable, c'est tout, et rien à configurer dans les deux cas. Mettre ce runtime en place est optionnel et arrive à la fin de cet article.
</AlertBox>

Laissé tranquille, Docling raconte chaque exécution — choix du moteur, chargement des modèles, comptage des tokens, une vingtaine de lignes `INFO` pour convertir une seule page — d'où le `--quiet` passé par le wrapper. Ce n'est pas une impasse : Docling ignore `--quiet` dès que `-v` est présent, donc `docling-convert report.pdf -v` ramène tout le log le jour où quelque chose tourne mal. Les deux variables `TRANSFORMERS_*` et `HF_HUB_*` du Dockerfile finissent le travail, en faisant taire la couche de modèles en dessous, qui a ses propres opinions sur les barres de progression.

### Première conversion {#first-conversion}

Il est temps de vérifier que toute la chaîne tient. Les cinq fichiers utilisés tout au long de cet article sont ici — un document, un court bon de livraison, exprimé de cinq façons, pour que vous voyiez ce que chaque format coûte sur le chemin du Markdown plutôt que de comparer cinq choses sans rapport :

<DownloadButton file="/files/docling/samples.zip" label="samples.zip — les cinq fichiers" title="report.pdf, contract.docx, slides.pptx, budget.xlsx, page.html" />

Vous préférez rester dans le terminal ? L'archive est à une URL fixe, donc `curl` la récupère directement dans un dossier temporaire, `/tmp/docling`, dézippée dans un sous-dossier `samples` :

<Terminal title="La première vraie conversion" source="./files/terminal-first-run.txt" typewriter />

`report.md` atterrit à côté de `report.pdf`, titre et paragraphes intacts — pas de dossier de sortie à nommer, pas de redirection à retenir.

Deux choses méritent attention ici. La première, c'est que `docling-convert report.pdf` a pris quatorze secondes. La seconde, c'est la liste de flags affichée sous le résultat : elle apparaît sous chaque conversion PDF, les options que vous avez déjà passées en disparaissent, les quatre autres formats n'ont droit à aucune suggestion, et `DOCLING_CONVERT_NO_TIP=1` la coupe définitivement.

Reste la question évidente : qu'est-ce qu'on achète avec ces quatorze secondes ?

### Pourquoi le pipeline lent est celui par défaut {#why-the-slow-pipeline-is-the-default}

Docling peut lire un PDF de deux manières. Le pipeline standard détecte les régions, en extrait le texte, puis réassemble le tout. Le pipeline `vlm` confie la page rendue à un petit modèle vision-langage — GraniteDocling, 258M de paramètres — et lui demande d'en décrire la structure, comme le ferait une personne qui lit la page. C'est celui qu'utilise le wrapper, et voici `report.pdf` — quatre paragraphes justifiés sous un titre en police display — passé par les deux :

<Terminal title="Standard pipeline vs VLM, same file" source="./files/terminal-pipelines.txt" wrap={false} />

Regardez la première ligne du pipeline standard. `Quarterly Delivery Note d titiitl iltil`, suivi d'un `yy` égaré — l'étape OCR s'est déclenchée sur le grand titre et a halluciné des lettres qui n'existent dans aucune version de ce document. Puis elle a coupé la première proposition en deux, laissant `which is intended to replace it entirely.` seule sur sa ligne. Le VLM n'a produit ni le texte inventé ni l'orpheline. Quatorze secondes contre huit, c'est le prix, et ça achète un fichier que vous pouvez transmettre à quelqu'un sans l'avoir relu.

Le chemin rapide n'échoue pas bruyamment : il invente, et le texte inventé ne se détecte qu'en relisant la sortie.

<AlertBox variant="caution" title="Une vraie différence avec md-convert">
Markitdown écrit le Markdown sur stdout, donc `md-convert file.docx > file.md` est la façon de le capturer. La CLI de Docling écrit au contraire `<basename>.md` directement dans le répertoire de sortie — il n'y a pas de mode stdout. `docling-convert file.docx` produit `file.md` juste à côté ; aucune redirection `>` n'est nécessaire, et aucune ne fonctionnera.
</AlertBox>

### Un mot sur les images {#a-word-on-images}

Docling rend tout ce que le modèle de layout classe comme image — et sur un titre composé dans une police display, ça peut être le titre lui-même. Laissé tranquille, il intègre ensuite chacune d'elles dans le Markdown sous forme d'URI `data:` en base64, ce qui garde le fichier autonome et le gonfle énormément. Le wrapper passe `--image-export-mode referenced` à la place : les images atterrissent en vrais fichiers PNG dans un dossier `budget_artifacts/` à côté de `budget.md`, liées en relatif, pour que les deux voyagent ensemble.

Les deux autres modes sont à un flag de distance. `--image-export-mode placeholder` *supprime* les images et laisse un marqueur `<!-- image -->` à la place de chacune — le bon choix quand le Markdown va alimenter un modèle plutôt qu'une personne. `--image-export-mode embedded` ramène le base64, quand vous voulez un document unique et autonome. Une chose à savoir si vous appelez un jour Docling sans le wrapper : ces liens sont relatifs grâce à `--output .`, et un `--output` absolu écrit les chemins internes au container, qui ne résolvent vers rien à l'extérieur.

## Optionnel — Mettre un GPU derrière le pipeline PDF {#optional--putting-a-gpu-behind-the-pdf-pipeline}

Tout ce qui précède fonctionne sans GPU, et cette section est sautable — deux fois plutôt qu'une :

- **Vous ne convertissez que du `.docx`, `.xlsx`, `.pptx` ou `.html` ?** Alors ça ne vous apporte strictement rien. Ces quatre formats ne chargent jamais de modèle, il n'y a donc rien à accélérer ; `--gpus` ne change ni la vitesse ni la sortie.
- **Vous convertissez des PDF sur une machine sans carte NVIDIA ?** Alors ça fonctionne quand même. `--device auto` se rabat sur le CPU, le même pipeline VLM tourne, et le même Markdown en sort — c'est juste plus long. Le wrapper affiche le temps écoulé à chaque exécution, votre propre matériel vous dira donc de combien.

Recommandé pour les PDF, inutile pour les quatre autres, obligatoire pour personne.

### Pourquoi un toolkit est nécessaire {#why-a-toolkit-is-needed-at-all}

Un container ne voit pas votre carte graphique. La carte, sa VRAM et le *driver* NVIDIA vivent sur l'host ; un container n'obtient ni `/dev/nvidia*` dans sa liste de périphériques, ni les bibliothèques du driver dans son système de fichiers. Les bibliothèques CUDA que `pip` a installées dans notre image — la wheel `torch` embarque les siennes, raison pour laquelle le Dockerfile part d'un simple `python:3.12-slim-trixie` et non d'une base `nvidia/cuda` — ne sont que la moitié *supérieure* de cette pile : elles parlent au driver, elles ne le remplacent pas. La moitié inférieure manquant, PyTorch ne signale aucun périphérique CUDA et calcule sur le CPU.

Le [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) est la pièce qui réunit les deux moitiés : il enregistre un hook dans le daemon Docker qui, à chaque démarrage de container avec `--gpus`, y injecte les nœuds de périphériques GPU et les bibliothèques du driver de l'host. C'est toute la raison de sa présence dans cet article — **pas de toolkit, pas de VRAM**. Installez-le sur l'host Docker, jamais dans l'image, puis confirmez que le GPU est visible depuis l'intérieur d'un container :

<Terminal title="Verifying GPU passthrough" source="./files/terminal-gpu-check.txt" typewriter wrap={false} />

Ce tableau, c'est la carte de l'host lue depuis *l'intérieur* d'un container : 24 Go de VRAM, version du driver, ce qui l'utilise actuellement. L'image `nvidia/cuda` n'est là que comme véhicule pratique pour `nvidia-smi` — notre propre image n'en a pas besoin.

### Si ce tableau n'apparaît pas {#if-that-table-doesnt-show-up}

Rien n'est cassé : `docling-convert` continue de convertir, sur le CPU, exactement comme il l'a fait tout au long de l'article. Si vous voulez vraiment le GPU, trois pannes couvrent quasiment tous les cas :

| Ce que vous obtenez à la place                                 | Ce que ça veut dire                                                                                           | Quoi faire                                                                                                                                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `could not select device driver "" with capabilities: [[gpu]]` | Docker n'a pas de hook GPU : le toolkit n'est pas installé, ou bien installé mais jamais branché au daemon     | Installez le toolkit depuis [le dépôt de packages NVIDIA](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html), puis lancez les deux commandes ci-dessous |
| `nvidia-smi` échoue **sur l'host aussi**, en dehors de tout container  | Le driver lui-même manque ou est cassé — Docker n'est pas encore en jeu                                             | Installez le driver et redémarrez jusqu'à ce que `nvidia-smi` fonctionne sur l'host. Sous WSL2, ce driver est un driver **Windows** : installez-le sur Windows, jamais dans la distribution                |
| `Failed to initialize NVML: Unknown Error`                     | Le hook s'est exécuté, mais le périphérique a été refusé au container — un daemon qui tourne encore avec sa configuration d'avant le toolkit | Les deux commandes ci-dessous                                                                                                                                                               |

Deux de ces trois cas ont le même correctif, parce que le package ne fait que poser le hook sur le disque — il faut encore en informer le daemon :

<Terminal title="Wiring the toolkit into Docker" source="./files/terminal-gpu-fix.txt" wrap={false} />

Cette dernière commande est exactement la sonde que le script wrapper exécute avant d'ajouter `--gpus all` : dès que `nvidia` apparaît parmi les runtimes de Docker, le prochain PDF passe par le GPU sans rien d'autre à changer.

## Ce que coûtent les cinq fichiers {#what-the-five-files-cost}

Chaque chiffre de cet article a été mesuré sur les fichiers que vous avez dézippés plus haut, et les cinq commandes du tout premier terminal tournent dessus telles quelles. Sur ma machine, les quatre formats bureautiques tiennent en quatre à cinq secondes chacun, presque entièrement du démarrage de processus, et `report.pdf` prend quatorze secondes avec le GPU en jeu. Cet écart résume tout : seul le PDF a besoin des modèles.

<AlertBox variant="note" title="Ce que montre réellement le tableur">
Les cellules fusionnées ne sont pas réduites, elles sont *répétées* : le titre ressort une fois par colonne qu'il couvrait, et chaque ligne de section aussi. Rien n'est perdu, mais n'attendez pas du Markdown qu'il reproduise la fusion visuelle. Et Docling lit les formules, pas leurs résultats — un tableur écrit par un script et jamais ouvert dans Excel se convertit avec tous les totaux vides. C'est pour cette raison que `budget.xlsx` stocke les valeurs calculées.
</AlertBox>

## À retenir {#key-takeaways}

<StepsCard
  variant="remember"
  title="docling-convert en bref"
  steps={[
    { content: "**Le GPU est optionnel** — `--device auto` retombe proprement sur le CPU si le passthrough n'est pas configuré" },
    { content: "**Un package, cinq formats** — `pip install docling` tire `docling-slim[standard]`, qui couvre PDF, DOCX, PPTX, XLSX et HTML" },
    { content: "**Les modèles sont intégrés** — téléchargés au build, donc un container non privilégié en lecture seule n'a jamais rien à récupérer" },
    { content: "**Écrit des fichiers, pas sur stdout** — `docling-convert file.pdf` produit `file.md` directement, pas de redirection `>`" },
    { content: "**Lent volontairement** — `--pipeline vlm` garde paragraphes et titres intacts ; ajoutez `--pipeline standard` quand la vitesse compte plus" },
    { content: "**Seuls les PDF ont besoin des modèles** — `.docx`/`.xlsx`/`.pptx`/`.html` passent par un simple parser, sans GPU ni modèle" }
  ]}
/>

## Conclusion {#conclusion}

Entre celui-ci et <Link to="/blog/markitdown">Markitdown</Link>, j'ai maintenant deux images Docker qui transforment des documents bureautiques en Markdown sans qu'un seul octet ne quitte ma machine — une légère que j'utilise par réflexe, et celle-ci, plus lourde, pour quand la structure d'un PDF mérite qu'on y passe vingt secondes et un GPU. Et comme les deux produisent du Markdown brut, l'une comme l'autre s'intègre directement dans le genre de pipeline que je décrivais dans <Link to="/blog/anythingllm-chat-with-your-docs">Discutez avec vos documents grâce à AnythingLLM</Link> — ou dans le prochain article de la série « Ollama au quotidien », où ce Markdown devient l'entrée d'un pipeline local de traduction et de résumé pour des documents qui n'ont jamais eu vocation à toucher le cloud.
