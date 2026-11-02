---
slug: wsl-docker-vhdx-cleanup
title: "Le build cache Docker a avalé 180 Go — voici comment les récupérer"
description: "Le build cache de Docker s'accumule silencieusement dans le disque virtuel VHDX de WSL2 — et Windows ne récupère jamais cet espace tout seul. Voici le correctif complet : trois étapes communes, puis une méthode de compactage qui dépend de vos droits d'administrateur local."
authors: [christophe, claude]
image: /img/v2/docker-shrink-vhdx.webp
mainTag: wsl
tags: [docker, windows, wsl]
date: 2026-11-02
ai_assisted: true
---

![Le build cache Docker a avalé 180 Go — voici comment les récupérer](/img/v2/docker-shrink-vhdx.webp)

<!-- cspell:ignoreCase VHDX vhdx diskpart sparseVhd wslconfig fsutil compacted reclaimable nsenter fstrim wslexec Lxss BasePath CanonicalGroupLimited -->

<TLDR>
Le build cache de Docker s'accumule dans le disque virtuel `.vhdx` de WSL2 — et ce disque ne fait que grossir, il ne rétrécit jamais de lui-même. Le correctif tient en trois étapes à la portée de tous (prune, trim, shutdown), puis une étape de compactage dont la méthode dépend de vos droits d'administrateur local. Sans droits admin, le *Reset to factory defaults* de Docker Desktop crée un `.vhdx` tout neuf — aucun ticket IT nécessaire. Avec les droits admin, `diskpart` ou `Optimize-VHD` compactent le fichier existant sur place. Dans les deux cas, `sparseVhd=true` et un prune hebdomadaire planifié empêchent le problème de revenir.
</TLDR>

Windows affiche 2 Go libres. Rien côté Windows ne l'explique — pas de gros téléchargements, pas d'installation récente. Le coupable est un fichier qui n'apparaît pas dans l'analyse d'espace disque de l'Explorateur : `docker_data.vhdx`, le disque virtuel où Docker Desktop stocke tout ce qu'il construit.

`docker system df` révèle la situation réelle :

<Terminal source="./files/df_before.txt" />

2 842 entrées de build cache, 180 Go, accumulées silencieusement au fil de mois d'utilisation normale de Docker.

Avant toute chose, vérifiez la taille réelle du fichier `.vhdx` sur le disque. Ouvrez PowerShell et lancez :

```powershell
Get-ChildItem "$env:LOCALAPPDATA\Docker\wsl\disk\" -Filter "*.vhdx" |
    Select-Object Name, FullName, @{n='SizeGB';e={[math]::Round($_.Length/1GB,2)}}
```

<Terminal source="./files/vhdx_list.txt" />

La colonne `FullName` donne le chemin exact dont vous aurez besoin à l'étape de compactage. `SizeGB` est le nombre à surveiller — 288 Go ici, pour un contenu Docker réel d'environ 90 à 110 Go.

Si le dossier `disk\` est vide, ouvrez Docker Desktop → l'icône d'engrenage → **Resources → Advanced** : le champ *Disk image location* indique le dossier parent ; le VHDX se trouve un niveau plus bas, dans le sous-dossier `disk`.

![Docker Desktop Resources → Advanced — le champ Disk image location indique le dossier parent de docker_data.vhdx](./images/docker_resources.webp)

<!-- truncate -->

## Après le correctif {#after-the-fix}

Une fois le cache nettoyé et le VHDX compacté, `docker system df` est propre :

<Terminal source="./files/df_after.txt" />

Et `docker_data.vhdx`, qui pesait 288 Go dans l'Explorateur Windows, est revenu à son contenu réel. L'Explorateur reflète le changement immédiatement après le compactage.

## Pourquoi le prune seul ne suffit pas {#why-pruning-alone-is-not-enough}

Quatre faits expliquent l'écart entre « Docker a libéré 180 Go » et « Windows affiche toujours 2 Go libres » :

- **WSL2 stocke toutes les données Docker dans un seul fichier `.vhdx`.** Images, containers, volumes, build cache — tout vit dans `docker_data.vhdx`. Docker n'écrit pas directement sur `C:\`.
- **Le VHDX ne fait que grossir.** Quand Docker ajoute des données, le fichier grandit. Quand Docker supprime des données, les blocs sont marqués libres *à l'intérieur* du système de fichiers virtuel, mais le fichier `.vhdx` garde la même taille physique.
- **`docker builder prune` libère des blocs ; il ne compacte pas le disque.** Après le prune, 180 Go sont disponibles dans le système de fichiers virtuel. Windows voit toujours le même fichier de 288 Go.
- **`fstrim` est le pont.** Après un prune, les blocs libérés dans ext4 ne sont pas remis à zéro — ils sont simplement marqués non alloués dans le système de fichiers. La couche `.vhdx` n'a aucun moyen de savoir que ces blocs sont vides tant que `fstrim` ne le signale pas explicitement. Sans `fstrim`, l'étape de compactage ne trouve rien à supprimer et le fichier ne rétrécit pas.

## Étape 1 — Vider le build cache {#step-1--clear-the-build-cache}

Lancez `docker system df` pour confirmer que la ligne Build Cache est bien le principal responsable, puis nettoyez-la :

```bash
docker builder prune -a -f
```

<Terminal source="./files/builder_prune.txt" />

Le flag `-a` supprime toutes les entrées du cache, y compris celles qui pourraient encore accélérer un rebuild. Le flag `-f` saute la demande de confirmation.

Les images et les volumes peuvent eux aussi s'accumuler à côté du cache :

- `docker image prune -a` — supprime toute image non référencée par un container en cours d'exécution ou arrêté.
- `docker container prune` — supprime les containers arrêtés. Sans risque si vous utilisez `--rm` par défaut.
- `docker volume prune` — supprime les volumes qui ne sont attachés à aucun container.

<AlertBox variant="warning" title="Les volumes contiennent des données non reconstructibles">
Les données d'un <Link to="/blog/docker-volumes">volume nommé</Link> ne peuvent pas être reconstruites à partir d'un Dockerfile. Si un volume contient une base de données, des fichiers uploadés ou l'état persistant d'un environnement de dev, `docker volume prune` le supprime définitivement. Lancez `docker volume ls` et vérifiez chaque volume avant de nettoyer.
</AlertBox>

Relancez `docker system df` pour confirmer que la ligne Build Cache affiche `0B` avant de continuer.

## Étape 2 — Indiquer au VHDX quels blocs sont libres (fstrim) {#step-2--tell-the-vhdx-which-blocks-are-free-fstrim}

Docker sait que les blocs sont libres. Le `.vhdx`, non. `fstrim` perce des trous dans le disque virtuel, en signalant quels blocs sont désormais vides pour que l'étape de compactage puisse les supprimer physiquement :

```powershell
docker run --rm --privileged --pid=host alpine nsenter -t 1 -m -- fstrim -av
```

Lancez ceci dans PowerShell ou Windows Terminal — **pas dans WSL**. La commande démarre un container, entre dans le namespace root de la VM Docker Desktop et exécute `fstrim` sur tous les systèmes de fichiers montés.

<Terminal source="./files/fstrim.txt" />

<AlertBox variant="tip" title="Les chiffres de trim peuvent dépasser la taille de votre disque — c'est normal">
Un VHDX a une taille *virtuelle* (ce que voit la VM, souvent 1 To ou plus) et une taille *physique* (le fichier réel sur Windows, ici 288 Go). `fstrim -av` parcourt tout l'espace virtuel et rapporte les discards sur ce volume logique. L'espace réellement rendu à Windows n'apparaît qu'après l'étape de compactage.
</AlertBox>

## Étape 3 — Arrêter Docker et WSL {#step-3--shut-down-docker-and-wsl}

Sauvegardez votre travail en cours dans VSCode, puis quittez Docker Desktop depuis la zone de notification (clic droit → *Quit Docker Desktop*).

Attendez que le processus Docker Desktop ait complètement disparu :

```powershell
Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
```

Relancez cette commande jusqu'à ce qu'elle ne renvoie plus rien — une sortie vide signifie que le processus s'est terminé. Vérifiez ensuite WSL :

```powershell
wsl --list --running
```

Si la liste n'est pas vide :

```powershell
wsl --shutdown
```

La sortie attendue de `wsl --list --running` ensuite est `There are no running distributions.`

<AlertBox variant="danger" title="Arrêtez Docker Desktop avant wsl --shutdown">
Docker Desktop gère plusieurs distributions WSL en interne. Appeler `wsl --shutdown` pendant que Docker Desktop est encore en train de s'arrêter laisse le service WSL dans un état cassé. Le seul remède est un redémarrage complet de Windows. Quittez toujours Docker Desktop d'abord et attendez que `Get-Process "Docker Desktop"` ne renvoie plus rien.
</AlertBox>

## Compacter le VHDX — choisissez votre voie {#compact-the-vhdx--choose-your-path}

Les étapes 1 à 3 sont les mêmes pour tout le monde. L'étape de compactage dépend de vos droits sur la machine.

<QuickJump
  title="Votre situation"
  links={[
    { label: "J'ai les droits administrateur local", to: "#compact-admin" },
    { label: "Je n'ai pas les droits administrateur local", to: "#compact-non-admin" },
  ]}
/>

J'ai rencontré ce problème sur mon portable professionnel, où je n'ai pas les droits admin local. Mon collègue IT a pris la main à distance et a lancé la séquence `diskpart` du chemin admin. Une fois déconnecté, j'ai suivi le chemin non-admin pour mettre en place les garde-fous — histoire que ça ne se reproduise pas.

### J'ai les droits administrateur local {#compact-admin}

<AlertBox variant="danger" title="Docker Desktop et WSL doivent être complètement arrêtés">
Compacter un fichier VHDX ouvert le corrompt. Vérifiez que `wsl --list --running` renvoie `There are no running distributions.` et que Docker Desktop n'est plus visible dans la zone de notification avant de lancer quoi que ce soit ci-dessous.
</AlertBox>

Vérifiez d'abord si le module PowerShell Hyper-V est disponible sur votre machine :

```powershell
Get-Module -ListAvailable Hyper-V
```

#### Option A — Optimize-VHD (sans diskpart) {#option-a--optimize-vhd-no-diskpart-needed}

Si la commande a renvoyé une entrée de module :

<Terminal>
Optimize-VHD -Path "%%vhdxPath=C:\Users\your-name\AppData\Local\Docker\wsl\disk\docker_data.vhdx%%" -Mode Full
</Terminal>

Sur certaines machines d'entreprise, `Optimize-VHD` exige quand même l'appartenance au groupe Hyper-V Administrators, même si le module est présent. En cas d'erreur « Access denied », passez à l'option B.

#### Option B — diskpart {#option-b--diskpart}

Ouvrez un PowerShell élevé (clic droit → *Exécuter en tant qu'administrateur*), tapez `diskpart` puis lancez les quatre commandes une par une :

```powershell
diskpart
```

<Terminal>
select vdisk file="%%vhdxPath=C:\Users\your-name\AppData\Local\Docker\wsl\disk\docker_data.vhdx%%"
attach vdisk readonly
compact vdisk
detach vdisk
exit
</Terminal>

`attach vdisk readonly` ouvre le fichier en lecture seule — aucune donnée n'est modifiée. L'étape `compact` affiche un pourcentage de progression qui grimpe jusqu'à 100 %. Comptez de quelques minutes sur un NVMe rapide à plus d'une heure sur un gros disque lent.

Une fois le compactage terminé, le fichier `.vhdx` rétrécit et l'Explorateur affiche immédiatement les gigaoctets récupérés. Démarrez Docker Desktop : tout fonctionne exactement comme avant.

### Je n'ai pas les droits administrateur local {#compact-non-admin}

Sans droits admin local, ni `diskpart` ni `Optimize-VHD` ne sont directement accessibles. Les deux approches ci-dessous partent du panneau **Troubleshoot** de Docker Desktop (icône d'engrenage → Troubleshoot) :

![Panneau Troubleshoot de Docker Desktop — Clean up data supprime les objets Docker sélectionnés ; Reset to factory defaults recrée le VHDX de zéro](./images/docker_troubleshoot.webp)

Si l'IT peut vous accorder cinq minutes, envoyez à votre collègue les quatre commandes `diskpart` du [chemin admin ci-dessus](#compact-admin) accompagnées du chemin `.vhdx` exact obtenu à l'étape de diagnostic. La séquence est sûre et réversible : `attach vdisk readonly` ouvre le fichier en lecture seule, `compact vdisk` supprime les blocs vides, `detach vdisk` le relâche.

Sinon, le *Reset to factory defaults* de Docker Desktop supprime `docker_data.vhdx` et en crée un neuf. Avec `sparseVhd=true` déjà défini dans `.wslconfig` (voir la section [Prévention](#prevention)), le nouveau fichier se compactera automatiquement à mesure que Docker libère de l'espace — ce qui en fait une opération unique.

<AlertBox variant="danger" title="Le reset usine supprime toutes les données Docker locales">
Images, containers et volumes sont supprimés. Tout ce qui provient d'un registry public se reconstruit avec `docker compose up`. Sauvegardez les volumes nommés contenant des données importantes avant de continuer.
</AlertBox>

#### Avant le reset — sauvegardez ce que vous ne pouvez pas reconstruire {#before-the-reset--save-what-you-cannot-rebuild}

Les volumes nommés contenant des données importantes :

```powershell
docker volume ls
docker run --rm `
  -v <volume-name>:/data `
  -v C:\docker-backup:/backup `
  alpine tar czf /backup/<volume-name>.tar.gz -C /data .
```

Les images provenant de registries publics et les containers arrêtés n'ont pas besoin d'être sauvegardés — ils se reconstruisent en quelques minutes depuis leurs Dockerfiles. La seule exception est une image créée avec `docker commit` (modifications à l'exécution capturées sans Dockerfile) ; si vous en avez une, sauvegardez-la avec `docker save <image>:<tag> -o backup.tar` avant de continuer.

#### Lancer le reset {#run-the-reset}

Docker Desktop → l'icône d'engrenage → **Troubleshoot** → **Reset to factory defaults**.

Après le reset, vérifiez que le nouveau `.vhdx` est bien sparse :

```powershell
fsutil sparse queryflag "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx"
```

La sortie attendue est `This file is set as sparse`. Si elle indique toujours `NOT set as sparse`, c'est que `sparseVhd=true` ne s'applique pas au disque de données de Docker Desktop dans votre version — le prune hebdomadaire ci-dessous empêche le fichier de grossir, et un compactage ponctuel par l'IT (le [chemin admin](#compact-admin)) reste possible si vous avez besoin de récupérer l'espace.

#### Restaurer vos données sauvegardées {#restore-your-saved-data}

```powershell
docker load -i "C:\docker-backup\<image>.tar"
```

```powershell
docker volume create <volume-name>
docker run --rm `
  -v <volume-name>:/data `
  -v C:\docker-backup:/backup `
  alpine tar xzf /backup/<volume-name>.tar.gz -C /data
```

Reconstruisez tout le reste avec `docker compose up` dans chaque dossier de projet.

## Prévention {#prevention}

Le correctif fonctionne, mais sans action le `.vhdx` regrossit en quelques mois. Trois niveaux de défense, de l'immédiat au permanent.

### 1. Activer sparseVhd {#1-enable-sparsevhd}

Depuis WSL 1.3.17 (mi-2024), Microsoft a ajouté `sparseVhd` à `.wslconfig` :

```ini
[experimental]
sparseVhd=true
```

Éditez `C:\Users\<your-name>\.wslconfig` et ajoutez ces deux lignes. Un VHDX sparse rend automatiquement à Windows les blocs libérés au fur et à mesure que Docker les supprime — plus besoin de compactage manuel par la suite.

Ce réglage ne concerne que les disques nouvellement créés. Si votre `docker_data.vhdx` actuel n'est pas déjà sparse (vérifiez avec `fsutil sparse queryflag`), il n'a aucun effet dessus. Laissez quand même le réglage dans `.wslconfig` : après un reset usine ou l'ajout d'une nouvelle distribution WSL, le nouveau disque en profitera automatiquement.

### 2. Contrôle quotidien de la taille dans votre terminal {#2-daily-size-check-in-your-terminal}

Ajoutez cette fonction à votre `.bashrc` ou `.zshrc` — elle affiche un avertissement d'une ligne à la première ouverture de terminal de la journée lorsque le `.vhdx` dépasse 150 Go :

<Snippet filename="vhdx_warn.sh" source="./files/vhdx_warn.sh" />

Le fichier témoin daté dans `~/.cache/` garantit que le contrôle ne tourne qu'une fois par jour. Ajustez le seuil de `150` selon votre situation disque.

### 3. Prune automatique hebdomadaire via le Planificateur de tâches Windows {#3-weekly-automatic-prune-via-windows-task-scheduler}

Le Planificateur de tâches Windows peut lancer `docker builder prune` automatiquement — une tâche au niveau utilisateur ne demande pas de droits admin. Ouvrez PowerShell avec votre compte habituel :

```powershell
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument '-NoProfile -NonInteractive -Command "wsl -e docker builder prune -a -f --filter ''until=168h''"'
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "08:00"
Register-ScheduledTask -TaskName "Docker-Weekly-Prune" -Action $action -Trigger $trigger
```

`wsl -e docker` exécute la CLI `docker` dans votre distribution WSL par défaut : cette distribution doit donc avoir l'intégration WSL de Docker Desktop activée (icône d'engrenage → **Resources → WSL integration**) ; sinon la tâche échoue sans aucune erreur visible.

Le flag `--filter "until=168h"` conserve les entrées de cache de moins d'une semaine, préservant la vitesse de rebuild des projets actifs tout en supprimant tout ce qui est plus ancien.

#### Vérifier et gérer la tâche {#verify-and-manage-the-task}

Confirmez que la tâche est bien enregistrée :

```powershell
Get-ScheduledTask -TaskName "Docker-Weekly-Prune"
```

Sortie attendue : `State: Ready`. Inspectez ensuite le déclencheur et l'action :

```powershell
$task = Get-ScheduledTask -TaskName "Docker-Weekly-Prune"
$task.Triggers
$task.Actions
```

Lancez-la tout de suite pour tester :

```powershell
Start-ScheduledTask -TaskName "Docker-Weekly-Prune"
```

Attendez 10 à 15 secondes le temps que WSL démarre et que Docker réponde, puis vérifiez le résultat :

```powershell
Get-ScheduledTask -TaskName "Docker-Weekly-Prune" | Get-ScheduledTaskInfo |
    Select-Object LastRunTime, LastTaskResult, NextRunTime
```

`LastTaskResult: 0` signifie succès. La valeur `267011` (`SCHED_S_TASK_NOT_SCHEDULED`) est la valeur par défaut de Windows avant la première exécution d'une tâche — ce n'est pas une erreur.

<AlertBox variant="tip" title="La tâche peut ne rien nettoyer lors du premier passage">
`--filter "until=168h"` protège tout ce qui a été créé ou utilisé durant les 7 derniers jours. Sur une machine active où vous buildez régulièrement, la plupart des entrées de cache tombent dans cette fenêtre et la tâche se termine proprement sans rien supprimer. C'est le comportement voulu : cela évite l'accumulation sur le long terme sans casser les rebuilds incrémentaux. `docker system df` indique séparément l'espace récupérable pour les images et les volumes — ceux-ci ne sont pas touchés par cette tâche.
</AlertBox>

Pour ouvrir la tâche dans l'interface graphique du Planificateur de tâches :

```powershell
Start-Process taskschd.msc
```

Cliquez directement sur **Bibliothèque du Planificateur de tâches** dans le panneau de gauche (pas sur un de ses sous-dossiers — la tâche se trouve à la racine `\`, pas dans GoogleSystem, Microsoft ou un sous-dossier d'entreprise). Le panneau central liste toutes les tâches de la racine ; trouvez *Docker-Weekly-Prune*, clic droit → *Propriétés* pour modifier le déclencheur ou la commande. L'onglet *Historique* montre chaque exécution passée et son code de sortie.

![Planificateur de tâches — Docker-Weekly-Prune à la racine, état Prêt, déclencheur « À 8:00 chaque lundi », onglet Actions affichant la commande powershell.exe complète](./images/task-scheduler-docker.webp)

*Petite remarque : si l'interface du Planificateur de tâches vous semble être une relique de l'ère Windows NT — dense, modale, rien là où on s'y attend — c'est parce qu'elle l'est, en gros. Les cmdlets PowerShell ci-dessus font le travail plus vite.*

<AlertBox variant="tip" title="taskschd.msc bloqué sur votre machine ?">
Certaines configurations de stratégie de groupe en entreprise restreignent l'accès à l'interface du Planificateur de tâches. Cette restriction ne concerne que le composant MMC — elle n'affecte pas la tâche elle-même, qui s'exécutera quand même comme prévu. Utilisez les cmdlets PowerShell ci-dessus pour l'inspecter et la gérer.
</AlertBox>

Pour faire passer la fenêtre de rétention de 7 à, disons, 14 jours :

```powershell
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument '-NoProfile -NonInteractive -Command "wsl -e docker builder prune -a -f --filter ''until=336h''"'
Set-ScheduledTask -TaskName "Docker-Weekly-Prune" -Action $action
```

Pour supprimer complètement la tâche :

```powershell
Unregister-ScheduledTask -TaskName "Docker-Weekly-Prune" -Confirm:$false
```

<AlertBox variant="tip" title="Le prune ne compacte pas — vérifiez la taille de temps en temps">
Le prune planifié empêche le cache de s'accumuler, mais il ne compacte pas le `.vhdx`. Avec `sparseVhd=true` sur un nouveau disque sparse, l'OS récupère automatiquement les blocs libérés. Sans support sparse sur le disque existant, lancez un compactage manuel tous les quelques mois, après un gros prune.
</AlertBox>

Désormais, chaque lundi matin, la tâche se réveille, se connecte à WSL, vide du build cache tout ce qui a plus d'une semaine, et se termine — aucune action manuelle requise.

Savoir si `fstrim` reste nécessaire tient à une seule chose : lancez `fsutil sparse queryflag "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx"` dans PowerShell.

- **`This file is set as sparse`** — Windows rend automatiquement les blocs libérés au disque. `fstrim` n'est plus jamais nécessaire.
- **`NOT set as sparse`** — l'espace libéré reste dans le `.vhdx` mais Docker le réutilise pour les builds suivants. Le fichier ne grossit plus, Windows arrête de se plaindre, et c'est un résultat parfaitement stable. Un compactage manuel (étapes 2–3 plus le compactage) reste une option si vous voulez un jour rendre physiquement ces gigaoctets à Windows, mais ce n'est plus urgent.

## En cas de problème {#if-something-goes-wrong}

### `Wsl/Service/E_UNEXPECTED` — le service WSL est bloqué {#wslservicee_unexpected--the-wsl-service-is-stuck}

Cette erreur apparaît quand `wsl --shutdown` a été appelé alors que Docker Desktop était encore en train de s'arrêter. **La solution est un redémarrage complet de Windows.** Aucune commande WSL n'aidera à ce stade. Après le redémarrage, votre distribution démarre normalement.

### Vérifier vos fichiers VHDX après un redémarrage {#verify-your-vhdx-files-after-a-reboot}

Vérifiez que les fichiers VHDX sont intacts avant de relancer Docker Desktop :

```powershell
Get-ChildItem HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss |
  ForEach-Object { Get-ItemProperty $_.PSPath } |
  Select-Object DistributionName, BasePath
```

Pour le disque de données de Docker Desktop en particulier :

<Terminal source="./files/cmd_check_vhdx_size.txt" />

Une taille de fichier non nulle et un Docker Desktop qui démarre normalement confirment que rien n'est corrompu.

## Conclusion {#conclusion}

Le build cache Docker s'accumule silencieusement et Windows ne récupère jamais l'espace de lui-même. Trois étapes — prune, trim, shutdown — sont identiques pour tout le monde. La méthode de compactage dépend ensuite d'une seule question : avez-vous les droits admin local ? Avec les droits admin, `diskpart` ou `Optimize-VHD` compactent le fichier existant sur place. Sans droits admin, *Reset to factory defaults* dans Docker Desktop crée un `.vhdx` tout neuf — aucun droit IT nécessaire pour le reset lui-même, uniquement pour le compactage ponctuel si vous voulez éviter la perte de données. Dans les deux cas, `sparseVhd=true` et un prune hebdomadaire planifié empêchent le problème de revenir.

Pour une vue d'ensemble de ce qui s'accumule avant de décider quoi nettoyer, <Link to="/blog/lazydocker">lazydocker</Link> affiche chaque container, image et volume d'un coup d'œil depuis un seul panneau de terminal. Les <Link to="/blog/zsh-docker-functions">fonctions ZSH pour Docker</Link> que j'utilise au quotidien — `dex`, `dstop`, `dnuke` — rendent la question « qu'est-ce qu'on peut nettoyer sans risque ? » triviale : `dnuke` démonte tout, volumes compris, pour un projet terminé, en une seule commande. Et si le problème de disque est plus profond que le cache — c'est la distribution WSL elle-même qui doit migrer vers un disque plus grand — <Link to="/blog/move-wsl-to-another-location">déplacer une distribution WSL vers un autre emplacement</Link> détaille la méthode export-import.
