---
slug: ssh-config-tips
title: "Générateur de config SSH : stanzas wildcard, alias et connexions automatisées"
authors: [christophe]
image: /img/v2/ssh.webp
mainTag: ssh
tags: [ssh, linux, windows]
date: 2026-10-01
description: "Générez votre config SSH en quelques secondes — puis comprenez comment elle fonctionne : un wildcard élimine chaque ProxyJump et IdentityFile répété, les stanzas de domaine définissent les noms d'utilisateur pour les FQDN, les alias courts ont besoin de leur propre ligne User, et RemoteCommand vous connecte directement en tant qu'utilisateur applicatif."
series: SSH - From your first key to remote development
language: fr
ai_assisted: true
---

import { sshConfigTemplate } from './files/ssh_config_template.js';

![Générateur de config SSH : stanzas wildcard, alias et connexions automatisées](/img/v2/ssh.webp)

<TLDR>
SSH lit chaque stanza correspondante de haut en bas, et la première valeur l'emporte pour chaque directive — c'est ce qui rend `Host * !bastion` si puissant : une seule stanza couvre tous les serveurs d'un coup, fini la répétition de `ProxyJump` et `IdentityFile`. Les stanzas de domaine ajoutent le bon `User` pour les connexions par FQDN ; les alias courts doivent le répéter explicitement, car SSH fait la correspondance sur ce que vous tapez, pas sur le hostname résolu. Trois directives — `ServerAliveInterval`, `ControlMaster`, `ConnectTimeout` — renforcent les valeurs globales sans en changer la logique. Pour une machine qui mélange SSH professionnel et personnel, `Include` sépare proprement les deux. `RemoteCommand` transforme une séquence `sudo su` + `cd` en un simple alias.
</TLDR>

Chaque serveur de mon environnement n'est accessible qu'à travers ma propre VM Windows qui joue le rôle de bastion. L'<Link to="/blog/vscode-remote-ssh-proxyjump-devcontainer">article sur ProxyJump et les DevContainers</Link> montre une config avec un seul alias. Ajoutez un deuxième serveur et la config double. Ajoutez-en dix et ça devient un problème de maintenance : changez une fois le hostname du bastion et vous réécrivez dix stanzas, chacune portant les mêmes lignes `ProxyJump` et `IdentityFile`.

La config ci-dessous couvre n'importe quel nombre de serveurs sans aucune répétition.

<!-- truncate -->

<Vars
  vmUser="vm-user"
  vmIp="windows-vm-ip"
  sshKey="id_ed25519"
  userA="user-a"
  userB="user-b"
  labels={{
    vmUser: "Nom d'utilisateur du bastion/de la VM",
    vmIp: "Hostname ou IP du bastion/de la VM",
    sshKey: "Nom du fichier de clé privée SSH",
    userA: "Nom d'utilisateur sur les serveurs du projet A",
    userB: "Nom d'utilisateur sur les serveurs d'entreprise",
  }}
/>

## La configuration {#the-config}

Les deux chemins de connexion fonctionnent immédiatement — un alias court et un FQDN complet, sans aucun flag :

<Terminal title="laptop: ~" typewriter>
$ ssh %%alias=project_prod%% "whoami && hostname"
%%userB=user-b%%
server-prod
$ ssh server-test.cloud.project-a.internal "whoami && hostname"
%%userA=user-a%%
server-test
</Terminal>

Pas de flag `ProxyJump`, pas de clé explicite — la config gère les deux de façon transparente. Créez `C:\Users\your_laptop_user\.ssh\config` (Windows ; WSL inclus) ou `~/.ssh/config` (Linux/macOS) avec ceci :

<Snippet title={<>C:\Users\your_laptop_user\.ssh\config · ~/.ssh/config</>} source="./files/ssh_config_optimized.txt" />

## Comment SSH lit un fichier de configuration {#how-ssh-reads-a-config-file}

Trois règles expliquent pourquoi les <abbr title="chaque bloc Host et ses directives dans un fichier de config SSH s'appelle une « stanza »">stanzas</abbr> se composent sans conflit :

- **Plusieurs stanzas peuvent correspondre.** Lancer `ssh project_prod` amène SSH à parcourir le fichier de haut en bas et à collecter les réglages de *chaque* stanza `Host` qui correspond à `project_prod`, pas seulement la première.
- **La première valeur l'emporte pour chaque réglage — l'inverse de la plupart des outils.** En CSS, dans les fichiers `.env` ou dans la plupart des systèmes de configuration, la dernière déclaration écrase les précédentes. SSH fait l'inverse : la première valeur rencontrée est conservée, et les stanzas suivantes ne peuvent que compléter les réglages non encore définis. Mettez la stanza la plus spécifique en premier ; le fallback wildcard en dernier.
- **Les motifs correspondent à l'argument de la ligne de commande, pas au hostname résolu.** `Host *.office.corp.example` correspond à `ssh server-prod.office.corp.example`. Il ne correspond **pas** à `ssh project_prod`, même si le `HostName` de `project_prod` se résout en `server-prod.office.corp.example`.

## Les cinq sections {#the-five-sections}

Le snippet de config ci-dessus est découpé en cinq sections numérotées — voici ce que fait chacune et pourquoi elle est placée dans cet ordre.

**Section 1 — Définition du bastion.** Déclare le jump host avec son nom d'utilisateur. Pas de `ProxyJump` ici (il boucherait sur lui-même) et pas d'`IdentityFile` (la VM utilise l'authentification que vous avez configurée séparément pour elle).

**Section 2 — Valeurs par défaut par domaine.** Elles s'appliquent quand vous tapez un FQDN complet comme `ssh server-prod.office.corp.example`. SSH récupère le `User` ici, puisqu'aucune stanza précédente ne l'a défini. Plusieurs stanzas de domaine avec le même nom d'utilisateur, c'est normal — une par suffixe de domaine. Ces stanzas sont aussi utiles pour les scripts qui construisent des hostnames par programme ou pour les appels `ssh-copy-id`.

**Section 3 — Alias courts.** Chaque alias déclare `HostName` (le vrai FQDN) et `User`. Ajouter un nouvel alias de serveur, c'est exactement deux lignes.

**Section 4 — Exceptions explicites.** Tout host qui ne doit pas passer par le bastion — un service d'hébergement Git, un runner CI, une API SaaS — reçoit `ProxyJump none` ici. La position est structurante : cette stanza doit venir *avant* `Host *`.

**Section 5 — Valeurs globales par défaut.** Le préfixe `!` dans `Host * !`<Var name="vmIp">windows-vm-ip</Var> signifie « tous les hosts *sauf* le bastion ». Placée en dernier, cette stanza fournit `ProxyJump` et `IdentityFile` comme fallbacks pour chaque stanza précédente qui ne les a pas définis — c'est-à-dire toutes. N'importe quelle stanza des sections 2, 3 ou 4 peut écraser ces valeurs simplement en déclarant la directive en premier, sans toucher à la section 5.

## Renforcer la section 5 (optionnel) {#hardening-section-5-optional}

Quatre directives étendent les valeurs globales sans en changer la logique. Ajoutez celles qui correspondent à votre environnement — aucune n'est requise pour que la config fonctionne.

<Snippet title={<>C:\Users\your_laptop_user\.ssh\config · ~/.ssh/config</>} source="./files/ssh_config_section2_full.txt" />

- **`ServerAliveInterval 30` / `ServerAliveCountMax 3`** — SSH envoie un paquet keepalive toutes les 30 secondes. Après 3 paquets sans réponse (90 secondes de silence), la connexion est fermée proprement au lieu de rester bloquée sur un prompt gelé. Sans ça, un terminal inactif sur un serveur d'entreprise se fige souvent sans aucun message d'erreur.
- **`ConnectTimeout 5`** — échoue après 5 secondes si le serveur est injoignable. Sur un réseau d'entreprise avec un bastion fiable, le timeout par défaut de 2 minutes n'est que du bruit.

<AlertBox variant="important" title="ControlMaster ne fonctionne pas avec OpenSSH sous Windows">

`ControlMaster auto` / `ControlPath` / `ControlPersist` activent le multiplexage SSH : la première connexion ouvre une socket de domaine Unix dans `~/.ssh/` ; les connexions suivantes réutilisent le tunnel au lieu d'en négocier un nouveau à travers le bastion. Sous Linux et macOS, ça marche bien.

Sous **OpenSSH Windows avec ProxyJump**, ces trois directives cassent silencieusement toutes les connexions — `ssh` se bloque ou sort avec `Read from remote host: Unknown error` — parce que l'implémentation des sockets Unix sous Windows n'est pas compatible avec le forwarding stdio basé sur des pipes de ProxyJump. Le commentaire `# Optional` n'est pas une protection suffisante : les lignes sont copiées et cassent tout.

Ne les mettez pas sous Windows. Si vous vous connectez depuis Linux ou macOS, ajoutez-les :

```text
    ControlMaster auto
    ControlPath ~/.ssh/cm_%C
    ControlPersist 10m
```

`%C` est un hash des paramètres de connexion — pas de deux-points, pas de caractères spéciaux. N'utilisez jamais `%r@%h:%p` : le `:` est illégal dans les noms de fichiers Windows et corrompt silencieusement le path de la socket, même quand ControlMaster est par ailleurs fonctionnel.

</AlertBox>

## Pourquoi chaque alias a besoin de sa propre ligne `User` (à passer si la config fonctionne déjà chez vous) {#why-each-alias-needs-its-own-user-line-skip-if-the-config-just-works-for-you}

Les stanzas de domaine de la section 2 ne définissent `User` que quand SSH y trouve une correspondance — et comme noté plus haut, SSH fait correspondre les motifs à l'argument de la ligne de commande, pas au hostname résolu.

En lançant `ssh project_prod` :

1. Ne correspond **pas** à `Host *.office.corp.example` (section 2) — `project_prod` n'est pas un FQDN.
2. Correspond à `Host project_prod` (section 3) → applique `HostName server-prod.office.corp.example` et `User `<Var name="userB">user-b</Var>.
3. Ne correspond **pas** à `Host github.com` (section 4) — `project_prod` n'est pas dans cette liste.
4. Correspond à `Host * !`<Var name="vmIp">windows-vm-ip</Var> (section 5) → applique `ProxyJump` et `IdentityFile`.

Sans la ligne `User` dans la stanza de l'alias, SSH retombe sur votre nom d'utilisateur Windows local pour cette connexion — ce qui est presque certainement faux.

En lançant directement `ssh server-prod.office.corp.example` :

1. Correspond à `Host *.office.corp.example` (section 2) → `User `<Var name="userB">user-b</Var>.
2. Ne correspond **pas** à `Host github.com` (section 4) — pas dans cette liste.
3. Correspond à `Host * !`<Var name="vmIp">windows-vm-ip</Var> (section 5) → `ProxyJump`, `IdentityFile`.

Les deux chemins arrivent sur le bon utilisateur. Ils ont juste besoin de stanzas différentes pour y arriver.

<AlertBox variant="tip" title="Utilisateurs ZSH : autocomplétez vos alias">

Le <Link to="/blog/zsh-plugin-ssh-config-suggestions">plugin zsh-ssh-config-suggestions</Link> lit `~/.ssh/config` et propose des complétions sur `ssh <Tab>`. Chaque alias de la section 3 devient une suggestion — plus votre liste d'alias est longue, plus c'est utile.

</AlertBox>

## Une réserve : le wildcard est vraiment universel (à passer si cette machine est purement professionnelle) {#one-caveat-the-wildcard-is-truly-universal-skip-if-this-machine-is-corporate-only}

`Host * !`<Var name="vmIp">windows-vm-ip</Var> s'applique à **chaque** connexion SSH depuis cette machine — y compris `ssh github.com` ou `ssh localhost`. Les connexions vers des hosts externes tenteront un `ProxyJump` à travers la VM et échoueront si la VM n'est pas joignable.

<AlertBox variant="warning" title="Devcontainers : déclarez les exceptions avant Host *">

Quand la config SSH est bind-mountée dans un devcontainer, le hostname du bastion peut ne pas se résoudre dans le réseau du container. Toute connexion SSH depuis le container — `git push`, `scp`, `rsync` — tombe sur `Host *`, tente un `ProxyJump` à travers le bastion, n'arrive pas à le résoudre et sort avec :

```text
ssh: Could not resolve hostname your-bastion: Name or service not known
```

Les hosts qui doivent contourner le bastion ont besoin d'une stanza `ProxyJump none` explicite **avant** `Host *`. SSH applique la règle « première valeur gagnante » par directive : un `ProxyJump none` placé après `Host *` est silencieusement ignoré. La section 4 de la config ci-dessus existe précisément pour ça — ajoutez-y tout host qui se connecte directement (hébergement Git, runners CI, API tierces).

</AlertBox>

Trois options si ça vous pose problème :

- **Remplacez `Host *` par une liste de domaines explicite :** `Host *.project-a.internal *.cloud.corp.example *.office.corp.example`. Les connexions vers tout ce qui est en dehors de cette liste ignorent complètement le bastion.
- **Gardez `Host *`** si cette machine utilise SSH exclusivement pour des serveurs internes à votre réseau d'entreprise. Sur une machine de travail dédiée, le wildcard convient très bien.
- **Écrasez des hosts spécifiques au-dessus de la section 4.** Comme les valeurs globales sont en dernier, toute stanza placée avant elles l'emporte. Ajoutez une exemption n'importe où au-dessus de la section 4 — la position à l'intérieur des sections 1 à 3 n'a pas d'importance :

```text
# Anywhere above section 4 — fits naturally in section 3 alongside the other aliases
Host github.com gitlab.com
    ProxyJump none
    IdentityFile ~/.ssh/id_ed25519_personal

# Section 4 — global defaults (last, unchanged)
Host * !windows-vm-ip
    ProxyJump ...
```

- **Découpez la config avec `Include`** — la solution la plus propre pour une machine utilisée à la fois pour du SSH professionnel et personnel :

```text
# ~/.ssh/config
Include ~/.ssh/config.d/work
Include ~/.ssh/config.d/personal
```

`~/.ssh/config.d/work` contient la config d'entreprise complète (bastion, stanzas de domaine, alias, valeurs globales en dernier). `~/.ssh/config.d/personal` contient une config propre sans routage par bastion. Les directives `Include` sont traitées de haut en bas avant tout bloc `Host` du fichier principal — OpenSSH 7.3+ requis.

## Bonus : se connecter directement en tant qu'autre utilisateur {#bonus-log-in-directly-as-another-user}

Certains serveurs exigent que vous vous connectiez avec votre propre compte puis basculiez vers un utilisateur applicatif — `sudo su app_user` suivi de `cd /opt/project`. La directive `RemoteCommand` automatise toute la séquence depuis l'alias.

Le générateur ci-dessous produit **deux alias par serveur** : un alias simple pour VSCode Remote Explorer (sans `RemoteCommand`) et une variante `_app` pour les sessions de terminal qui vous connecte directement en tant qu'utilisateur applicatif.

## Générez votre configuration complète {#generate-your-complete-config}

Remplissez vos valeurs une fois et copiez le résultat directement dans `~/.ssh/config`. Pour un second projet, copiez-collez uniquement les alias de la section 3 et changez le nom du projet — le bastion et les valeurs globales sont déjà en place.

<ConfigGenerator
  template={sshConfigTemplate}
  title="Générateur de ~/.ssh/config"
  storageKey="ssh-config"
  globalFields={[
    { name: "vmUser",      label: "Nom d'utilisateur du bastion/de la VM",               default: "vm-user",        section: "Sections 1 & 4 — Bastion + valeurs globales" },
    { name: "vmIp",        label: "Hostname ou IP du bastion/de la VM",         default: "windows-vm-ip" },
    { name: "sshKey",      label: "Nom du fichier de clé privée SSH",          default: "id_ed25519" },
    { name: "projectName", label: "Nom du projet",                      default: "project",         section: "Section 3 — Serveurs", lowercase: true },
    { name: "userB",       label: "Votre nom d'utilisateur sur les serveurs d'entreprise", default: "user-b" },
  ]}
  fields={[
    {
      type: "list",
      name: "domains",
      label: "Section 3 — Valeurs par défaut par domaine (optionnel)",
      collapsible: true,
      defaultCollapsed: true,
      optional: true,
      defaultRows: [
        { domain: "*.office.corp.example", user: "user-b" },
      ],
      fields: [
        { type: "string", name: "domain", label: "Motif de domaine", default: "*.example.com" },
        { type: "string", name: "user",   label: "Nom d'utilisateur",       default: "user-b" },
      ],
    },
    {
      type: "list",
      name: "servers",
      label: "Section 4 — Serveurs",
      collapsible: true,
      keyField: "environment",
      defaultRows: [
        {
          environment: "test",
          hostname: "server-test.office.corp.example",
          appUser: "app-user",
          appDir: "/opt/folder_devcontainer",
        },
        {
          environment: "prod",
          hostname: "server-prod.office.corp.example",
          appUser: "app-user",
          appDir: "/opt/project",
        },
      ],
      fields: [
        { type: "string", name: "environment", label: "Environnement",   default: "test" },
        { type: "string", name: "hostname",    label: "Hostname",      default: "server.example.com" },
        { type: "string", name: "appUser",     label: "Utilisateur applicatif",      default: "app-user" },
        { type: "string", name: "appDir",      label: "Répertoire de l'application", default: "/opt/app" },
      ],
    },
  ]}
/>

<AlertBox variant="tip" title="Testez d'abord la connexion au bastion">

Avant de tester un alias complet, vérifiez que le bastion lui-même est joignable et accepte votre clé :

<Terminal source="./files/terminal_test_bastion.txt" title="laptop: ~" />

`echo bastion-ok` est une commande non interactive — elle se termine immédiatement après l'affichage, sans laisser de session ouverte. Si la sortie apparaît, la section 1 et la section 4 sont correctement câblées. Si ça bloque ou échoue, le problème se situe entre votre machine et le bastion, indépendamment de tout alias de serveur.

</AlertBox>

<AlertBox variant="important" title="VSCode Remote Explorer ne fonctionne pas avec RemoteCommand">

VSCode Remote SSH injecte son propre processus serveur pendant la connexion. `RemoteCommand` remplace le shell distant avant que cette injection puisse avoir lieu — la connexion se ferme avant que VSCode ait pu prendre pied. Utilisez les alias simples `project_test` / `project_prod` pour Remote Explorer ; naviguez vers le répertoire de l'application depuis VSCode une fois connecté.

</AlertBox>

Le `RemoteCommand` de la variante `_app` enchaîne deux choses : un `cd` vers le répertoire de l'application et un `exec bash -l` pour démarrer un shell de login en tant qu'utilisateur applicatif. `RequestTTY yes` alloue un pseudo-terminal — sans ça, la session se ferme immédiatement après la commande au lieu de vous donner un shell interactif.

<Terminal source="./files/terminal_remotecommand_test.txt" title="laptop: ~" />

<Terminal source="./files/terminal_remotecommand.txt" title="laptop: ~" />

Les quatre alias récupèrent automatiquement le `ProxyJump` global de la section 4.

<AlertBox variant="important" title="sudo doit être sans mot de passe — ou utilisez su">

`sudo -u `<Var name="appUser">app-user</Var> dans un `RemoteCommand` ne fonctionne silencieusement que si le fichier sudoers accorde `NOPASSWD` à votre compte pour cet utilisateur précis. Sinon, la connexion se bloquera en attendant un mot de passe que SSH ne peut pas fournir avant que le TTY soit complètement établi.

Si sudo sans mot de passe n'est pas configuré, utilisez plutôt `sudo su - `<Var name="appUser">app-user</Var> — avec `RequestTTY yes`, le TTY est alloué avant l'exécution de la commande, donc la demande de mot de passe s'affiche normalement :

```text
RemoteCommand sudo su - app-user -c "cd /opt/project && exec bash -l"
```

Vous verrez la demande de mot de passe sudo une fois, puis vous arriverez dans le shell.

</AlertBox>

## Avertissement pour les environnements de production {#production-environment-warning}

Une bannière `RemoteCommand` n'est visible que par celui qui a configuré cet alias SSH. Le bon endroit pour un avertissement de production, c'est le **serveur lui-même** — ainsi il atteint tous les utilisateurs, quel que soit leur client.

Déposez un script dans `/etc/profile.d/` sur le serveur. Chaque shell interactif source ce répertoire à la connexion :

```bash title="/etc/profile.d/env-banner.sh (on the server)"
#!/usr/bin/env bash
case "$(hostname -s)" in
  *prod*|*prd*)
    printf '\033[38;5;88;48;5;224m  ⚠  Production server — be careful!  \033[0m\n\n'
    export PS1='\[\033[38;5;88;48;5;224m\] ⚠ PROD \[\033[0m\] \u@\h:\w\$ '
    ;;
esac
```

La paire de couleurs `38;5;88` (bordeaux foncé) sur `48;5;224` (rose pâle) est clairement visible sans être agressive — un rappel, pas un panneau d'alarme.

<Terminal source="./files/terminal_prod_banner.txt" title="laptop: ~" />

Comme `exec bash -l` dans le `RemoteCommand` démarre un shell de login, les scripts de profil s'exécutent et la bannière apparaît aussi sur chaque connexion `_app`. Aucun changement nécessaire dans la config SSH.

<AlertBox variant="tip" title="Détection par hostname vs fichier explicite">

Faire correspondre `hostname -s` à `*prod*` est pratique mais fragile — un host nommé `deployments-node` ne correspondrait à rien. Un fichier marqueur explicite est plus fiable :

```bash
if [[ -f /etc/env-type ]] && grep -qx "production" /etc/env-type; then
```

Créez `/etc/env-type` avec le contenu `production` lors du provisioning d'un serveur. Le test est sans ambiguïté, quel que soit le hostname.

</AlertBox>

## Conclusion {#conclusion}

Une seule stanza wildcard élimine la répétition de `ProxyJump` et `IdentityFile` dans chaque alias. Les stanzas de domaine ajoutent les noms d'utilisateur pour l'accès direct par FQDN. Les alias courts répètent `User` explicitement — parce que SSH fait la correspondance sur ce que vous tapez, pas sur ce que l'alias résout.

Ajouter un nouveau serveur, c'est deux lignes : `HostName` et `User`. Le routage est déjà géré. Quand un serveur exige un utilisateur et un répertoire spécifiques, `RemoteCommand` transforme cette séquence en un simple alias. Et quand un serveur de production a besoin d'un avertissement visuel clair pour tout le monde, `/etc/profile.d/` est le bon endroit — pas la config SSH.

Si vous devez <Link to="/blog/github-connect-using-ssh">générer ou gérer vos clés SSH</Link>, cet article couvre la génération de clés `ed25519` et l'autorisation GitHub depuis zéro — la même clé que celle utilisée dans la ligne `IdentityFile` ci-dessus.
