---
slug: docusaurus-reactions
title: Ajouter des réactions de lecteurs à votre blog Docusaurus
authors: [christophe]
image: /img/v2/docusaurus_like_button.webp
series: Creating Docusaurus components
mainTag: component
tags: [docusaurus, php, react]
date: 2026-07-27
description: Construisez un widget « Cet article vous a-t-il été utile ? » entièrement fonctionnel pour votre blog Docusaurus. Guide pas à pas couvrant le backend PHP, le composant React, le module CSS, le swizzle Docusaurus et un tableau de bord d'administration — tout ce qu'il faut pour le reproduire de zéro.
language: fr
ai_assisted: true
blueskyRecordKey: 3mrjtvlhauk2g
---

![Ajouter des réactions de lecteurs à votre blog Docusaurus](/img/v2/docusaurus_like_button.webp)

<TLDR>
Ce guide détaille la construction d'un widget « Cet article vous a-t-il été utile ? » pour un blog Docusaurus — de zéro, de bout en bout. Vous allez créer un script PHP léger qui stocke les votes dans un fichier JSON et envoie des notifications par e-mail limitées en fréquence, un composant React qui lit et écrit ces votes, un module CSS qui s'intègre sans accroc à n'importe quel thème Docusaurus, et un swizzle de `BlogPostItem` pour injecter le widget **en bas** de chaque article. Une page bonus de tableau de bord d'administration vous permet de suivre les taux d'approbation de tous les articles d'un coup d'œil.
</TLDR>

Le retour des lecteurs fait partie de ces choses qui paraissent simples de l'extérieur mais qui cachent un nombre surprenant de pièces mobiles dès qu'on se met à les construire. Je voulais quelque chose de discret — pas de service tiers, pas de cookies, pas d'inscription. Juste un petit widget « Cet article vous a-t-il été utile ? » en bas de chaque article, un fichier JSON sur le serveur, et un e-mail dans ma boîte quand un lecteur vote.

Le résultat est un système autonome : un backend PHP de 160 lignes, un composant React, un module CSS et un seul swizzle. Tout vit dans votre propre repository et sur votre propre hébergement. Pas de dépendance externe, pas d'implication côté vie privée, pas de coût récurrent.

Dans cet article, je vous fais parcourir chaque fichier, chaque décision et chaque ligne qui compte — pour que vous puissiez le reproduire sur votre blog Docusaurus et l'adapter à vos besoins.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Vue d'ensemble", to: "#the-big-picture" },
    { label: "Tous les fichiers en un coup d'œil", to: "#all-files-at-a-glance" },
  ]}
/>

<BrowserWindow url="https://www.avonture.be/blog/docusaurus-easter-eggs">
  ![Reactions](./images/reactions.webp)
</BrowserWindow>

## Vue d'ensemble {#the-big-picture}

Avant d'entrer dans le vif du sujet, voici ce que nous allons construire et comment les pièces s'assemblent :

```plaintext
Browser                          Your Server
  │                                   │
  ├─ GET /api/reactions.php?slug=...  ─▶  reactions-data.json (read)
  │◀─ { helpful: 12, not_helpful: 3 } ─┤
  │                                   │
  ├─ POST /api/reactions.php          ─▶  reactions-data.json (write)
  │  { slug, vote }                   │   + email notification
  │◀─ { helpful: 13, not_helpful: 3 } ─┤
  │                                   │
  └─ GET /api/reactions.php?admin=... ─▶  reactions-data.json (full dump)
```

**Cinq fichiers sont concernés :**

| Fichier | Rôle |
|---|---|
| `api/reactions.php` | Backend PHP : stocke les votes, envoie les e-mails |
| `src/components/Reaction/index.tsx` | Composant React affiché en bas de chaque article |
| `src/components/Reaction/styles.module.css` | Module CSS du widget |
| `src/theme/BlogPostItem/index.js` | Composant Docusaurus swizzlé qui injecte le widget |
| `src/pages/reactions-dashboard.js` | Page d'administration pour visualiser tous les votes |

Deux fichiers JSON sont créés à l'exécution par le backend :

- `api/reactions-data.json` — le stockage des votes, une entrée par slug d'article
- `api/notifications.json` — les timestamps de limitation, une entrée par slug d'article

Construisons-les un par un.

---

## Étape 1 — Le backend PHP {#step-1--the-php-backend}

Créez le fichier `api/reactions.php` à la racine de votre serveur web (à côté de, ou dans, votre dossier de sortie Docusaurus). Le script PHP n'a pas besoin de se trouver dans l'arborescence source de Docusaurus ; il doit juste être joignable par le navigateur.

### 1.1 — Configuration {#11--configuration}

<Snippet filename="api/reactions.php" source="api/reactions.php" />

Quatre constantes, quatre décisions à prendre :

- **`ADMIN_EMAIL`** — où partent les notifications par e-mail. Utilisez votre propre adresse.
- **`ADMIN_TOKEN`** — une longue chaîne aléatoire (32 caractères ou plus). Elle protège l'endpoint d'administration qui renvoie tous les votes. Générez-la avec `openssl rand -base64 24` dans votre terminal et ne la mettez jamais dans un commit sur un repository public.
- **`NOREPLY`** — votre adresse e-mail noreply.
- **`NOTIFY_COOLDOWN_SECONDS`** — le nombre minimum de secondes entre deux e-mails de notification *pour le même article*. La valeur par défaut est 3 600 (une heure). Cela évite que votre boîte soit inondée quand un article devient viral.
- **`SITE_URL`** — votre domaine public, utilisé pour construire les liens cliquables dans l'e-mail de notification et pour valider les origines CORS. **Pensez à remplacer cette valeur par la vôtre.**

<AlertBox variant="tip" title="Utiliser un fichier .env">
Ne codez pas en dur votre e-mail, votre token, etc. dans le fichier PHP. Ajoutez le fichier `api/.env` à côté du fichier `reactions.php` et remplacez les valeurs d'exemple par les vôtres.

  <Snippet filename="api/.env" source="api/.env.example" />
</AlertBox>

### 1.2 — CORS {#12--cors}

Un mot sur le CORS : dans ce fichier `api/reactions.php`, vous trouverez ce snippet :

```php title="api/reactions.php"
$allowedOrigins = [
    SITE_URL,
    'https://localhost:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
```

Le bloc CORS fait deux choses.

D'abord, il rejette toute requête qui ne provient pas de votre site ou de `localhost:3000` (votre serveur de développement Docusaurus local). Sans ce contrôle, n'importe qui pourrait envoyer de faux votes en POST depuis n'importe quelle origine. Le contrôle est strict (`in_array` avec le troisième argument `true`) : pas de correspondance partielle, pas de joker.

Ensuite, il renvoie l'origine validée dans l'en-tête `Access-Control-Allow-Origin`. C'est plus correct que l'approche avec le joker `*` parce que cela fonctionne avec les credentials et indique explicitement aux navigateurs quelle origine est autorisée — et l'en-tête `Vary: Origin` garantit que les caches respectent les réponses par origine.

La branche `OPTIONS` gère le preflight du navigateur qui précède tout POST cross-origin avec un en-tête `Content-Type: application/json`.

<AlertBox variant="info" title="Pourquoi localhost:3000 ?">
Pendant le développement, `yarn start` sert Docusaurus sur `https://localhost:3000`. Sans l'ajouter à la liste des origines autorisées, chaque vote depuis votre environnement de dev serait silencieusement rejeté par le navigateur avant même d'atteindre le serveur.
</AlertBox>

### 1.3 — Notification par e-mail avec limitation par article {#13--email-notification-with-per-article-throttling}

Un mot sur la notification par e-mail : dans ce fichier `api/reactions.php`, vous trouverez ce snippet :

```php title="api/reactions.php"
function maybeNotify(string $slug, string $vote, array $counts): void
{
    $throttleFile = __DIR__ . '/notifications.json';
    $throttle     = loadData($throttleFile);

    if (time() - ($throttle[$slug] ?? 0) < NOTIFY_COOLDOWN_SECONDS) {
        return;
    }

    $articleUrl   = SITE_URL . '/' . $slug;
    $dashboardUrl = SITE_URL . '/reactions-dashboard';
    $total        = $counts['helpful'] + $counts['not_helpful'];
    $ratio        = $total > 0 ? round($counts['helpful'] / $total * 100) : 0;

    $subject = "[Blog] New reaction on: $slug";
    $body    = implode("\n", [
        "A reader just reacted to one of your blog posts.",
        "",
        "Article     : $articleUrl",
        "Vote        : $vote",
        "Helpful     : {$counts['helpful']}",
        "Not helpful : {$counts['not_helpful']}",
        "Approval    : {$ratio}%",
        "",
        "View full dashboard: $dashboardUrl",
    ]);

    $headers = implode("\r\n", [
        "From: " . NO_REPLY,
        "Reply-To: " . NO_REPLY,
        "Content-Type: text/plain; charset=utf-8",
    ]);

    if (@mail(ADMIN_EMAIL, $subject, $body, $headers)) {
        $throttle[$slug] = time();
        saveData($throttleFile, $throttle);
    }
}
```

La ligne clé est le contrôle de limitation : `time() - ($throttle[$slug] ?? 0) < NOTIFY_COOLDOWN_SECONDS`. Si le dernier e-mail pour cet article a été envoyé il y a moins de `NOTIFY_COOLDOWN_SECONDS`, la fonction retourne immédiatement sans rien envoyer. Le timestamp de limitation n'est enregistré que si `mail()` réussit vraiment, donc un envoi raté ne bloque pas la tentative suivante.

L'e-mail de notification inclut le type de vote, les totaux courants et le taux d'approbation — assez de contexte pour décider si un article mérite attention sans devoir ouvrir le tableau de bord.

<AlertBox variant="tip" title="Adaptez le cooldown à votre trafic">
Sur un blog à faible trafic, un cooldown d'une heure est raisonnable. Si vous finissez un jour sur un agrégateur à fort trafic, envisagez de passer temporairement `NOTIFY_COOLDOWN_SECONDS` à `86400` (24 heures). Les votes ne sont jamais perdus, vous recevez simplement moins d'e-mails à leur sujet.
</AlertBox>

### 1.4 — Routage : GET et POST {#14--routing-get-and-post}

```php title="api/reactions.php"
$method = $_SERVER['REQUEST_METHOD'];
$slug   = '';
$vote   = '';

if ($method === 'GET') {
    // Admin request: return all reaction data
    if (array_key_exists('admin', $_GET)) {
        if (($_GET['admin'] ?? '') !== ADMIN_TOKEN) {
            jsonError(403, 'Forbidden');
        }
        echo json_encode(loadData(__DIR__ . '/reactions-data.json'));
        exit;
    }
    $slug = sanitizeSlug($_GET['slug'] ?? '');
} elseif ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $slug = sanitizeSlug($body['slug'] ?? '');
    $vote = $body['vote'] ?? '';
} else {
    jsonError(405, 'Method not allowed');
}

if ($slug === '') {
    jsonError(400, 'Missing slug');
}
```

La branche GET gère deux cas.

Quand le paramètre de query `admin` est présent, le script le compare à `ADMIN_TOKEN`. Un token correspondant renvoie le contenu complet de `reactions-data.json` — les données consommées par le tableau de bord. Un token qui ne correspond pas renvoie un `403 Forbidden`.

Quand `admin` est absent, le script lit le paramètre de query `slug`. C'est l'endpoint public que le composant React appelle au chargement de la page pour obtenir les compteurs de votes d'un article donné.

La branche POST lit le corps de la requête en JSON (le composant React envoie `Content-Type: application/json`). Elle extrait `slug` et `vote`. Les deux passent par une validation dans la section suivante.

```php title="api/reactions.php"
$dataFile = __DIR__ . '/reactions-data.json';
$data     = loadData($dataFile);

if (!isset($data[$slug])) {
    $data[$slug] = ['helpful' => 0, 'not_helpful' => 0];
}

if ($method === 'POST') {
    if ($vote === 'helpful') {
        $data[$slug]['helpful']++;
    } elseif ($vote === 'not_helpful') {
        $data[$slug]['not_helpful']++;
    } else {
        jsonError(400, 'Invalid vote value');
    }
    saveData($dataFile, $data);
    maybeNotify($slug, $vote, $data[$slug]);
}

echo json_encode($data[$slug]);
```

Au premier accès, l'entrée du slug est créée avec des compteurs à zéro. La branche POST incrémente le bon compteur, enregistre le fichier et déclenche la notification limitée. Toute valeur de `vote` autre que `helpful` ou `not_helpful` est rejetée immédiatement. La dernière ligne renvoie les compteurs (mis à jour ou non) pour ce slug, quelle que soit la méthode.

---

## Étape 2 — Le composant React {#step-2--the-react-component}

Créez le dossier `src/components/Reaction/` et le fichier `index.tsx` à l'intérieur.

<Snippet filename="src/components/Reaction/index.tsx" source="src/components/Reaction/index.tsx" defaultOpen={false} />

### 2.1 — Imports et mise en place {#21--imports-and-setup}

```tsx title="src/components/Reaction/index.tsx"
import { useState, useEffect, useCallback, type JSX } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";

interface Props {
  metadata?: {
    permalink?: string;
  };
}

interface Counts {
  helpful: number;
  not_helpful: number;
}

export default function Reaction({ metadata }: Props): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const slug = metadata?.permalink?.replace(/^\/|\/$/g, "") ?? "";
  const apiUrl = `${siteConfig.url}/api/reactions.php`;
  const storageKey = `reaction_${slug}`;
```

`metadata` est l'objet que Docusaurus passe à chaque composant d'article de blog. Nous utilisons `metadata.permalink` — le path de l'URL de l'article — comme slug. Les deux appels à `replace` retirent les slashes de début et de fin, pour que le slug corresponde à ce que produit `sanitizeSlug` côté PHP : `blog/my-article`, et non `/blog/my-article/`.

L'interface `Props` n'a besoin que de `metadata.permalink` ; tout le reste de ce que passe Docusaurus est ignoré. `Counts` est la forme `{ helpful, not_helpful }` que renvoie l'endpoint PHP — réutilisée plus bas pour l'état `counts`.

`siteConfig.url` est votre URL de production issue de `docusaurus.config.js`. Le composant construit l'URL de l'API à partir d'elle dynamiquement, ce qui signifie que cela fonctionne aussi correctement en développement (où `url` pointera vers `https://localhost:3000` si vous le configurez ainsi, mais en pratique le composant n'est monté qu'après la résolution de la config du site par Docusaurus).

`storageKey` donne à chaque article sa propre entrée dans `localStorage` (`reaction_blog-my-article`), ce qui empêche qu'un vote sur un article affecte un autre.

### 2.2 — L'état {#22--state}

```tsx title="src/components/Reaction/index.tsx"
  const [counts, setCounts] = useState<Counts | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setVoted(stored);
    } catch {}
  }, [storageKey]);
```

`counts` contient l'objet `{ helpful, not_helpful }` renvoyé par l'API. Il démarre à `null` (pas encore chargé). `submitError` est un drapeau activé quand un POST de vote échoue, pour que le rendu affiche un message de réessai.

`voted` contient le vote précédent pour cet article. Il démarre à `null` et n'est rempli qu'**après le montage**, dans un `useEffect` qui lit `localStorage`. Le `try/catch` est là parce que `localStorage` peut lever une exception en navigation privée ou quand le stockage est plein.

<AlertBox variant="note" title="Pourquoi ne pas lire localStorage dans useState ?">
Docusaurus fait un rendu serveur de chaque page. Si `voted` était initialisé depuis `localStorage` dans un initialiseur `useState`, le serveur produirait `null` (pas de `localStorage` là-bas) alors que le navigateur produirait le `"helpful"` stocké — les deux arbres HTML divergent, et React lève une erreur de hydration mismatch. Reporter la lecture dans `useEffect` garde le premier rendu client identique à celui du serveur, puis met à jour. Tout ce qui est en dehors de `useState`, `useEffect` ou d'un gestionnaire d'événement a toujours besoin d'une garde `typeof window !== "undefined"`.
</AlertBox>

### 2.3 — Charger les compteurs au montage {#23--loading-counts-on-mount}

```tsx title="src/components/Reaction/index.tsx"
  useEffect(() => {
    if (!slug) return;
    fetch(`${apiUrl}?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setCounts(data);
      })
      .catch(() => {});
  }, [slug, apiUrl]);
```

Au montage, le composant récupère les compteurs actuels pour cet article. L'appel à `encodeURIComponent` garantit que le slug est sûr dans une query string d'URL. Si la requête échoue pour une raison quelconque (erreur réseau, serveur hors service, statut non-OK), l'erreur est avalée silencieusement — le widget reste simplement dans son état initial, ce qui convient très bien.

### 2.4 — Envoyer un vote {#24--sending-a-vote}

```tsx title="src/components/Reaction/index.tsx"
  const handleVote = useCallback(
    async (vote: string) => {
      setSubmitError(false);
      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, vote }),
        });
        if (!res.ok) {
          setSubmitError(true);
          return;
        }
        const data = await res.json();
        setCounts(data);
        setVoted(vote);
        try {
          localStorage.setItem(storageKey, vote);
        } catch {}
      } catch {
        setSubmitError(true);
      }
    },
    [slug, apiUrl, storageKey],
  );
```

`handleVote` envoie `{ slug, vote }` en POST au format JSON. En cas de succès, il met à jour les compteurs affichés avec les valeurs fraîches renvoyées par le serveur, définit `voted` sur la valeur choisie (ce qui fait passer l'interface des « boutons de vote » à l'état « merci ») et enregistre le vote dans `localStorage`. Tout échec — une réponse non-OK ou un `fetch` qui lève une exception — active `submitError`, qui fait apparaître le message de réessai dans le rendu ci-dessous ; les échecs d'écriture dans `localStorage` sont avalés puisque le vote lui-même est déjà passé.

`useCallback` mémoïse la fonction pour qu'elle ne soit pas recréée à chaque rendu, ce qui est important puisqu'elle est passée en prop `onClick`.

### 2.5 — Le rendu {#25--rendering}

```tsx title="src/components/Reaction/index.tsx"
  if (!slug) return null;

  return (
    <div className={styles.container}>
      {!voted ? (
        <>
          <span className={styles.question}>Was this article helpful?</span>
          <div className={styles.buttons}>
            <button
              className={styles.btn}
              onClick={() => handleVote("helpful")}
              aria-label="Yes, this was helpful"
            >
              👍 Helpful
            </button>
            <button
              className={`${styles.btn} ${styles.btnNeutral}`}
              onClick={() => handleVote("not_helpful")}
              aria-label="No, this was not helpful"
            >
              👎 Not really
            </button>
          </div>
          {submitError && (
            <span className={styles.submitError}>
              Could not save your vote — please try again.
            </span>
          )}
        </>
      ) : (
        <div className={styles.thanks}>
          <span className={styles.thanksMsg}>
            {voted === "helpful" ? "Glad it helped! 🙌" : "Thanks for the feedback!"}
          </span>
          {counts && (
            <span className={styles.counts}>
              <span title={`${counts.helpful} found this helpful`}>
                👍 {counts.helpful}
              </span>
              <span title={`${counts.not_helpful} did not find this helpful`}>
                👎 {counts.not_helpful}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```

Le rendu a deux états. Avant le vote (`!voted`) : la question, deux boutons et — uniquement quand `submitError` est activé — un message de réessai en dessous. Après le vote (`voted` est défini) : un message de remerciement personnalisé selon le choix, plus les compteurs de votes — désormais visibles puisque le lecteur a exprimé son opinion.

Les attributs `aria-label` rendent les boutons accessibles aux lecteurs d'écran : les libellés composés uniquement d'emojis comme « 👍 Helpful » ne sont pas toujours lus correctement par les lecteurs d'écran, un libellé explicite aide donc.

Les interfaces `Props` et `Counts` en haut constituent tout le contrat : le compilateur signale une forme de `metadata` incorrecte ou un champ de compteur mal utilisé au moment du build, il n'y a donc pas de vérification `PropTypes` à ajouter à l'exécution.

---

## Étape 3 — Le module CSS {#step-3--the-css-module}

Créez le fichier `styles.module.css` dans `src/components/Reaction/`.

<Snippet filename="src/components/Reaction/styles.module.css" source="src/components/Reaction/styles.module.css" defaultOpen={false} />

Le `container` extérieur est une ligne flex avec retour à la ligne, il se replie donc proprement sur les écrans étroits. Les couleurs utilisent les propriétés CSS personnalisées de Docusaurus (`--ifm-*`), ce qui signifie que le widget s'adapte automatiquement au mode clair, au mode sombre et à n'importe quel thème Docusaurus personnalisé sans écrire une seule media query ni une règle dupliquée.

Le bouton « Helpful » prend la couleur primaire du thème au survol ; le bouton « Not really » prend un gris neutre. La transition de 0,15 s rend le survol réactif sans être tape-à-l'œil.

---

## Étape 4 — Injecter le widget via le swizzling {#step-4--injecting-the-widget-via-swizzling}

Le **swizzling** est le mécanisme de Docusaurus pour remplacer un composant de thème intégré par votre propre version. Nous voulons injecter `<Reaction />` en bas de chaque page d'article de blog — et le bon endroit pour cela est `BlogPostItem`, le composant qui englobe le contenu et le pied de page de chaque article.

### 4.1 — Lancer la commande de swizzle {#41--run-the-swizzle-command}

```bash
yarn run swizzle @docusaurus/theme-classic BlogPostItem --wrap
```

<AlertBox variant="tip" title="Wrap ou Eject">
Le flag `--wrap` crée un fin wrapper autour du composant d'origine plutôt que de copier tout le source. Cependant, pour `BlogPostItem`, nous voulons un contrôle fin sur la mise en page (pour placer `<Reaction />` exactement où nous le souhaitons, entre le contenu et le pied de page). En pratique, vous allez probablement ejecter, pas wrapper. Lancez la commande sans `--wrap` et Docusaurus vous demandera de confirmer ; choisissez **Eject**.
</AlertBox>

Cela crée `src/theme/BlogPostItem/index.js` avec le source d'origine. Ouvrez-le.

### 4.2 — Modifier le fichier swizzlé {#42--modify-the-swizzled-file}

Vous devez faire trois changements : importer le composant, détecter si nous sommes sur une page d'article unique, et afficher `<Reaction />` conditionnellement.

Voici la partie concernée :

```javascript title="src/theme/BlogPostItem/index.js" {1,8,17-23}
import Reaction from "@site/src/components/Reaction";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemContainer from "@theme/BlogPostItem/Container";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostItemFooter from "@theme/BlogPostItem/Footer";
import BlogPostItemHeader from "@theme/BlogPostItem/Header";

function useContainerClassName() {
  const { isBlogPostPage } = useBlogPost();
  return !isBlogPostPage ? "margin-bottom--xl" : undefined;
}

export default function BlogPostItem({ children, className }) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const containerClassName = useContainerClassName();

  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />

      {isBlogPostPage && (
        <Reaction metadata={metadata} />
      )}
    </BlogPostItemContainer>
  );
}
```

La garde clé est `isBlogPostPage`. Docusaurus affiche `BlogPostItem` dans deux contextes :

1. **Les pages de liste du blog** — où les cartes d'articles sont affichées en grille ou en flux.
2. **Les pages d'article unique** — où l'article complet est affiché.

Sans cette garde, un widget de réaction apparaîtrait sous chaque carte d'article sur la page d'accueil du blog, ce qui n'est pas ce que nous voulons. `isBlogPostPage` vaut `true` uniquement quand vous lisez un article seul, le widget apparaît donc exactement au bon endroit.

<AlertBox variant="note" title="Le placement compte">
Si vous avez d'autres composants personnalisés (un bouton de partage Bluesky, des <Link to="/blog/docusaurus-relatedposts">articles liés</Link>, etc.), l'ordre ici définit l'ordre visuel en bas de chaque article. Ajustez selon vos préférences.
</AlertBox>

### 4.3 — Le fichier swizzlé complet SUR MON SITE {#43--the-complete-swizzled-file-on-my-site}

<AlertBox variant="important" title="">
Ci-dessous se trouve le contenu du fichier index.js sur mon blog. Je le partage comme exemple et pour comparaison, puisque j'utilise bien plus de composants React que le seul que nous venons de voir dans cet article.
</AlertBox>

<Snippet filename="src/theme/BlogPostItem/index.js" source="src/theme/BlogPostItem/index.js" defaultOpen={false} />

---

## Étape 5 — Le tableau de bord d'administration {#step-5--the-admin-dashboard}

Le tableau de bord est une page Docusaurus classique (pas un article de blog) qui appelle l'endpoint d'administration de `reactions.php` et présente les données dans un tableau avec des barres d'approbation par article.

Créez `src/pages/reactions-dashboard.js` avec ce contenu :

<Snippet filename="src/pages/reactions-dashboard.js" source="src/pages/reactions-dashboard.js" defaultOpen={false} />

### 5.1 — Authentification {#51--authentication}

La page lit le token d'administration depuis le hash de l'URL (`/reactions-dashboard#your-token`). S'il n'y a pas de hash, elle affiche un formulaire pour saisir le token manuellement. Le token n'est jamais envoyé dans le path de l'URL ni stocké dans `localStorage`.

```javascript title="src/pages/reactions-dashboard.js"
const [token, setToken] = useState(() => {
  if (typeof window === "undefined") return "";
  return window.location.hash.slice(1);
});
```

Passer le token dans le hash est un choix pratique : le hash n'est jamais envoyé au serveur dans la requête HTTP, il n'apparaît donc pas dans les logs du serveur, et vous pouvez mettre l'URL en favori.

Saisissez votre `ADMIN_TOKEN` pour vous connecter :

<BrowserWindow url="https://www.avonture.be/reactions-dashboard/">
  <img
    alt="The reaction dashboard login page"
    src={require("./images/add_token.webp").default}
  />
</BrowserWindow>

### 5.2 — Le chargement des données {#52--data-loading}

```javascript title="src/pages/reactions-dashboard.js"
const fetchData = useCallback(async (t) => {
  if (!t) return;
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(`${apiUrl}?admin=${encodeURIComponent(t)}`);
    if (res.status === 403) { setError("Invalid token."); setData(null); return; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setData(await res.json());
  } catch (e) {
    setError(`Failed to load data: ${e.message}`);
    setData(null);
  } finally {
    setLoading(false);
  }
}, [apiUrl]);
```

Un `403` signifie que le token est incorrect et donne un message clair « Invalid token. ». Tout autre statut non-OK est traité comme une erreur générique. Le bloc `finally` remet toujours l'état de chargement à zéro.

### 5.3 — Agrégation {#53--aggregation}

```javascript title="src/pages/reactions-dashboard.js"
function computeTotals(data) {
  let totalHelpful = 0;
  let totalNot = 0;

  const rows = Object.entries(data)
    .map(([slug, counts]) => {
      const helpful    = counts.helpful    ?? 0;
      const notHelpful = counts.not_helpful ?? 0;
      const total      = helpful + notHelpful;
      const ratio      = total > 0 ? Math.round((helpful / total) * 100) : 0;
      totalHelpful += helpful;
      totalNot     += notHelpful;
      return { slug, helpful, notHelpful, total, ratio };
    })
    .sort((a, b) => b.helpful - a.helpful || b.total - a.total);

  const grandTotal = totalHelpful + totalNot;
  const approval   = grandTotal > 0 ? Math.round((totalHelpful / grandTotal) * 100) : 0;

  return { rows, totalHelpful, totalNot, grandTotal, approval };
}
```

`computeTotals` parcourt chaque article de `reactions-data.json`, calcule un taux d'approbation par article et trie par nombre de votes « helpful » décroissant (les égalités étant départagées par le total des votes). Les totaux généraux à la fin alimentent les cartes de synthèse en haut de la page.

Et voici ce que vous pouvez obtenir :

<BrowserWindow url="https://www.avonture.be/reactions-dashboard/">
  <img
    alt="The reaction dashboard"
    src={require("./images/reaction_dashboard.webp").default}
  />
</BrowserWindow>

---

## Tous les fichiers en un coup d'œil {#all-files-at-a-glance}

Voici l'ensemble complet des fichiers concernés, regroupés pour une installation facile (affichés avec mon <Link to="/blog/docusaurus-snippets">code snippets component</Link>).

<AlertBox variant="note" title="... sauf src/theme/BlogPostItem/index.js">
Dans la liste ci-dessous, je n'ai pas inclus `src/theme/BlogPostItem/index.js` parce que, comme dit, ce fichier sera différent entre mon blog et le vôtre. Reportez-vous à l'**Étape 4** et créez le fichier manuellement.
</AlertBox>

<ProjectSetup folderName="Reaction widget">
  <Snippet filename="api/.env" source="api/.env.example" defaultOpen={false} />
  <Snippet filename="api/reactions.php" source="api/reactions.php" defaultOpen={false} />
  <Snippet filename="src/components/Reaction/index.tsx" source="src/components/Reaction/index.tsx" defaultOpen={false} />
  <Snippet filename="src/components/Reaction/styles.module.css" source="src/components/Reaction/styles.module.css" defaultOpen={false} />
  <Snippet filename="src/pages/reactions-dashboard.js" source="src/pages/reactions-dashboard.js" defaultOpen={false} />
</ProjectSetup>

---

## Considérations de sécurité {#security-considerations}

Quelques points à garder en tête avant de déployer :

**Changez le `ADMIN_TOKEN`.**  L'exemple du repository utilise une valeur d'exemple. Générez la vôtre avec `openssl rand -base64 32` et mettez à jour la constante avant de déployer. Quiconque possède ce token peut lire tous les votes jamais enregistrés.

**`reactions-data.json` et `notifications.json` ne doivent pas être accessibles publiquement.**  Si votre serveur web sert directement le dossier `api/`, assurez-vous que ces fichiers JSON ne soient pas téléchargeables en y naviguant simplement. Ajoutez une règle `.htaccess` pour bloquer l'accès direct aux fichiers `*.json` dans ce répertoire :

```apacheconf title="api/.htaccess"
<FilesMatch "\.json$">
    Require all denied
</FilesMatch>
```

**Le script PHP n'authentifie pas les votants.**  N'importe qui peut envoyer plusieurs votes pour le même article depuis différents clients. `localStorage` empêche seulement le double vote depuis le même navigateur, pas depuis des scripts ou d'autres appareils. Pour un blog personnel, c'est un compromis acceptable — vous obtenez un signal, pas des données de sondage précises.

**Permissions des fichiers.**  Assurez-vous que `api/reactions-data.json` et `api/notifications.json` soient accessibles en écriture par l'utilisateur du serveur web. Le script les crée à la première utilisation, donc le répertoire `api/` lui-même doit être accessible en écriture. Sous Linux : `chmod 775 api/` et vérifiez que l'utilisateur du serveur web est propriétaire de ce dossier ou fait partie de son groupe.

---

## Le tester {#testing-it}

Une fois les fichiers en place :

1. **Démarrez le serveur de développement Docusaurus** : `yarn start`
2. Ouvrez n'importe quel article de blog. Vous devriez voir le widget « Was this article helpful? » en bas.
3. Cliquez sur l'un des boutons. Le widget devrait passer à l'état de remerciement.
4. Rechargez la page. Le widget devrait toujours afficher l'état de remerciement (chargé depuis `localStorage`).
5. Ouvrez un autre navigateur (ou une fenêtre de navigation privée) et rechargez le même article. Les compteurs de votes de l'étape 3 devraient être visibles après avoir voté.
6. Rendez-vous sur `/reactions-dashboard` et saisissez votre token d'administration. L'article pour lequel vous venez de voter devrait apparaître dans le tableau.

<AlertBox variant="info" title="L'URL du tableau de bord">
Vous pouvez mettre `/reactions-dashboard#your-token` en favori pour ouvrir le tableau de bord directement. Le token dans le fragment de hash n'est jamais envoyé au serveur dans la requête HTTP, il n'apparaît donc pas dans les logs d'accès du serveur.
</AlertBox>

---

## Conclusion {#conclusion}

L'ensemble du système représente environ 250 lignes de code réparties sur cinq fichiers, n'a aucune dépendance externe au-delà de ce que Docusaurus fournit déjà, et ne demande rien côté infrastructure hormis un serveur capable d'exécuter PHP.

Ce que je préfère dans cette approche, c'est que chaque octet de données vit dans vos propres fichiers, sous votre propre contrôle. Les votes sont stockés dans un simple fichier JSON que vous pouvez ouvrir avec n'importe quel éditeur de texte, sauvegarder avec n'importe quel outil et migrer vers n'importe quel autre système quand vous le voulez. Pas d'abonnement SaaS à résilier, pas de clé d'API à renouveler, pas de politique de confidentialité à mettre à jour parce que le SDK de quelqu'un d'autre a ajouté un tracker.

Si vous partez de là pour ajouter des fonctionnalités — réactions par section, questions des lecteurs, <Link to="/blog/docusaurus-old-notice">marqueurs d'obsolescence</Link> — le même schéma passe naturellement à l'échelle : un fichier PHP par fonctionnalité, un composant React, un stockage JSON.
