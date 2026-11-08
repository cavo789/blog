---
slug: lazydocker
title: "lazydocker : un dashboard terminal pour Docker, containerisé"
authors: [christophe, claude]
image: /img/v2/lazy-docker.webp
mainTag: docker
tags: [docker, linux]
date: 2026-09-03
description: "lazydocker est une interface terminal en un seul binaire qui affiche d'un coup d'œil chaque container, image, volume et réseau, avec stats et logs en direct. Cet article le containerise — aucune installation sur l'host — et ajoute une fonction shell `lazydocker`, pour zsh ou bash, qui prend en compte le compose.yaml du projet où vous vous trouvez."
language: fr
updates:
  - date: 2026-11-08
    note: "The /usr/local/bin wrapper script is now a lazydocker shell function for zsh and bash (~/.zsh/fns or ~/.bash/fns); config.yml is mounted automatically when present."
ai_assisted: true
---

![lazydocker : un dashboard terminal pour Docker, containerisé](/img/v2/lazy-docker.webp)

<!-- cspell:ignoreCase lazydocker jesseduffield alpine apk hjkl -->

<TLDR>
[lazydocker](https://github.com/jesseduffield/lazydocker) est une interface terminal qui affiche containers, images, volumes et réseaux côte à côte, avec les stats CPU/mémoire en direct et un panneau de logs qui se met à jour au fil de votre sélection — le même tableau de bord immédiat que `top` vous donne pour les processus, mais pour Docker. Cet article le containerise (évidemment), en partageant le socket Docker de l'host exactement comme expliqué dans <Link to="/blog/docker-out-of-docker-dood">mon article sur Docker-out-of-Docker</Link>, et ajoute une fonction shell pour que `lazydocker`, lancé depuis n'importe quel dossier de projet, affiche les containers de ce projet et pas une liste à plat quelconque.
</TLDR>

Dans <Link to="/blog/zsh-docker-functions">un article précédent</Link>, j'ai partagé les fonctions ZSH que j'utilise tous les jours : `dex` pour entrer dans un container, `dstop` pour en arrêter un, `dlogs` pour suivre ses logs. Elles sont rapides, justement parce qu'elles supposent que je sais déjà ce que je veux — choisir un container, faire une chose, terminé.

Mais ce n'est pas toujours la situation. Parfois je viens de démarrer cinq containers pour un test et je ne sais honnêtement pas encore lequel fait grimper le CPU, ni si cette ligne de log aperçue en diagonale était vraiment une erreur. Ce n'est pas un problème de « lancer une commande », c'est un problème de « laissez-moi juste regarder l'ensemble une seconde » — et aucune de mes fonctions `dex`/`dstop`/`dlogs` n'est faite pour ça.

<!-- truncate -->

## Le dashboard en action {#the-dashboard-running}

Cinq panneaux, mis à jour en direct, sur les vrais containers de cette machine :

![Le dashboard de lazydocker : panneaux Containers, Images, Volumes et Networks à gauche, logs en direct à droite](./images/lazydocker-dashboard.png)

Le panneau de droite diffuse la sortie webpack réelle de ce serveur de dev Docusaurus pendant qu'il recompile — aucun `docker logs -f` tapé nulle part, juste le container sélectionné à gauche.

## Ce que lazydocker affiche réellement {#what-lazydocker-actually-shows}

Déplacez la sélection avec les flèches ou les touches `hjkl` à la vim ; chaque panneau se met à jour en direct. Sélectionnez un container et le panneau de droite affiche ses logs, en streaming, sans devoir taper `docker logs -f <name>` d'abord. Appuyez sur <kbd>Enter</kbd> sur un container pour ouvrir un menu d'actions — redémarrer, arrêter, supprimer, ouvrir un shell — au lieu de retenir le flag exact de chacune. Si lazydocker détecte un `compose.yaml` dans le dossier courant, le panneau **Containers** les regroupe par nom de service compose au lieu de tout lister à plat.

<AlertBox variant="tip" title="Liste complète des raccourcis, dans l'app">
Appuyez sur <kbd>?</kbd> dans lazydocker pour obtenir la liste complète et exacte des raccourcis de votre version, plutôt que de vous fier à une capture dans un article — les touches ont légèrement bougé d'une release à l'autre.
</AlertBox>

## La containerisation {#containerizing-it}

Vous me connaissez assez bien maintenant : j'aime containeriser les choses, et je ne vais pas non plus installer un binaire Go directement sur mon host pour celui-ci.

Créons un nouveau dossier : `mkdir -p ~/tools/lazydocker && cd $_`

Puis créez le `Dockerfile` :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Deux points méritent d'être soulignés. D'abord, l'image de base installe le CLI Docker lui-même (`docker-cli` et `docker-cli-compose`) — lazydocker ne parle pas directement au daemon, il appelle les mêmes commandes `docker` et `docker compose` que vous taperiez à la main, elles doivent donc exister dans l'image. Ensuite, la version est fixée via un `ARG` plutôt qu'écrite en dur dans la ligne `curl` — vérifiez la [page des releases](https://github.com/jesseduffield/lazydocker/releases) pour le tag actuel avant votre premier build.

Maintenant le `compose.yaml` :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

<AlertBox variant="highlyImportant" title="Même principe de partage de socket que DooD">
Monter `/var/run/docker.sock` ici, c'est exactement la technique Docker-out-of-Docker de <Link to="/blog/docker-out-of-docker-dood">cet article précédent</Link> — un container qui va piloter le daemon Docker de l'host. La raison d'être de lazydocker est précisément le contrôle des containers au niveau de l'host : contrairement à la démonstration avec utilisateur non privilégié de l'article DooD, je ne m'embête pas à abandonner root dans cette image-ci. Restreindre l'UID du container n'apporte rien quand ce qu'il monte donne déjà le contrôle total de Docker, peu importe qui demande. La vraie frontière de privilège ici, c'est « qui peut exécuter ce wrapper », pas l'UID à l'intérieur du container.
</AlertBox>

`stdin_open` et `tty` sont tous deux à `true` — sans eux, l'interface plein écran de lazydocker n'obtient jamais de terminal interactif pour s'afficher, et le container se terminerait immédiatement.

Buildez : `docker compose build`.

<Terminal source="./files/build.txt" wrap={true} typewriter />

## Le wrapper global {#the-global-wrapper}

Si je ne lançais lazydocker que depuis `~/tools/lazydocker`, il me montrerait... le container de `~/tools/lazydocker` lui-même, ce qui n'a aucun intérêt. L'astuce est de monter le dossier dans lequel vous êtes *actuellement*, pour que la détection de projet de lazydocker trouve le bon `compose.yaml`. Autrement dit, le simple `docker compose run` que j'utilise ailleurs ne convient pas ici — le working directory du fichier compose l'emporterait toujours.

Une petite fonction shell règle le problème : elle monte le dossier où vous vous trouvez, et comme elle vit dans un fichier que votre shell charge au démarrage (l'organisation expliquée dans <Link to="/blog/modular-zsh-workflow">mon workflow ZSH modulaire</Link>), `lazydocker` fonctionne depuis n'importe quel dossier sans toucher à `/usr/local/bin` ni à `sudo` :

<Snippet filename="lazydocker.sh" source="./files/lazydocker.sh" defaultOpen={true} />

Le code est identique pour zsh et bash ; seuls le dossier et le chargeur diffèrent.

<Tabs groupId="shell">
<TabItem value="zsh" label="zsh" default>

**1. Créez le fichier** dans `~/.zsh/fns/` :

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="lazydocker.zsh" source="./files/lazydocker.sh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.zshrc`.** Déjà fait si vous avez suivi l'un de mes articles « Ollama au quotidien ». Sinon, ajoutez à la fin de `~/.zshrc` :

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
  <Snippet filename="lazydocker.sh" source="./files/lazydocker.sh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.bashrc`.** Ajoutez à la fin de `~/.bashrc` (le test `-r` évite une erreur si le dossier est vide) :

```bash title="~/.bashrc"
for fn_file in ~/.bash/fns/*.sh; do
  [[ -r "$fn_file" ]] && source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec bash`).

</TabItem>
</Tabs>

Vérifiez que le shell connaît la fonction : `type lazydocker` doit répondre `lazydocker is a shell function`.

Si l'image manque, la fonction affiche la commande `docker compose build` exacte à lancer depuis `~/tools/lazydocker`, ou renvoie vers cet article si ce dossier a disparu lui aussi.

<AlertBox variant="note" title="Vous venez de la version précédente de cet article ?">
Elle installait `lazydocker` comme script dans `/usr/local/bin/`. Supprimez-le (`sudo rm /usr/local/bin/lazydocker`) : la fonction prend le relais, et l'ancien script traînerait sinon sur votre disque.
</AlertBox>

Depuis n'importe quel dossier de projet maintenant — ce repo Docusaurus, l'API d'un client, peu importe — lancer `lazydocker` ouvre le dashboard limité aux containers de *ce* dossier.

<AlertBox variant="note" title="La config survit, les projets n'ont pas besoin de le faire">
`lazydocker-config`, le volume nommé, conserve la disposition de vos panneaux et votre ordre de tri d'un projet à l'autre. C'est le cas d'école qui justifie un <Link to="/blog/docker-volumes">volume géré par Docker</Link> — ne laissez pas un container `--rm` jeter un état qui n'a aucune raison d'être recréé à chaque exécution.
</AlertBox>

## Personnalisation {#customize}

Le menu d'actions de lazydocker est extensible : n'importe quelle commande shell peut y apparaître sous un nom, dans n'importe quel panneau — containers, images, volumes, réseaux. La configuration tient dans un seul fichier YAML que lazydocker lit depuis son dossier de config, celui-là même que le volume nommé `lazydocker-config` persiste déjà.

Les deux ajouts les plus utiles dépendent du panneau où vous êtes :

- **Panneau Containers** — le container tourne déjà ; `docker exec` y entre directement.
- **Panneau Images** — rien ne tourne encore ; `docker run --rm` démarre un container jetable à partir de l'image sélectionnée, vous dépose dans un shell, et supprime le container dès que vous sortez.

Les deux cas, les deux shells, dans un seul fichier. Créez `~/tools/lazydocker/config.yml` :

<Snippet filename="config.yml" source="./files/config.yml" />

Les quatre entrées utilisent `attach: true` pour que lazydocker cède le terminal au shell au lieu de lancer la commande en arrière-plan. `bash` et `sh` couvrent les images qui embarquent l'un ou l'autre — les images basées sur Alpine n'ont que `sh`.

Dites maintenant au fichier compose de bind-monter ce fichier par-dessus le volume nommé — Docker superpose les montages de fichiers aux montages de volumes pour les chemins qui se recouvrent, donc `config.yml` l'emporte pendant que le volume continue de persister la disposition des panneaux et l'ordre de tri :

```yaml title="compose.yaml — updated volumes section"
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
  - lazydocker-config:/root/.config/jesseduffield/lazydocker
  - ./config.yml:/root/.config/jesseduffield/lazydocker/config.yml
  - .:/workdir
```

La fonction `lazydocker` n'a besoin d'aucune modification : elle monte déjà `~/tools/lazydocker/config.yml` dès que ce fichier existe.

<AlertBox variant="note" title="Variables de template">
Chaque panneau expose son propre objet : `{{ .Container.ID }}` dans le panneau containers, `{{ .Image.Name }}` et `{{ .Image.Tag }}` dans le panneau images, `{{ .Service.Name }}` pour les services. La liste complète se trouve dans [le Config.md de lazydocker](https://github.com/jesseduffield/lazydocker/blob/master/docs/Config.md).
</AlertBox>

Redémarrez lazydocker une fois pour prendre en compte le nouveau montage. Dans le panneau **Containers**, sélectionnez un container actif, appuyez sur <kbd>Enter</kbd>, et **bash**/**sh** apparaissent dans le menu — une touche pour y entrer. Dans le panneau **Images**, sélectionnez n'importe quelle image, appuyez sur <kbd>Enter</kbd>, et **bash**/**sh** vous permettent d'en démarrer un container jetable sur-le-champ.

## Ma fonction `dex` face à lazydocker {#my-dex-function-vs-lazydocker}

<AlertBox variant="info" title="Deux outils, deux points de départ">
Ma fonction <Link to="/blog/zsh-docker-functions#start-a-new-terminal-session-in-a-running-docker-container">`dex`</Link> est ce que je dégaine quand je sais déjà quel container je veux et ce que je veux en faire — elle est optimisée pour la vitesse sur une décision déjà prise. lazydocker, je l'ouvre juste *avant* que cette décision existe — quand j'ai besoin de voir l'ensemble d'un coup pour identifier quel container pose réellement problème. Aucun ne remplace l'autre ; le menu fzf de `dops` et le dashboard de lazydocker répondent à deux moments différents du même workflow.
</AlertBox>

## Docker Desktop mérite-t-il encore sa place ? {#does-docker-desktop-still-earn-its-place}

Sous Windows, je garde Docker Desktop actif parce que c'est lui qui fournit le moteur — mais son interface graphique était aussi l'endroit où j'allais regarder les logs, redémarrer un container ou voir ce qui bouffait la mémoire. lazydocker fait cette partie de façon identique, plus vite, et de la même manière sur chaque machine au lieu de la seule machine Windows.

<AlertBox variant="info" title="Ce que lazydocker remplace — et ce qu'il ne remplace pas">
lazydocker reprend la moitié de Docker Desktop que vous utilisez tous les jours : le navigateur de containers, images, volumes et réseaux, le panneau de logs, les actions rapides restart/stop/shell. Il ne fournit **pas** le moteur Docker, ni les limites CPU/mémoire/disque de la VM WSL2, ni le nœud Kubernetes en un clic, ni le scan d'images Docker Scout — pour ça, vous ouvrez toujours la fenêtre Docker Desktop.
</AlertBox>

En pratique, depuis que j'ai installé lazydocker, j'ouvre cette fenêtre peut-être une fois par mois, pour augmenter une limite de ressources. *Désinstaller* Docker Desktop est une autre question — généralement motivée par [les conditions de licence de Docker pour les grandes organisations](https://www.docker.com/pricing/) plutôt que par lazydocker — et la réponse là, c'est Docker Engine qui tourne directement dans une distro WSL2, avec lazydocker par-dessus exactement comme configuré ci-dessus.

## Points clés {#key-takeaways}

<StepsCard
  variant="remember"
  title="lazydocker, l'essentiel"
  steps={[
    { content: "**Un seul binaire, aucune installation sur l'host** — containerisé ici, en partageant le socket Docker comme avec DooD" },
    { content: "**Montez `$PWD`, pas le dossier du Dockerfile** — c'est ce qui fait marcher la détection de projet depuis n'importe où" },
    { content: "**Root dans le container est acceptable ici** — le montage du socket donne déjà le contrôle total de Docker sur l'host, quel que soit l'UID" },
    { content: "**Persistez le volume de config** — la disposition des panneaux et l'ordre de tri survivent à tous les projets que vous visez" },
    { content: "**Appuyez sur `?` pour les raccourcis** — plus rapide et plus fiable que de mémoriser une liste qui bouge d'une release à l'autre" },
    { content: "**Étendez le menu d'actions via config.yml** — le panneau containers utilise `docker exec` (container actif), le panneau images utilise `docker run --rm` (container jetable créé depuis l'image)" },
    { content: "**Il remplace le dashboard de Docker Desktop, pas Docker Desktop** — le moteur, les limites de la VM WSL2 et Kubernetes restent là-bas" }
  ]}
/>

## Conclusion {#conclusion}

`dex`, `dstop` et `dlogs` restent exactement ce que je dégaine dès que je sais ce que je veux faire. lazydocker comble le vide juste avant ce moment — le réflexe « laissez-moi juste regarder une seconde » auquel un menu fuzzy-finder n'est pas fait pour répondre. Et comme ce n'est qu'un container de plus qui partage un socket, il s'intègre dans le même modèle mental que l'article DooD sans ajouter un seul concept nouveau — juste un nouveau dashboard posé sur un mécanisme déjà compris. Prochaine étape : la version navigateur de cette même idée, pour les fois où le terminal n'est pas l'outil que quelqu'un d'autre a sous les yeux.
