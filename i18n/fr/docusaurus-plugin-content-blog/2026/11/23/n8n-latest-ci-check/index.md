---
slug: n8n-latest-ci-check
title: "n8n : vérifier votre dernier run CI sans écrire de code"
authors: [christophe, claude]
image: /img/v2/n8n_github_pipelines.webp
mainTag: self-hosted
tags: [self-hosted, docker, github, gitlab]
date: 2026-11-23
description: "n8n connecte des APIs web, des bases de données, des fichiers et des services de messagerie dans un éditeur visuel, presque sans code. Installez-le avec Docker et construisez un premier workflow qui vérifie votre dernier run CI, de façon planifiée."
ai_assisted: true
series: Automate your tasks with n8n
---

![n8n : vérifier votre dernier run CI sans écrire de code](/img/v2/n8n_github_pipelines.webp)

<TLDR>
Les scripts et les commandes IA attendent que vous les lanciez. n8n est un outil d'automatisation auto-hébergé qui démarre tout seul quand un événement se produit : un webhook, une planification, un nouvel élément RSS. Il connecte des APIs web, des bases de données, des fichiers et des services de messagerie dans un éditeur visuel, presque sans code. Cet article l'installe avec Docker et construit un premier workflow dans cet éditeur : vérifier le dernier run CI d'un repository, de façon planifiée. Premier article d'une série.
</TLDR>

Mon terminal est plein de commandes utiles. Elles ont toutes le même défaut : elles ne font quelque chose que lorsque je pense à les taper. Ce pipeline a échoué il y a une heure ? Ce disque est presque plein ? Personne ne me le dit, parce que personne ne regarde. Et écrire un petit serveur de plus juste pour recevoir un webhook, ce n'est pas comme ça que j'ai envie de passer ma soirée.

À la fin de cet article, vous aurez n8n qui tourne sur votre machine et un workflow, construit de vos propres mains dans son éditeur, qui vérifie votre CI pendant que vous faites autre chose.

<!-- truncate -->

## Ce que n8n fait pour vous {#what-n8n-does-for-you}

Voici un workflow n8n. Il demande à GitHub comment s'est terminé le dernier run CI d'un repository, garde trois champs sur une centaine, et envoie les échecs d'un côté et les succès de l'autre :

<BrowserWindow url="http://localhost:5678">
  ![Un workflow n8n terminé : un trigger, une requête HTTP, une sélection de champs et une condition, tous verts après une exécution](./images/workflow-done.png)
</BrowserWindow>

Il n'y a pas de code dedans. Chaque boîte est un **node** choisi dans une liste et configuré avec un formulaire ; les flèches transportent les données de l'un à l'autre. Vous construirez exactement ce workflow plus loin dans l'article, en une dizaine de minutes.

Voilà toute la recette, et elle s'applique bien au-delà de la CI. Un workflow enchaîne quatre types d'étapes :

| Étape | Ce qu'elle fait | Quelques nodes intégrés |
| --- | --- | --- |
| **Démarrer** | Décide *quand* le workflow s'exécute | Sur une planification, un appel webhook, un nouveau fichier dans un dossier, un nouvel élément RSS, un clic |
| **Récupérer** | Va chercher des données quelque part | HTTP Request (n'importe quelle API web), Postgres, MySQL, Microsoft SQL, Google Sheets, fichiers sur disque, fichiers CSV et Excel, FTP, SSH |
| **Transformer et vérifier** | Remodèle et filtre | Edit Fields, Filter, If, Sort, Merge, Remove Duplicates, Summarize |
| **Livrer** | Fait quelque chose du résultat | Envoyer un e-mail, poster sur Slack ou Telegram, écrire un fichier CSV, insérer des rows dans une base de données, appeler une autre API |

Si vous avez utilisé un outil ETL comme <Link to="/blog/pentaho-discovery">Pentaho</Link>, les colonnes du milieu vous parleront. n8n couvre la partie légère de ce terrain : de petits flux pilotés par événements plutôt que de gros chargements de données nocturnes. Et quand un workflow écrit un fichier CSV ou JSON chaque nuit, <Link to="/blog/duckdb-json-csv">DuckDB</Link> l'interroge en SQL le lendemain matin.

Des centaines de services ont un node tout prêt, et quand aucun ne convient, le node *HTTP Request* parle à n'importe quelle API web. Du low-code, donc, et souvent du no-code : un node *Code* accepte du JavaScript ou du Python pour le jour où un formulaire ne suffit pas, mais rien dans cet article n'en a besoin.

## Pourquoi pas simplement un script ? {#why-not-just-a-script}

- Un workflow commence par un **trigger**, donc il s'exécute quand quelque chose arrive et pas quand vous y pensez.
- Chaque node montre les données qu'il a reçues et envoyées, **maintenant et pour chaque exécution passée**. Quand quelque chose casse à 3h du matin, vous lisez ce qui s'est passé au lieu d'ajouter des lignes `echo` et de relancer.
- C'est **auto-hébergé** : vos workflows, vos données d'exécution et vos credentials restent sur votre machine.

Pour une petite tâche, un job cron et quelques lignes de Bash sont souvent plus simples, et je les garde. n8n gagne sa place dès que vous connectez plusieurs services, que vous voulez voir chaque exécution, et que vous préférez ne pas maintenir la tuyauterie.

## Installer n8n {#install-n8n}

n8n tourne dans un container Docker avec un volume nommé, ce qui conserve vos workflows et votre compte d'un redémarrage à l'autre. Donnez-lui un endroit permanent, `~/tools/n8n/` :

<ProjectSetup folderName="~/tools/n8n">
  <Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={true} />
  <Snippet filename="start.sh" source="./files/start.sh" defaultOpen={true} />
</ProjectSetup>

Ensuite, démarrez-le :

<Terminal source="./files/start.txt" wrap={true} typewriter />

<AlertBox variant="info" title="Politique de redémarrage">
Grâce à `restart: unless-stopped`, Docker le relance tout seul après un reboot.
</AlertBox>

Ouvrez [http://localhost:5678](http://localhost:5678). Au premier lancement, n8n vous demande de créer un compte propriétaire local. Rien ne quitte votre machine : n'importe quelle adresse e-mail et un mot de passe de 8 caractères minimum, avec un chiffre et une majuscule, feront l'affaire.

<BrowserWindow url="http://localhost:5678">
  ![n8n demande de configurer le compte propriétaire au premier lancement](./images/owner-account.png)
</BrowserWindow>

## Construire votre premier workflow dans l'éditeur {#build-your-first-workflow-in-the-editor}

La question : *est-ce que le dernier run CI de mon repository est vert ?* Quatre nodes y répondent, et vous écrirez une ligne de code au maximum. J'utilise le repository de ce blog, `cavo789/blog` ; mettez n'importe quel repository public à vous à sa place.

### 1. Créer le workflow et son trigger {#1-create-the-workflow-and-its-trigger}

Sur l'écran d'accueil, cliquez sur **Build a workflow**. Vous obtenez un canvas vide, avec les onglets **Editor** et **Executions** en haut et le bouton **Publish** à droite :

<BrowserWindow url="http://localhost:5678">
  ![Un workflow vide dans l'éditeur n8n](./images/editor-empty.png)
</BrowserWindow>

Donnez-lui d'abord un nom : cliquez sur *My workflow* en haut à gauche, tapez `Latest CI` et appuyez sur <kbd>Enter</kbd>. C'est ce nom que vous retrouverez dans la liste des workflows, et dans le terminal plus loin.

Cliquez sur **Add first step…**. Un panneau demande *What triggers this workflow?* : choisissez **Trigger manually**. Un node nommé *When clicking ‘Execute workflow’* apparaît : le workflow s'exécutera à chaque fois que vous cliquerez sur **Execute** en bas du canvas. Parfait pendant la construction.

### 2. Récupérer le dernier run {#2-fetch-the-latest-run}

Cliquez sur le **+** à droite du trigger. Le panneau liste des groupes de nodes : ouvrez **Core** (*Run code, make HTTP requests, set webhooks…*) et choisissez **HTTP Request**. Gardez la méthode **GET** et remplissez un seul champ :

- **URL** : `https://api.github.com/repos/cavo789/blog/actions/runs?per_page=1`

Cliquez sur **Execute step**. Le panneau se divise en trois : ce qui entre à gauche, les réglages au milieu, ce qui sort à droite. La sortie est la vraie réponse de GitHub, que vous pouvez lire sous forme de schéma, de table ou de JSON brut :

<BrowserWindow url="http://localhost:5678">
  ![Le node HTTP Request après Execute step : les réglages au milieu, la réponse de GitHub à droite](./images/http-request-output.png)
</BrowserWindow>

C'est le moment où n8n se distingue d'un script : vous n'affichez pas des variables pour deviner ce que l'API a renvoyé, vous le regardez.

### 3. Ne garder que l'essentiel {#3-keep-only-what-matters}

La réponse contient une centaine de champs ; trois suffisent. Fermez le panneau HTTP Request avec le **×** en haut à droite : vous revenez sur le canvas, où les deux nodes sont maintenant reliés.

Cliquez sur le **+** à droite du node HTTP Request, ouvrez le groupe **Data transformation** (*Manipulate, filter or convert data*) et choisissez **Edit Fields (Set)**. À sa gauche, le panneau d'entrée montre la réponse de l'étape précédente. Au milieu, la boîte **Fields to Set** affiche *Drag input fields here or Add Field* : cliquez trois fois sur le lien **Add Field**, pour obtenir trois champs vides.

Pour chacun, tapez le nom dans la case **name**, puis **glissez** le champ correspondant depuis le panneau d'entrée (`workflow_runs` › `workflow_runs[0]`) dans la case **value** :

| Nom          | Champ à glisser | Expression écrite                         |
| ------------ | ------------- | ----------------------------------------- |
| `workflow`   | `name`        | `{{ $json.workflow_runs[0].name }}`       |
| `conclusion` | `conclusion`  | `{{ $json.workflow_runs[0].conclusion }}` |
| `url`        | `html_url`    | `{{ $json.workflow_runs[0].html_url }}`   |

Le glisser-déposer écrit l'expression à votre place, et n8n affiche sa valeur actuelle juste en dessous. Cliquez sur **Execute step** : le panneau de sortie montre trois champs, rien d'autre.

<BrowserWindow url="http://localhost:5678">
  ![Le node Edit Fields : la réponse de GitHub à gauche, les trois champs au milieu, la sortie à trois colonnes à droite](./images/edit-fields.png)
</BrowserWindow>

### 4. Séparer succès et échec {#4-split-success-and-failure}

Refermez le panneau. Cliquez sur le **+** à droite d'Edit Fields, ouvrez le groupe **Flow** (*Branch, merge or loop the flow…*) et choisissez **If**. Une seule condition : glissez `conclusion` depuis le panneau d'entrée dans la première case, gardez **is equal to**, et tapez `failure` dans la seconde. Cliquez sur **Execute step** : le panneau de sortie a maintenant deux onglets, **True Branch** et **False Branch**. Le dernier run est vert, il atterrit donc dans **False Branch (1 item)** :

<BrowserWindow url="http://localhost:5678">
  ![Le node If : la condition conclusion is equal to failure, et le run vert dans la False Branch](./images/if-node.png)
</BrowserWindow>

Fermez le panneau et cliquez sur **Execute** en bas du canvas : toute la chaîne se relance, chaque node passe au vert, et un petit compteur sur les flèches indique combien d'éléments sont passés où. Vous avez maintenant le workflow montré en haut de cet article.

La branch **true** ne mène nulle part pour l'instant. C'est là qu'ira une alerte, dans le prochain article de cette série.

### 5. Deux choses à connaître dans l'éditeur {#5-two-things-worth-knowing-in-the-editor}

- **Executions.** L'onglet en haut de l'éditeur liste chaque exécution. Cliquez sur l'une d'elles et vous voyez le workflow exactement tel qu'il était à ce moment-là : ouvrez n'importe quel node pour lire les données qu'il a reçues et envoyées. Quand quelque chose échoue à 3h du matin, c'est là que vous regardez.

  <BrowserWindow url="http://localhost:5678">
    ![L'onglet Executions : la liste des exécutions passées à gauche, celle sélectionnée rejouée à droite](./images/executions.png)
  </BrowserWindow>

- **Épingler et éditer.** Vous n'avez pas besoin d'une exécution rouge pour tester le chemin rouge. Ouvrez le node HTTP Request après une exécution, cliquez sur l'icône crayon en haut du panneau de sortie, remplacez `"conclusion": "success"` par `"conclusion": "failure"` et sauvez. Éditer la sortie l'épingle : une bannière violette dit *This data is pinned for test executions*, et les exécutions suivantes la réutilisent au lieu d'appeler GitHub. Cliquez sur **Execute** : cette fois l'élément sort par **true**, l'inverse de l'étape 4, parce que les données disent maintenant `failure`. Cliquez sur **Unpin** dans cette bannière une fois terminé.

  <BrowserWindow url="http://localhost:5678">
    ![Après avoir édité la sortie épinglée en failure : le node HTTP Request (violet, avec une épingle) alimente un échec simulé, le node If l'envoie donc par la branch true](./images/pinned-failure.png)
  </BrowserWindow>

  n8n dit toujours *Workflow executed successfully*, et il a raison : le **workflow** a fonctionné. Le **pipeline** en échec n'est qu'une donnée qui le traverse. Transformer cette donnée en message, c'est le travail du prochain node sur la branch **true**, qui est le sujet du prochain article.

## L'exécuter de façon planifiée {#run-it-on-a-schedule}

Le trigger manuel ne se déclenche que lorsque vous cliquez. Pour interroger GitHub toutes les heures sans vous, ajoutez un second trigger *à côté* du premier, pas après lui :

1. Cliquez sur le **+** en haut à droite du canvas (pas le **+** à droite d'un node : celui-là insère le nouveau node *dans* la chaîne, après le trigger manuel). Cherchez *Schedule*, choisissez **Schedule Trigger** et réglez-le sur toutes les heures. Il arrive sur le canvas tout seul, relié à rien.
2. Tirez depuis son point de sortie (le petit cercle à sa droite) vers le point d'entrée de **HTTP Request** (le cercle à sa gauche).
3. Cliquez sur **Publish**.

Un node peut recevoir plusieurs flèches : quel que soit le trigger qui se déclenche, la même chaîne s'exécute. Le clic continue à fonctionner pour vos tests, et la planification la lance toutes les heures. À partir de maintenant, l'onglet **Executions** se remplit tout seul, une ligne par heure.

<BrowserWindow url="http://localhost:5678">
  ![Deux triggers côte à côte, le Schedule Trigger et le manuel, tous deux connectés au même node HTTP Request](./images/two-triggers.png)
</BrowserWindow>

Perdu en chemin ? Importez le workflow terminé et comparez : créez un nouveau workflow (le **+** en haut à gauche), ouvrez le menu **…** à côté de son nom, puis **Import from File**.

<Snippet filename="latest-ci.json" source="./files/latest-ci.json" defaultOpen={false} />

## L'exécuter depuis le terminal {#run-it-from-the-terminal}

L'éditeur sert à construire un workflow ; vous n'en avez pas besoin pour en exécuter un. n8n embarque une interface en ligne de commande dans son container, donc un workflow peut s'exécuter depuis un terminal, un job cron ou un script de déploiement.

### 1. Trouver l'ID du workflow {#1-find-the-workflow-id}

Chaque workflow a un ID. Listez-les :

<Terminal source="./files/list-workflow.txt" wrap={true} typewriter />

Le vôtre est une autre suite de lettres et de chiffres. Collez-la ici et toutes les commandes ci-dessous l'utiliseront :

<Vars workflowId="yqIwJNvGEziTd6jW" labels={{ workflowId: "Workflow ID" }} />

### 2. L'exécuter {#2-run-it}

`n8n execute` lance le workflow et affiche l'exécution complète en JSON, quelques lignes de log comprises. Ce petit script ne garde que ce qu'un node a produit, celui d'*Edit Fields* par défaut. Ajoutez-le à côté de `compose.yaml` (il a besoin de `jq` sur votre machine) :

<ProjectSetup folderName="~/tools/n8n">
  <Snippet filename="run.sh" source="./files/run.sh" defaultOpen={true} />
</ProjectSetup>

<Terminal source="./files/cli-run-workflow.txt" wrap={true} typewriter />

C'est du JSON brut, donc le reste de votre boîte à outils prend le relais : <Code>./run.sh <Var name="workflowId">yqIwJNvGEziTd6jW</Var> | jq -r .conclusion</Code> affiche `success`, prêt pour un `if` dans un script shell. Chaque exécution apparaît aussi dans l'onglet Executions, comme celles lancées depuis l'éditeur.

### 3. L'exporter dans un fichier {#3-export-it-as-a-file}

Un workflow est un document JSON. Exportez-le pour le garder à côté de votre code, dans Git :

<Terminal>
{`$ docker compose exec -T n8n n8n export:workflow --id=%%workflowId=yqIwJNvGEziTd6jW%% --pretty > latest-ci.json`}
</Terminal>

Le fichier contient les nodes, leurs réglages et les liens entre eux. `n8n import:workflow` le recharge sur une autre machine, et le **Import from File** de l'éditeur le lit aussi.

## La suite {#where-to-go-next}

Cet article est le premier d'une série. Le workflow *Latest CI* est la colonne vertébrale des suivants ; chacun ajoute une pièce :

1. **Recevoir l'alerte sur votre téléphone.** Branchez la branch **true** sur ntfy, Telegram ou l'e-mail, et vous n'êtes prévenu que lorsqu'une exécution échoue.
2. **Recevoir directement les événements GitHub et GitLab.** Un trigger *Webhook* au lieu de la planification : la CI appelle n8n au moment où une exécution se termine, au lieu que n8n demande toutes les heures.
3. **Ajouter un LLM local.** n8n a des nodes Ollama : résumer un flux chaque matin, trier les mails entrants, expliquer un log en échec. C'est l'étape suivante après ma série <Link to="/series/ollama-daily-use">"Ollama daily use"</Link>.
4. **Surveiller votre machine.** Une planification, une vérification de disque ou de container, une alerte quand quelque chose cloche. Si vous voulez juste de la disponibilité, <Link to="/blog/docker_uptime_kuma">Uptime Kuma</Link> le fait d'office.
5. **Déployer des workflows depuis Git.** L'export ci-dessus, versionné, puis importé automatiquement sur une autre instance n8n.

<AlertBox variant="warning" title="Un webhook est une porte publique">
Recevoir des événements de GitHub ou GitLab veut dire rendre n8n joignable depuis internet. Mettez-le derrière HTTPS, définissez la variable `WEBHOOK_URL`, et protégez chaque webhook avec l'option d'authentification du node. Votre instance n8n stocke des credentials pour vos services, elle mérite donc le même soin que n'importe quel autre serveur sensible.
</AlertBox>

## Conclusion {#conclusion}

Au début de cet article, mes automatisations attendaient que je les tape. Avec n8n, un événement suffit : une planification se déclenche ou un webhook arrive, le workflow s'exécute, et chaque étape reste lisible après coup. Construisez le workflow *Latest CI* dans l'éditeur, et laissez-le tourner de façon planifiée pendant une journée : ouvrir l'onglet Executions le lendemain matin et voir qu'il a fonctionné pendant que vous faisiez autre chose, c'est ce qui fait tilt.
