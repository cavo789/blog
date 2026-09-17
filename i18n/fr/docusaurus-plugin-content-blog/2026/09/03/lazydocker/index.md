---
slug: lazydocker
title: "lazydocker : un dashboard Docker dans le terminal, containerisé"
authors: [christophe, claude]
image: /img/v2/lazy-docker.webp
mainTag: docker
tags: [docker, linux]
date: 2026-09-03
description: "lazydocker est une interface terminal en un seul binaire qui affiche d'un coup d'œil tous vos containers, images, volumes et réseaux, avec des stats et des logs en direct. Cet article le containerise — aucune installation sur l'host — et ajoute un wrapper global pour qu'il prenne en compte le compose.yaml du projet dans lequel vous vous trouvez."
language: fr
ai_assisted: true
---

![lazydocker : un dashboard Docker dans le terminal, containerisé](/img/v2/lazy-docker.webp)

<!-- cspell:ignoreCase lazydocker jesseduffield alpine apk hjkl -->

<TLDR>
[lazydocker](https://github.com/jesseduffield/lazydocker) est une interface terminal qui affiche côte à côte containers, images, volumes et réseaux, avec des stats CPU/mémoire en direct et un panneau de logs qui se met à jour au fil de votre sélection — le même genre de dashboard lisible d'un coup d'œil que `top` vous donne pour les processus, mais pour Docker. Cet article le containerise (évidemment), en partageant le socket Docker de l'host de la même manière que ce que j'expliquais dans <Link to="/blog/docker-out-of-docker-dood">mon article sur Docker-out-of-Docker</Link>, et ajoute un script wrapper global pour que lancer `lazydocker` depuis n'importe quel dossier de projet affiche les containers de ce projet, et pas une liste à plat quelconque.
</TLDR>

Dans <Link to="/blog/zsh-docker-functions">un article précédent</Link>, je partageais les fonctions ZSH que j'utilise tous les jours : `dex` pour sauter dans un container, `dstop` pour en arrêter un, `dlogs` pour suivre ses logs. Elles sont rapides, précisément parce qu'elles supposent que je sais déjà ce que je veux — je choisis un container, je fais une chose, terminé.

Mais parfois, ce n'est pas la situation. Parfois je viens de démarrer cinq containers pour un test et je ne sais franchement pas encore lequel fait grimper le CPU, ni si cette ligne de log aperçue à moitié en défilant était vraiment une erreur. Ce n'est pas un problème de « lancer une commande », c'est un problème de « laissez-moi juste regarder l'ensemble une seconde » — et aucune de mes fonctions `dex`/`dstop`/`dlogs` n'est faite pour ça.

<!-- truncate -->

## Le dashboard, en action {#the-dashboard-running}

Cinq panneaux, mis à jour en direct, sur les vrais containers de cette machine :

![Le dashboard de lazydocker : panneaux Containers, Images, Volumes et Networks à gauche, logs en direct à droite](./images/lazydocker-dashboard.png)

Le panneau de droite diffuse la sortie webpack réelle de ce serveur de développement Docusaurus pendant qu'il recompile — aucun `docker logs -f` tapé quelque part, juste le container sélectionné à gauche.

## Ce que lazydocker affiche réellement {#what-lazydocker-actually-shows}

Déplacez la sélection avec les flèches ou les touches vim `hjkl` ; chaque panneau se met à jour en direct. Sélectionnez un container et le panneau de droite affiche ses logs, en direct, sans que vous ayez à taper `docker logs -f <name>`. Appuyez sur <kbd>Enter</kbd> sur un container pour ouvrir un menu d'actions — redémarrer, arrêter, supprimer, ouvrir un shell — au lieu de retenir le flag exact pour chacune. Si lazydocker détecte un `compose.yaml` dans le répertoire courant, le panneau **Containers** les regroupe par nom de service compose plutôt que de tout lister à plat.

<AlertBox variant="tip" title="La liste complète des raccourcis, dans l'application">
Appuyez sur <kbd>?</kbd> dans lazydocker pour obtenir la liste complète et à jour des raccourcis plutôt que de faire confiance à une capture dans un article — les touches exactes ont légèrement bougé d'une release à l'autre.
</AlertBox>

## Le containeriser {#containerizing-it}

Vous me connaissez assez bien maintenant : j'aime containeriser les choses, et je ne vais pas installer un binaire Go directement sur mon host pour celui-ci non plus.

Créons un nouveau dossier : `mkdir -p ~/tools/lazydocker && cd $_`

Puis créez le `Dockerfile` :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Deux points méritent d'être soulignés. D'abord, l'image de base installe le CLI Docker lui-même (`docker-cli` et `docker-cli-compose`) — lazydocker ne parle pas directement au daemon, il appelle les mêmes commandes `docker` et `docker compose` que vous taperiez à la main, elles doivent donc exister dans l'image. Ensuite, la version est fixée via un `ARG` plutôt qu'écrite directement dans la ligne `curl` — consultez la [page des releases](https://github.com/jesseduffield/lazydocker/releases) pour le tag courant avant votre premier build.

Maintenant le `compose.yaml` :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

<AlertBox variant="highlyImportant" title="Le même principe de partage de socket que DooD">
Monter `/var/run/docker.sock` ici, c'est exactement la technique Docker-out-of-Docker de <Link to="/blog/docker-out-of-docker-dood">cet article précédent</Link> — un container qui va contrôler le daemon Docker de l'host. La raison d'être de lazydocker est justement le contrôle des containers au niveau de l'host, donc contrairement à la démonstration avec utilisateur non privilégié de l'article DooD, je ne m'embête pas à abandonner root dans cette image-ci : restreindre l'UID du container n'apporte rien quand ce qu'il monte donne déjà le contrôle complet de Docker, peu importe qui demande. La frontière de privilèges qui compte vraiment ici, c'est « qui peut lancer ce script wrapper », pas l'UID dans le container.
</AlertBox>

`stdin_open` et `tty` sont tous les deux à `true` — sans eux, l'interface plein écran de lazydocker n'obtient jamais de terminal interactif pour s'afficher, et le container se terminerait immédiatement.

Construisez-la : `docker compose build`.

<Terminal source="./files/build.txt" wrap={true} typewriter />

## Le wrapper global {#the-global-wrapper}

Si je ne lançais lazydocker que depuis `~/tools/lazydocker`, il m'afficherait… le propre container de `~/tools/lazydocker`, ce qui n'est pas l'objectif. L'astuce consiste à monter le répertoire dans lequel vous vous trouvez *actuellement*, pour que la logique de détection de projet de lazydocker trouve le bon `compose.yaml`. Autrement dit, le simple `docker compose run` que j'ai utilisé ailleurs ne fonctionne pas ici — le répertoire de travail du fichier compose gagnerait toujours.

Un petit script wrapper règle le problème. Il va dans `/usr/local/bin/` pour être dans votre `PATH` depuis n'importe quel dossier, et comme ce répertoire appartient à root, y créer le fichier nécessite `sudo`. Ouvrez-le avec `sudo vi /usr/local/bin/lazydocker` et collez le contenu ci-dessous (dans `vi` : appuyez sur <kbd>i</kbd>, collez, puis <kbd>Esc</kbd> et `:wq` pour enregistrer et quitter) :

<Snippet filename="/usr/local/bin/lazydocker" source="./files/lazydocker.sh" />

Puis rendez-le exécutable : `sudo chmod +x /usr/local/bin/lazydocker`.

Depuis n'importe quel dossier de projet maintenant — ce repo Docusaurus, l'API d'un client, peu importe — lancer `lazydocker` ouvre le dashboard limité aux containers de *ce* dossier.

<AlertBox variant="note" title="La config survit, les projets n'ont pas besoin de le faire">
`lazydocker-config`, le volume nommé, conserve la disposition de vos panneaux et votre ordre de tri pour tous les projets. C'est le cas d'école pour utiliser un <Link to="/blog/docker-volumes">volume géré par Docker</Link> — ne laissez pas un container `--rm` jeter un état qui n'a aucune raison d'être recréé à chaque exécution.
</AlertBox>

## Personnalisation {#customize}

Le menu d'actions de lazydocker est extensible : n'importe quelle commande shell peut y apparaître sous un nom, dans n'importe quel panneau — containers, images, volumes, réseaux. La configuration tient dans un seul fichier YAML que lazydocker lit depuis son répertoire de configuration, celui-là même que le volume nommé `lazydocker-config` persiste déjà.

Les deux ajouts les plus utiles dépendent du panneau dans lequel vous êtes :

- **Panneau Containers** — le container tourne déjà ; `docker exec` y saute directement.
- **Panneau Images** — rien ne tourne encore ; `docker run --rm` démarre un container jetable à partir de l'image sélectionnée, vous dépose dans un shell, et supprime le container dès que vous en sortez.

Les deux cas, les deux shells, dans un seul fichier. Créez `~/tools/lazydocker/config.yml` :

<Snippet filename="config.yml" source="./files/config.yml" />

Les quatre entrées utilisent `attach: true` pour que lazydocker passe le terminal au shell plutôt que d'exécuter la commande en arrière-plan. `bash` et `sh` couvrent les images qui embarquent l'un ou l'autre — les images basées sur Alpine n'ont que `sh`.

Maintenant, indiquez au fichier compose et au wrapper global de monter ce fichier par-dessus le volume nommé — Docker superpose les montages de fichiers aux montages de volumes pour les chemins qui se recouvrent, donc `config.yml` gagne tandis que le volume conserve toujours la disposition de vos panneaux et votre ordre de tri :

```yaml title="compose.yaml — updated volumes section"
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
  - lazydocker-config:/root/.config/jesseduffield/lazydocker
  - ./config.yml:/root/.config/jesseduffield/lazydocker/config.yml
  - .:/workdir
```

```bash title="/usr/local/bin/lazydocker — updated exec line"
exec docker run --rm -it \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v lazydocker-config:/root/.config/jesseduffield/lazydocker \
    -v "${HOME}/tools/lazydocker/config.yml:/root/.config/jesseduffield/lazydocker/config.yml" \
    -v "${PWD}:/workdir" \
    --workdir /workdir \
    lazydocker
```

<AlertBox variant="note" title="Variables de template">
Chaque panneau expose son propre objet : `{{ .Container.ID }}` dans le panneau containers, `{{ .Image.Name }}` et `{{ .Image.Tag }}` dans le panneau images, `{{ .Service.Name }}` pour les services. La liste complète se trouve dans le [Config.md de lazydocker](https://github.com/jesseduffield/lazydocker/blob/master/docs/Config.md).
</AlertBox>

Redémarrez lazydocker une fois pour prendre en compte le nouveau montage. Dans le panneau **Containers**, sélectionnez un container qui tourne, appuyez sur <kbd>Enter</kbd>, et **bash**/**sh** apparaissent dans le menu — une touche pour y entrer. Dans le panneau **Images**, sélectionnez n'importe quelle image, appuyez sur <kbd>Enter</kbd>, et **bash**/**sh** vous permettent de démarrer un container jetable à partir d'elle sur le champ.

## Ma fonction `dex` vs lazydocker {#my-dex-function-vs-lazydocker}

<AlertBox variant="info" title="Deux outils, deux points de départ">
Ma fonction <Link to="/blog/zsh-docker-functions#start-a-new-terminal-session-in-a-running-docker-container">`dex`</Link> est ce que j'utilise quand je sais déjà quel container je veux et ce que je veux en faire — elle est optimisée pour la vitesse sur une décision déjà prise. lazydocker est ce que j'ouvre juste *avant* que cette décision existe — quand j'ai besoin de tout voir d'un coup pour déterminer quel container est réellement le problème. Aucun ne remplace l'autre ; le menu fzf de `dops` et le dashboard de lazydocker répondent à deux moments différents du même workflow.
</AlertBox>

## Docker Desktop mérite-t-il encore sa place ? {#does-docker-desktop-still-earn-its-place}

Sous Windows, je garde Docker Desktop actif parce que c'est lui qui fournit le moteur en premier lieu — mais son interface graphique était aussi l'endroit où j'allais consulter des logs, redémarrer un container ou vérifier ce qui bouffait la mémoire. lazydocker fait cette partie à l'identique, plus vite, et de la même manière sur toutes les machines au lieu de la seule machine Windows.

<AlertBox variant="info" title="Ce que lazydocker remplace — et ce qu'il ne remplace pas">
lazydocker reprend la moitié de Docker Desktop que vous utilisez au quotidien : l'explorateur de containers, images, volumes et réseaux, le panneau de logs, les actions rapides redémarrer/arrêter/shell. Il ne fournit **pas** le moteur Docker, les limites CPU/mémoire/disque de la VM WSL2, le nœud Kubernetes en un clic, ni le scan d'images Docker Scout — pour ça, vous ouvrez toujours la fenêtre de Docker Desktop.
</AlertBox>

En pratique, depuis que j'ai installé lazydocker, j'ouvre cette fenêtre peut-être une fois par mois, pour relever une limite de ressources. *Désinstaller* Docker Desktop est une autre question — généralement motivée par les [conditions de licence de Docker pour les grandes organisations](https://www.docker.com/pricing/) plutôt que par lazydocker — et la réponse est alors Docker Engine directement dans une distribution WSL2, avec lazydocker par-dessus, exactement comme configuré ci-dessus.

## Points clés {#key-takeaways}

<StepsCard
  variant="remember"
  title="lazydocker en aide-mémoire"
  steps={[
    { content: "**Un seul binaire, aucune installation sur l'host** — containerisé ici, en partageant le socket Docker comme pour DooD" },
    { content: "**Montez `$PWD`, pas le dossier du Dockerfile** — c'est ce qui fait fonctionner la détection de projet depuis n'importe où" },
    { content: "**Root dans le container est acceptable ici** — le montage du socket donne déjà le contrôle complet du Docker de l'host, quel que soit l'UID" },
    { content: "**Persistez le volume de configuration** — disposition des panneaux et ordre de tri survivent pour tous les projets que vous visez" },
    { content: "**Appuyez sur `?` pour les raccourcis** — plus rapide et plus fiable que mémoriser une liste qui bouge d'une release à l'autre" },
    { content: "**Étendez le menu d'actions via config.yml** — le panneau containers utilise `docker exec` (container en cours d'exécution), le panneau images utilise `docker run --rm` (container jetable créé depuis l'image)" },
    { content: "**Il remplace le dashboard de Docker Desktop, pas Docker Desktop** — le moteur, les limites de la VM WSL2 et Kubernetes restent là-bas" }
  ]}
/>

## Conclusion {#conclusion}

`dex`, `dstop` et `dlogs` restent exactement ce que j'utilise dès que je sais ce que je veux faire. lazydocker comble le vide juste avant ce moment — le réflexe « laissez-moi juste regarder une seconde » auquel un menu fuzzy-finder n'est pas fait pour répondre. Et comme ce n'est qu'un container de plus qui partage un socket, il s'insère dans le même modèle mental que l'article DooD sans ajouter le moindre concept nouveau — seulement un nouveau dashboard par-dessus un mécanisme déjà compris. Prochaine étape : la version web de cette même idée, pour les fois où le terminal n'est pas l'outil que quelqu'un d'autre a sous les yeux.
