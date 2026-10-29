---
slug: docusaurus-typo-report-component
title: "Laissez vos lecteurs signaler les problèmes — un widget de feedback multi-types pour Docusaurus"
date: 2026-10-29
authors: [christophe]
image: /img/v2/docusaurus_typos.webp
description: Construisez un widget de feedback lecteur sécurisé et SSR-safe pour votre blog Docusaurus — sélection de texte, 4 types de feedback, API PHP avec nonce HMAC, rate limiting, déduplication, dashboard admin et notifications par email.
series: Creating Docusaurus components
mainTag: component
tags:
  - docusaurus
  - component
  - php
  - react
  - security
language: fr
ai_assisted: true
---

![Laissez vos lecteurs signaler les problèmes — un widget de feedback multi-types pour Docusaurus](/img/v2/docusaurus_typos.webp)

<TLDR>
Un lecteur repère un problème dans votre article — une faute de frappe, une erreur factuelle, une commande obsolète. Il n'a aucun moyen de vous le dire. Il passe à autre chose. Vous n'en saurez jamais rien. Cet article construit de A à Z un widget de feedback à sens unique : le lecteur sélectionne un passage, un popover apparaît avec quatre types de problème (faute de frappe, information incorrecte, contenu obsolète, suggestion), il ajoute éventuellement des détails, et le signalement atterrit dans un fichier JSON sur votre serveur avec une notification par email. L'API PHP est durcie avec des nonces HMAC, un honeypot, du rate limiting et de la déduplication. Le composant React est SSR-safe, utilise une machine à états propre et limite les envois via `localStorage`. Un dashboard admin associé, sur `/typo-dashboard`, vous permet de relire tous les signalements par type. Pas de base de données, pas de service tiers, aucune dépendance npm au-delà de ce que Docusaurus embarque déjà.
</TLDR>

Votre blog est votre vitrine publique. Une faute de frappe qui traîne, une commande qui ne fonctionne plus, une API qui a changé — chaque lecteur qui tombe sur ce paragraphe vous coûte en crédibilité. Le problème, c'est que la plupart des lecteurs ne prendront pas la peine d'ouvrir une issue GitHub ou d'envoyer un email. Mais si vous rendez la chose vraiment triviale — un clic, là où ils se trouvent — un nombre surprenant le fera.

Cet article construit ce mécanisme de bout en bout.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Démonstration", to: "#see-it-in-action" },
    { label: "Créer le composant", to: "#create-the-component" },
  ]}
/>

## Démonstration {#see-it-in-action}

Le widget est actif sur cette page même. **Sélectionnez quelques mots de ce paragraphe** avec votre souris (ou votre doigt sur un téléphone) : un popover apparaît juste sous la sélection, avec quatre types de feedback.

<BrowserWindow url="https://www.avonture.be/blog/docusaurus-typo-report-component">

![Le popover de feedback, avec ses quatre types, sous une sélection de texte](./images/typo_popover.webp)

</BrowserWindow>

Le lecteur en choisit un, puis un petit formulaire lui permet d'ajouter un commentaire facultatif avant l'envoi. Le formulaire le dit clairement : **c'est un signal à sens unique** — le lecteur ne laisse pas d'email, donc personne n'attend de réponse.

<BrowserWindow url="https://www.avonture.be/blog/docusaurus-typo-report-component">

![Le formulaire de détails, affiché une fois le type de feedback choisi](./images/typo_form.webp)

</BrowserWindow>

De votre côté, chaque signalement atterrit dans un fichier JSON sur le serveur, vous recevez un email, et une page protégée par token liste tout, du plus récent au plus ancien, avec des compteurs par type :

<BrowserWindow url="https://www.avonture.be/typo-dashboard">

![Le dashboard admin listant les signalements reçus](./images/typo_dashboard.webp)

</BrowserWindow>

## Comment ça marche {#how-it-works}

La fonctionnalité se compose de deux moitiés indépendantes qui reprennent le schéma utilisé par le [composant Reaction](/blog/docusaurus-reactions) (votes like / dislike) :

```plaintext
Reader selects text
  └─ mouseup / touchend fires on <article>
       └─ popover shows 4 feedback-type buttons (phase: selecting)
            └─ reader picks a type → optional details form (phase: confirming)
                 └─ POST api/typo.php
                      └─ validates nonce, honeypot, rate limits, dedup
                           └─ writes typo-data.json
                                └─ emails admin (6h cooldown)
```

- **Pas de base de données** — les signalements sont ajoutés à un fichier JSON, sous verrou de fichier.
- **Pas de service tiers** — un simple script PHP posé à côté de vos fichiers statiques.
- **Défense en profondeur** — neuf couches indépendantes bloquent les bots, les floods et les doublons (détaillées à la fin, pour les curieux).
- **SSR-safe** — le composant ne rend rien tant que le lecteur n'a pas sélectionné de texte.

---

## Partie 1 — L'API PHP {#part-1--the-php-api}

### Pourquoi PHP ? {#why-php}

Docusaurus produit un site statique. Il n'a aucun runtime côté serveur. Si vous êtes sur un hébergement mutualisé (OVH, Infomaniak, o2switch…), un petit <Link to="/blog/php-api-tips">PHP script</Link> posé à côté de vos fichiers statiques est le backend le moins contraignant possible — pas de process Node à gérer, pas de container Docker, pas de démarrage à froid serverless.

### Structure des fichiers sur le serveur {#file-structure-on-the-server}

```tree expanded=true showJSX=false debug=false title="File structure"
public_html/
  api/
    .env                    ← secrets (never committed)
    .env.example            ← template committed to git
    .htaccess               ← protects JSON files
    typo.php                ← the API
    typo-data.json          ← reports (writable by web server)
    typo-ratelimit.json     ← counters
    typo-notifications.json ← email throttle
```

### Le script {#the-script}

L'API répond à trois requêtes : `GET` distribue un nonce (et, avec `?admin=TOKEN`, la liste complète des signalements), `POST` enregistre un signalement, `OPTIONS` répond au preflight CORS. Chaque `POST` traverse les neuf couches décrites dans la section sécurité, à la fin de cet article, avant que quoi que ce soit ne soit écrit.

<Snippet filename="api/typo.php" source="./files/typo.php" />

### Protéger les fichiers JSON {#protect-the-json-files}

Sans la <Link to="/blog/apache-htaccess">règle .htaccess</Link> livrée dans `api/.htaccess`, n'importe qui peut faire `GET https://yourdomain.com/api/typo-data.json` et lire tous les signalements.

### Les secrets {#secrets}

Le fichier `api/.env` contient deux secrets. Générez-les avec :

<Terminal  wrap={true} typewriter>
openssl rand -hex 32   # IP_HASH_SALT
openssl rand -hex 32   # NONCE_SECRET
</Terminal>

---

## Partie 2 — Le composant React {#part-2--the-react-component}

### La sécurité SSR d'abord {#ssr-safety-first}

Docusaurus rend les pages côté serveur (Node.js) avant de les hydrater dans le navigateur. Tout code qui touche à `window`, `document` ou `localStorage` fera planter la passe SSR s'il s'exécute au niveau du module ou dans le corps du composant.

Les règles :

1. Tout accès au DOM se fait dans un `useEffect` — il ne s'exécute que dans le navigateur.
2. L'état est initialisé à `"idle"`, pas à une valeur lue depuis le navigateur.
3. Le composant retourne `null` à l'état idle — pas de DOM, pas de mismatch SSR.

### Machine à états {#state-machine}

Six phases, linéaires avec une seule bifurcation :

```plaintext
idle
  └─ user selects text → selecting
       └─ user picks a feedback type → confirming
            └─ form submitted → submitting
                 ├─ success → done
                 └─ error   → error
```

`done` et `error` affichent un badge que l'on peut fermer et qui remet l'état à `idle`. `selecting` et `confirming` repassent à `idle` si l'utilisateur clique en dehors du popover. `confirming` propose un lien « changer » qui ramène à `selecting`.

### Les helpers localStorage {#localstorage-helpers}

Avant que le popover de sélection du type n'apparaisse, deux gardes côté client s'exécutent :

1. **Rate limit** — maximum 5 envois par navigateur et par heure. Les timestamps sont stockés dans un tableau JSON dans `localStorage` sous la clé `"typo_reports"`. Les entrées de plus de 24 heures sont purgées à chaque écriture.

2. **Déduplication** — un hash FNV-1a de `slug + "|" + lowercase(text)` est stocké à côté du timestamp. Si le même texte a déjà été signalé depuis ce navigateur (quel que soit le type), le composant saute directement à `done`.

FNV-1a est utilisé plutôt que `crypto.subtle.digest` parce qu'il est synchrone, et le risque de collision est acceptable dans ce cas d'usage.

```js
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}
```

### Les types de feedback {#feedback-types}

Quatre types couvrent la grande majorité des problèmes qu'un lecteur peut remarquer :

```js
const FEEDBACK_TYPES = [
  { id: "typo",       icon: "🔤", label: "Typo" },
  { id: "incorrect",  icon: "❌", label: "Incorrect" },
  { id: "outdated",   icon: "⏰", label: "Outdated" },
  { id: "suggestion", icon: "💡", label: "Suggestion" },
];
```

Ils sont affichés dans une grille 2×2. L'API PHP valide le champ `type` contre cette même whitelist — toute autre valeur renvoie un 400.

### Capturer le contexte {#capturing-context}

Quand l'utilisateur sélectionne du texte, le composant enregistre ±100 caractères de texte environnant depuis `article.innerText`. Ce contexte est envoyé à l'API pour que vous puissiez localiser la phrase exacte sans ouvrir l'article :

```js
const fullText = article.innerText || "";
const idx = fullText.indexOf(text);
contextRef.current = idx !== -1
  ? fullText.slice(Math.max(0, idx - 100), idx + text.length + 100)
  : "";
```

### Positionnement du tooltip {#tooltip-positioning}

Le popover apparaît juste sous la sélection. `window.scrollY + rect.bottom + 8` le place 8px sous le bord inférieur du texte sélectionné. Pour éviter que le formulaire de 280px de large ne déborde du bord droit du viewport :

```js
const left = Math.min(window.scrollX + rect.left, window.innerWidth - 296);
```

### Le composant {#the-component}

<Snippet filename="src/components/TypoReport/index.tsx" source="./files/index.tsx" />

Trois points à noter :

- `touchend` est enregistré en plus de `mouseup` pour que le widget fonctionne sur les appareils tactiles.
- `handleTypeSelect` exécute les vérifications de rate limit et de déduplication au moment du choix du type, pas à la sélection — cela évite de consommer un slot de rate limit quand l'utilisateur sélectionne simplement du texte pour le copier.
- Le paragraphe `disclaimer` (« Signal à sens unique — aucune réponse ne sera envoyée ») est volontaire : le dire explicitement évite la frustration.

Le module CSS utilise partout les propriétés personnalisées `--ifm-*` de Docusaurus, donc le widget suit votre thème et le mode sombre sans effort supplémentaire.

---

## Partie 3 — L'intégration dans Docusaurus {#part-3--wiring-into-docusaurus}

C'est ici qu'intervient le swizzling de Docusaurus. Plutôt que de modifier directement le fichier du thème en amont, Docusaurus vous permet de copier n'importe quel composant du thème dans `src/theme/` et de le surcharger. Si vous n'avez pas encore swizzlé `BlogPostItem`, lancez :

<Terminal  wrap={true} typewriter>
yarn swizzle @docusaurus/theme-classic BlogPostItem --wrap
</Terminal>

Cela crée `src/theme/BlogPostItem/index.js`. Ouvrez-le et ajoutez :

<Snippet filename="src/theme/BlogPostItem/index.js" source="./files/BlogPostItem.js" />

Le garde `isBlogPostPage` est essentiel — sans lui, le composant se monterait aussi sur la page de liste du blog, où il n'y a pas d'élément article.

---

## Partie 4 — Le dashboard admin {#part-4--the-admin-dashboard}

L'endpoint admin PHP (`GET ?admin=TOKEN`) renvoie du JSON brut. Plutôt que de lire cette réponse brute, une petite page React sur `/typo-dashboard` la présente dans un format lisible : elle aplatit tous les tableaux de signalements par slug en une seule liste triée du plus récent au plus ancien, et affiche des compteurs récapitulatifs par type en haut.

Le dashboard est protégé par token : il réutilise la même clé `reactions_admin_token` dans `localStorage` que le dashboard des réactions, donc vous ne vous authentifiez qu'une fois pour les deux.

Si vous avez une page d'accueil admin, ajoutez cette entrée à son tableau `TOOLS` dans `src/pages/admin.js` :

<Snippet filename="src/pages/admin.js" source="./files/admin-tool.js" />

---

## Créer le composant {#create-the-component}

Créez ces fichiers dans votre site Docusaurus, puis copiez `api/.env.example` vers `api/.env` et collez-y les deux secrets générés plus haut :

<ProjectSetup folderName="/your_docusaurus_site" createFolder={false}>
  <Snippet filename="api/typo.php" source="./files/typo.php" defaultOpen={false} />
  <Snippet filename="api/.htaccess" source="./files/.htaccess" defaultOpen={false} />
  <Snippet filename="api/.env.example" source="./files/.env.example" defaultOpen={false} />
  <Snippet filename="src/components/TypoReport/index.tsx" source="./files/index.tsx" defaultOpen={false} />
  <Snippet filename="src/components/TypoReport/styles.module.css" source="./files/styles.module.css" defaultOpen={false} />
  <Snippet filename="src/pages/typo-dashboard.js" source="./files/typo-dashboard.js" defaultOpen={false} />
  <Snippet filename="src/pages/typo-dashboard.module.css" source="./files/typo-dashboard.module.css" defaultOpen={false} />
</ProjectSetup>

Montez ensuite le composant dans `src/theme/BlogPostItem/index.js` comme montré en partie 3.

### Déploiement {#deployment}

L'API utilise `declare(strict_types=1)` et un type de retour `never` sur `jsonError()`, donc votre serveur doit tourner en **PHP 8.1 ou plus récent** :

<Terminal  wrap={true} typewriter>
php -v
</Terminal>

Les trois fichiers JSON doivent être accessibles en écriture par le process du serveur web :

<Terminal  wrap={true} typewriter>
$ chmod 664 api/typo-data.json api/typo-ratelimit.json api/typo-notifications.json
</Terminal>

Une fois déployé, vérifiez l'aller-retour complet avant d'annoncer la fonctionnalité :

<Snippet filename="smoke-test.sh" source="./files/smoke_curl_command.txt" />

Nettoyez après le test :

<Snippet filename="cleanup.sh" source="./files/smoke_cleanup.txt" />

---

## Conception de la sécurité — couche par couche (sautez si vous voulez juste que ça tourne) {#security-design--layer-by-layer-skip-this-if-you-just-want-it-running}

Chaque `POST` traverse neuf couches indépendantes avant qu'un signalement ne soit écrit.

### Couche 1 — CORS {#layer-1--cors}

Seuls `https://www.yourdomain.com` et `http://localhost:3000` (dev) sont autorisés comme `Origin`. Toute autre origine reçoit un `403` silencieux. Les requêtes same-origin n'envoient pas d'en-tête `Origin` et passent.

### Couche 2 — Whitelist des méthodes {#layer-2--method-whitelist}

L'API ne répond qu'à `GET` (nonce + admin), `POST` (envoi) et `OPTIONS` (preflight). Tout le reste reçoit `405 Method Not Allowed`.

### Couche 3 — Nonce HMAC {#layer-3--hmac-nonce}

Sans cela, quiconque connaît l'URL de votre API peut envoyer des signalements arbitraires avec une simple commande `curl`. Le nonce est un token HMAC basé sur le temps :

```php
$nonce = hash_hmac('sha256', floor(time() / 900) . '|typo-report', NONCE_SECRET);
```

Le token est valable pour la fenêtre de 15 minutes en cours et la précédente (pour éviter une expiration gênante quand un utilisateur récupère le nonce à la minute 14 et envoie à la minute 15). Il n'y a aucun stockage — le token s'auto-valide. Chaque `POST` doit inclure cette valeur dans son body.

### Couche 4 — Validation des entrées, whitelist de types et honeypot {#layer-4--input-validation-type-whitelist-and-honeypot}

Le honeypot est un `<input name="website">` caché, invisible pour les humains mais rempli par les bots. Si `website !== ""`, l'API renvoie `200 OK` sans rien stocker.

Les vraies entrées sont ensuite validées :

- `slug` — alphanumérique, tirets, slashes, 200 caractères max
- `text` — 3 à 150 caractères, Unicode imprimable uniquement (`\P{C}` — pas de caractères de contrôle)
- `type` — doit valoir `typo`, `incorrect`, `outdated` ou `suggestion` (toute autre valeur → 400)
- `comment` — facultatif, 300 caractères max, même filtre de caractères
- `context` — facultatif, 300 caractères max, trimmé

### Couche 5 — Rate limit global {#layer-5--global-rate-limit}

Une fenêtre glissante de 60 secondes avec un maximum de 20 requêtes toutes IP confondues. Cela protège des pics soudains. L'état de la fenêtre est stocké sous une clé `__global__` dans `typo-ratelimit.json`, mis à jour dans un unique bloc `LOCK_EX`.

### Couche 6 — Rate limits par IP {#layer-6--per-ip-rate-limits}

Deux limites suivies indépendamment :

- 10 signalements max par IP et par heure glissante
- 3 signalements max par IP, par article, par 24 heures

Les adresses IP ne sont jamais stockées en clair. Elles sont hashées avec un sel secret : `hash('sha256', IP_HASH_SALT . $ip)`. À sens unique — vous ne pouvez pas retrouver l'IP d'origine — mais suffisamment cohérent pour agréger.

Le script lit `REMOTE_ADDR`, jamais `X-Forwarded-For` : sur un hébergement mutualisé, `X-Forwarded-For` peut être falsifié par le client, ce qui permettrait à une seule IP d'en usurper des milliers et de contourner les limites par IP.

### Couche 7 — Déduplication {#layer-7--deduplication}

Un hash SHA-256 de `slug + "|" + lowercase(text)` est stocké dans `text_hash` sur chaque signalement. Avant l'écriture, les signalements existants pour ce slug sont parcourus. Si le hash existe déjà, l'API renvoie `200 OK` sans rien stocker. Cela absorbe silencieusement les envois en double.

### Couche 8 — Écritures sous verrou de fichier {#layer-8--file-locked-writes}

PHP sur hébergement mutualisé est multi-process. Chaque écriture utilise `fopen` + `flock(LOCK_EX)` + `ftruncate` + `rewind` + `fwrite` + `flock(LOCK_UN)` + `fclose`. La vérification du rate limit et l'écriture se font dans le même verrou pour éviter les races TOCTOU.

### Couche 9 — Throttle des emails {#layer-9--email-throttle}

Vous ne voulez pas d'une boîte mail inondée si un article populaire récolte 50 signalements en une heure. Le système de notification consulte `typo-notifications.json` pour connaître le timestamp du dernier email par article. Un nouvel email n'est envoyé que si plus de 6 heures se sont écoulées depuis le précédent.

---

## Limitations connues {#known-limitations}

### Débordement du tooltip sur le bord gauche {#tooltip-overflow-on-the-left-edge}

Le clamp `Math.min(left, window.innerWidth - 296)` empêche le formulaire de 280px de sortir de l'écran à droite. Un débordement à gauche (sélection près du bord gauche sur des viewports très étroits) n'est pas géré.

### NAT en hébergement mutualisé {#shared-hosting-nat}

Les utilisateurs derrière le même NAT (par exemple le Wi-Fi d'un bureau) partagent la même `REMOTE_ADDR`. Si trois personnes différentes du même bureau signalent des problèmes sur le même article en 24 heures, la quatrième sera bloquée par le rate limit. C'est un compromis acceptable vu la contrainte de l'hébergement mutualisé.

---

## Conclusion {#conclusion}

Les lecteurs n'ouvriront jamais une issue GitHub pour vous dire qu'une commande est obsolète — mais ils sélectionneront une phrase et cliqueront sur un bouton. Avec environ 250 lignes de PHP et 300 lignes de React, chacun de ces signaux arrive désormais dans votre boîte mail, avec la phrase exacte et son contexte, sans base de données ni service tiers.

L'architecture est volontairement simple : chaque morceau peut être compris, débogué et modifié en lisant un seul fichier. Si vous voulez aussi que vos lecteurs vous disent ce qu'ils ont *aimé*, le [composant Reaction](/blog/docusaurus-reactions) utilise exactement le même schéma PHP + JSON.
