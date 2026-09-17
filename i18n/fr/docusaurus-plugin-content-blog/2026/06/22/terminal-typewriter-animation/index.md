---
slug: docusaurus-terminal-typewriter
title: "Donnez vie à vos tutoriels CLI avec un terminal machine à écrire"
date: 2026-06-22
authors: [christophe]
image: /img/v2/typewriter_terminal.webp
description: Ajoutez une animation machine à écrire à votre composant Terminal Docusaurus — les lignes de commande tapées caractère par caractère, les lignes de sortie qui apparaissent l'une après l'autre, avec un curseur clignotant et un clic pour passer l'animation. Trois nouvelles props, aucune rupture de compatibilité.
series: Creating Docusaurus components
mainTag: component
tags:
  - component
  - docusaurus
  - react
language: fr
ai_assisted: true
blueskyRecordKey: 3mouavfuwqs2g

---

![Donnez vie à vos tutoriels CLI avec un terminal machine à écrire](/img/v2/typewriter_terminal.webp)

<TLDR>
Un bloc de code statique explique ce qu'il faut lancer. Un terminal animé montre ce qui *se passe*. Cet article étend le composant `Terminal` existant avec une prop `typewriter` : les lignes de commande (celles qui commencent par `$` ou `#`) sont tapées caractère par caractère avec un curseur clignotant ; les lignes de sortie apparaissent d'un bloc après une courte pause. Trois nouvelles props contrôlent la vitesse et le rythme. Le changement est totalement rétrocompatible — chaque bloc `<Terminal>` existant reste identique tant que vous ne l'activez pas. L'implémentation, c'est du state React pur + `setTimeout`, sans aucune librairie.
</TLDR>

Les tutoriels CLI sont denses. Le lecteur suit, copie-colle les commandes, et espère que la sortie affichée correspond à ce que vous avez écrit. Mais quand l'article ne montre qu'un bloc de texte figé, la séquence des événements — la commande, la pause, la réponse — s'effondre en un seul mur de monospace.

Une animation machine à écrire restitue cette séquence. La commande apparaît lettre par lettre, comme si quelqu'un la tapait vraiment. Puis la sortie suit. L'œil du lecteur est guidé naturellement à travers l'interaction, sans explication supplémentaire.

<!-- truncate -->

<QuickJump
  links={[
    { label: "La nouvelle prop typewriter", to: "#the-new-typewriter-prop" },
    { label: "Créer le composant", to: "#create-the-component" },
  ]}
/>

Si vous lisez régulièrement mon blog, vous savez que j'ai développé un composant appelé `Terminal` qui me permet de lister une série de commandes que j'ai lancées dans une console de style Linux — et le rendu est plutôt réaliste. C'est le pendant « console » du <Link to="/blog/docusaurus-snippets">composant que j'utilise pour afficher des snippets de code</Link>. Voici un exemple :

<Terminal title="user@machine: ~/project">
$ docker compose up -d

[+] Running 3/3
 ✔ Network myapp_default   Created
 ✔ Container myapp-db-1    Started
 ✔ Container myapp-web-1   Started

</Terminal>

Il manque juste un peu de « vie » ; voyons comment le rendre vraiment sympa avec une animation de type machine à écrire.

La sortie du Terminal ci-dessus a été obtenue avec ce bloc dans mon contenu Markdown :

```jsx
<Terminal title="user@machine: ~/project">
$ docker compose up -d

[+] Running 3/3
 ✔ Network myapp_default   Created
 ✔ Container myapp-db-1    Started
 ✔ Container myapp-web-1   Started

</Terminal>
```

Docusaurus fait ensuite le rendu lors de la prévisualisation de ce post ou lors de la génération du HTML.

## La nouvelle prop `typewriter` {#the-new-typewriter-prop}

Ajoutez `typewriter` pour activer l'animation :

```jsx
<Terminal typewriter>
$ docker compose up -d

[+] Running 3/3
 ✔ Network myapp_default   Created
 ✔ Container myapp-db-1    Started
 ✔ Container myapp-web-1   Started

</Terminal>
```

Voici ce qui se passe, image par image :

1. `$` apparaît, puis `d`, puis `o`, puis `c`… la commande se tape toute seule, caractère par caractère
2. Un curseur vert clignotant `▋` suit la position courante
3. Une fois la commande entièrement tapée, une courte pause la laisse se poser
4. `[+] Running 3/3` apparaît comme une ligne complète
5. Chaque ligne de sortie suit dans l'ordre
6. Le curseur disparaît à la fin de l'animation

<AlertBox variant="tip" title="Passer l'animation">
Cliquez n'importe où sur le terminal pour sauter à la fin. Pratique pour les lecteurs qui ont déjà vu l'animation et veulent juste copier les commandes.
</AlertBox>

<Terminal typewriter>
$ docker compose up -d

[+] Running 3/3
 ✔ Network myapp_default   Created
 ✔ Container myapp-db-1    Started
 ✔ Container myapp-web-1   Started

</Terminal>

Un autre exemple :

<Terminal typewriter>
$ npm install

added 347 packages, and audited 348 packages in 12s

42 packages are looking for funding
  run "npm fund for details

found 0 vulnerabilities
</Terminal>

<Terminal typewriter>
$ npm run build

✓ frontend@1.0.0 build
✓ vite build

vite v6.2.1 building for production...
✓ 124 modules transformed.
dist/index.html                  0.58 kB
dist/assets/index-8af3d2.js    215.43 kB
✓ built in 2.14s

$ npm run preview

✓ frontend@1.0.0 preview
✓ vite preview

➜  Local:   http://localhost:4173/
➜  Network: http://192.168.1.42:4173/
</Terminal>

<Terminal typewriter>
$ git status

On branch feature/authentication
Changes not staged for commit:
  modified: src/auth/login.ts
  modified: src/auth/session.ts

$ git add .

$ git commit -m "feat(auth): add session refresh"

[feature/authentication 7c1f2ab] feat(auth): add session refresh
 2 files changed, 48 insertions(+), 12 deletions(-)

$ git push origin feature/authentication

Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Writing objects: 100% (8/8), 1.24 KiB | 1.24 MiB/s, done.
Total 8 (delta 4), reused 0 (delta 0)

To github.com:company/project.git
   e1a9c2f..7c1f2ab  feature/authentication -> feature/authentication
</Terminal>

<Terminal typewriter>
$ docker compose up -d

[+] Running 4/4
 ✔ Network api_default          Created
 ✔ Container api-db-1           Started
 ✔ Container api-redis-1        Started
 ✔ Container api-backend-1      Started

$ docker compose ps

NAME              STATUS         PORTS
api-db-1          Up 3 seconds   5432/tcp
api-redis-1       Up 3 seconds   6379/tcp
api-backend-1     Up 2 seconds   0.0.0.0:8080->8080/tcp

$ docker compose logs backend --tail=10

backend-1 | Connecting to PostgreSQL...
backend-1 | Database connection established
backend-1 | Redis connection established
backend-1 | HTTP server listening on :8080
</Terminal>

<Terminal title="root@server: ~" typewriter>
$ apt update

Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Get:2 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]

Fetched 126 kB in 1s

$ apt upgrade -y

Reading package lists...
Building dependency tree...
Calculating upgrade...

12 upgraded, 0 newly installed, 0 to remove.

$ systemctl restart nginx

$ systemctl status nginx

● nginx.service - nginx web server
     Loaded: loaded
     Active: active (running)

$ df -h

Filesystem      Size  Used Avail Use%
/dev/sda1        80G   41G   36G  54%
</Terminal>

## L'animation ne démarre que si le terminal est visible {#animation-starts-only-when-visible}

Un terminal enterré au bas d'un long article aurait fini son animation bien avant que le lecteur n'y arrive. Le composant règle ça avec l'[Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) : l'effet machine à écrire démarre seulement quand au moins 10 % du terminal entre dans le viewport. Faites défiler la page et l'animation vous accueille pile au moment où vous arrivez.

<AlertBox variant="tip">
Envie de vérifier ? Rechargez simplement cette page (<kbd>CTRL</kbd>+<kbd>F5</kbd>) et appuyez sur End pour sauter à la conclusion de ce post. Puis remontez. Les animations démarrent. Tout simplement parce que le composant Terminal se trouve maintenant dans la partie visible de la page.
</AlertBox>

## La vitesse s'adapte automatiquement au nombre de lignes {#speed-scales-automatically-with-line-count}

Deux props supplémentaires permettent d'ajuster finement le rythme, mais vous en aurez rarement besoin — le composant s'ajuste tout seul selon le nombre de lignes :

| Lignes | `typewriterSpeed` | `typewriterLineDelay` | Durée totale approx. |
|-------|-------------------|-----------------------|------------------------|
| ≤ 5   | 40 ms/car.        | 400 ms/ligne          | ~2 s                   |
| 6–10  | 25 ms/car.        | 200 ms/ligne          | ~2,5 s                 |
| 11–20 | 20 ms/car.        | 150 ms/ligne          | ~3,5 s                 |
| > 20  | 12 ms/car.        | 100 ms/ligne          | ~3,5 s                 |

Une session de 30 lignes se termine à peu près dans le même temps qu'une de 3 lignes. L'animation reste accrocheuse sans devenir une salle d'attente.

Ne surchargez ces valeurs que si vous cherchez un effet précis — une introduction lente et posée à un nouvel outil :

```jsx
<Terminal typewriter typewriterSpeed={60} typewriterLineDelay={600}>
$ fzf --version

0.54.3 (brew)
</Terminal>
```

## Comment les lignes sont classées {#how-the-lines-are-classified}

L'animation distingue deux types de lignes en regardant les premiers caractères non blancs :

- **Lignes de commande** — commencent par `$` ou `#`. Tapées caractère par caractère à `typewriterSpeed` ms/car.
- **Lignes de sortie** — tout le reste. Affichées d'un bloc après `typewriterLineDelay` ms.
- **Lignes vides** — apparaissent après une pause de 80 ms, ce qui préserve la respiration visuelle du contenu d'origine.

Autrement dit, vous n'avez pas besoin d'annoter votre contenu d'une manière particulière. Écrivez la session de terminal naturellement ; le composant en déduit la structure.

## Aucune rupture de compatibilité {#zero-breaking-changes}

Chaque bloc `<Terminal>` existant dans le code continue de s'afficher exactement comme avant. La prop `typewriter` vaut `false` par défaut, donc le comportement statique reste celui par défaut.

Si vous voulez activer l'animation partout d'un coup, un rechercher-remplacer global de `<Terminal` → `<Terminal typewriter` sur le répertoire `blog/` suffit :

```bash
grep -rl "<Terminal" blog/ | xargs sed -i 's/<Terminal\b/<Terminal typewriter/g'
```

## Aperçu de l'implémentation {#implementation-sketch}

Le composant conserve trois morceaux de state pendant l'animation :

```plaintext
revealedLines  — lines fully shown so far (string[])
lineIdx        — which line is currently being animated (number)
charIdx        — how many characters of that line are visible (number)
```

Un seul `useEffect` pilote le tick de l'animation. À chaque rendu, il décide quel timeout planifier ensuite :

- Si la ligne courante est une commande et que `charIdx < line.length` → planifier `setCharIdx(c => c + 1)` après `typewriterSpeed` ms
- Sinon (ligne de sortie, ou commande entièrement tapée) → planifier le passage à la ligne suivante après `typewriterLineDelay` ms

Quand `lineIdx` atteint la fin du tableau de lignes, `animDone` passe à `true` et le composant revient au rendu du nœud React `{children}` d'origine — la coloration syntaxique et le balisage riche des enfants sont donc préservés une fois l'animation terminée.

Le curseur clignotant, c'est une simple animation CSS :

```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.cursor {
  display: inline-block;
  color: #00ff00;
  animation: blink 1s step-end infinite;
}
```

Pas de librairie externe. Pas de canvas. Juste du state et des timers.

## Créer le composant {#create-the-component}

Vous devrez créer trois nouveaux fichiers dans votre propre site Docusaurus. Le quatrième est optionnel : c'est la documentation du composant.

<ProjectSetup folderName="/your_docusaurus_site" createFolder={false}>
  <Snippet filename="src/components/Terminal/index.tsx" source="src/components/Terminal/index.tsx" defaultOpen={false} />
  <Snippet filename="src/components/Terminal/icon.svg" source="src/components/Terminal/icon.svg" defaultOpen={false} />
  <Snippet filename="src/components/Terminal/styles.module.css" source="src/components/Terminal/styles.module.css" defaultOpen={false} />
  <Snippet filename="src/components/Terminal/readme.md" source="src/components/Terminal/readme.md" defaultOpen={false} />
</ProjectSetup>

Éditez ensuite (ou créez) le fichier `src/theme/MDXComponents.js`. Si le fichier existe déjà, ajoutez simplement les lignes surlignées ci-dessous. S'il n'existe pas encore, créez-le avec le contenu ci-dessous :

<Snippet filename="src/theme/MDXComponents.js" >

```js
// At the top of your file, add this line:

// highlight-next-line
import Terminal from "@site/src/components/Terminal";

// Then in your export section, add this line too:
export default {
  // Reusing the default mapping
  ...MDXComponents,

  // [...]

  // highlight-next-line
  Terminal
};

```

</Snippet>

À partir de maintenant, vous pouvez utiliser le composant `<Terminal>` dans vos posts. Amusez-vous bien !

*Ce fichier `src/theme/MDXComponents.js` est le registre central de tous les composants personnalisés de votre blog ; <Link to="/blog/docusaurus-override-img">Change how Docusaurus will create img tags</Link> montre comment il permet aussi de surcharger les balises natives, et pas seulement d'en ajouter de nouvelles.*
