---
slug: hurl
title: "Hurl — Enchaînez vos appels HTTP dans une recette lisible par tous"
authors: [christophe, claude]
image: /img/v2/hurl.webp
series: Building and testing REST APIs
mainTag: api
tags: [api, tests, linux, windows]
ai_assisted: true
date: 2026-11-19
description: "Hurl remplace la danse curl + jq + export par un seul fichier texte .hurl qui se connecte, garde le token, appelle l'API protégée et vérifie chaque réponse avec des assertions. Lisible par un non-développeur, exécutable comme suite de tests par le développeur de l'API, et livrable à un client qui veut simplement ses données dans une base chaque nuit."
language: fr
---

![Hurl — Enchaînez vos appels HTTP dans une recette lisible par tous](/img/v2/hurl.webp)

<!-- cspell:ignore hurl hurlfmt emilys emilyspass dummyjson httpbin jsonpath xpath Melville crontab -->

<TLDR>
Hurl est un outil en ligne de commande gratuit et open source qui lit un fichier texte `.hurl`, envoie les requêtes HTTP qu'il décrit de haut en bas, et confronte chaque réponse aux assertions écrites en dessous. Un token capturé dans la première réponse alimente la deuxième requête : « se connecter, puis appeler l'API protégée » tient dans un seul fichier au lieu de deux appels `curl` recollés avec `jq`. Le même fichier est une recette lisible pour un non-développeur, une suite de tests pour le développeur de l'API, et un export de données nocturne pour le client.
</TLDR>

Appeler une API protégée avec `curl` se passe toujours de la même façon : un premier `curl` pour obtenir un token, `jq` pour l'extraire du JSON, une variable shell pour le garder, un second `curl` avec `-H "Authorization: Bearer $TOKEN"`, et ensuite… je regarde la réponse de mes propres yeux et je décide qu'elle est correcte. Et quand un collègue, ou un client, demande *« comment j'appelle cette API ? »*, je lui envoie un script shell qu'il ne sait pas lire.

Hurl transforme tout ça en un petit fichier texte lisible par n'importe qui, qui enchaîne les appels tout seul et **vérifie** chaque réponse avant de continuer.

<!-- truncate -->

## Ce que Hurl fait pour vous {#what-hurl-does-for-you}

Voici la version `curl` d'une connexion sur [DummyJSON](https://dummyjson.com) — une fausse API REST gratuite — suivie de la question *« qui suis-je ? »* avec le token reçu :

<Snippet filename="login-curl.sh" source="./files/login-curl.sh" defaultOpen={true} />

<Terminal source="./files/terminal_curl.txt" />

Et voici la même conversation en deux étapes, écrite pour Hurl :

<Snippet filename="login.hurl" source="./files/login.hurl" defaultOpen={true} />

Pas de `jq`, pas de variable shell, pas de casse-tête de quotes autour du corps JSON : le token capturé à l'étape 1 s'écrit simplement `{{token}}` à l'étape 2. Et les deux lignes sous `[Asserts]` vérifient la réponse — le script `curl`, lui, vous laisse ce travail. Lancez-le :

<Terminal source="./files/terminal_login_ok.txt" />

Maintenant avec un mauvais mot de passe :

<Terminal source="./files/terminal_login_ko.txt" />

Hurl pointe la ligne exacte qui a échoué, dit ce qu'il a obtenu à la place, n'envoie jamais la deuxième requête, et se termine avec un code non nul — tout ce qu'un script, une tâche cron ou un pipeline CI a besoin de savoir.

## Pourquoi ça marche {#why-it-works}

- **Un seul fichier contient toute la recette.** Chaque étape de la conversation se trouve dans le même fichier, dans l'ordre où elle se produit. Ce que `[Captures]` retient d'une réponse — un token, un id, un cookie — devient une variable pour toutes les requêtes en dessous.
- **Un non-développeur sait le lire.** Une adresse, quelques lignes `Name: value`, la réponse attendue. Pas de pipes, pas de quotes échappées, pas de `$(...)`. Quelqu'un qui n'a jamais ouvert un terminal comprend quand même ce que fait le fichier, et repère l'URL qui a changé.
- **Les vérifications voyagent avec les requêtes.** Le statut attendu et la checklist `[Asserts]` vivent juste sous la requête qu'ils vérifient : le fichier documente l'API *et* son contrat.
- **Aucun secret dans le fichier.** Uniquement des champs comme `{{password}}`, remplis à l'exécution ; les valeurs passées avec `--secret` sont masquées dans tous les logs affichés par Hurl.
- **C'est curl en dessous.** Hurl est construit sur libcurl : proxies, certificats et HTTP/2 se comportent exactement comme le `curl` auquel vous faites déjà confiance.
- **Un binaire, trois systèmes.** Windows, Linux et macOS, gratuit et open source (Apache 2.0), maintenu par Orange.

## Installer Hurl {#installing-hurl}

Hurl est packagé pour tous les systèmes ; prenez la première ligne qui correspond au vôtre.

<Terminal>
$ brew install hurl            # macOS, Linux and WSL (Homebrew)
$ winget install Orange-OpenSource.Hurl   # Windows
</Terminal>

<Details label="Debian / Ubuntu : le .deb officiel (Hurl n'est pas dans l'archive Ubuntu)">

Ubuntu ne package pas Hurl, mais chaque release GitHub fournit un `.deb`, sa somme de contrôle et une attestation de provenance de build signée :

<Terminal source="./files/terminal_install_deb.txt" />

La somme de contrôle prouve seulement que le téléchargement n'a pas été tronqué ; c'est la ligne `gh attestation verify` qui prouve que le fichier a bien été produit par le workflow GitHub de Hurl.

</Details>

<Details label="Rien à installer : l'image Docker">

<Terminal wrap={true}>
$ docker run --rm ghcr.io/orange-opensource/hurl:8.1.0 --version
</Terminal>

Ensuite, dans chaque commande de cet article, remplacez `hurl` par `docker run --rm -v "$PWD":/work -w /work ghcr.io/orange-opensource/hurl:8.1.0`. Pour passer les variables `HURL_VARIABLE_...` et `HURL_SECRET_...` du chapitre sur la suite de tests, ajoutez `-e HURL_VARIABLE_username -e HURL_SECRET_password` juste après `--rm` : un container n'hérite pas de l'environnement de votre shell.

</Details>

Vérifiez que c'est bien dans votre `PATH` :

<Terminal>
$ hurl --version
hurl 8.1.0 (x86_64-alpine-linux-musl) libcurl/8.23.0 OpenSSL/3.5.9 zlib/1.3.2 brotli/brotli/1.2.1 zstd/zstd/1.5.7 c-ares/1.34.9 libidn2/2.3.8 nghttp2/1.70.0
</Terminal>

## Anatomie d'un fichier `.hurl` {#anatomy-of-a-hurl-file}

Un fichier `.hurl` est une liste d'**entrées**, exécutées de haut en bas. Chaque entrée est une requête suivie, en option, de la réponse qu'elle attend :

| Partie | Exemple | Signification |
| --- | --- | --- |
| Méthode et URL | `POST https://dummyjson.com/auth/login` | la seule ligne obligatoire |
| En-têtes | `Authorization: Bearer {{token}}` | un `Name: value` par ligne, juste en dessous |
| Sections | `[Query]`, `[Form]`, `[BasicAuth]`, `[Options]` | query string, champs de formulaire, identifiants, options par requête |
| Corps | un objet JSON, un document XML ou du texte brut | envoyé tel quel, après les en-têtes |
| Statut | `HTTP 200` | la réponse **doit** avoir ce code, sinon Hurl s'arrête |
| `[Captures]` | `token: jsonpath "$.accessToken"` | garder une valeur de la réponse pour plus tard |
| `[Asserts]` | `jsonpath "$.username" == "emilys"` | la checklist sur la réponse |

Les lignes commençant par `#` sont des commentaires, pour les humains uniquement.

### Les champs `{{ }}` à remplir {#the---blanks}

Un nom entre doubles accolades est rempli juste avant le départ de la requête :

| Champ | Rempli avec |
| --- | --- |
| `{{username}}` | une variable donnée en ligne de commande, dans un fichier ou dans l'environnement |
| `{{token}}` | une valeur capturée par une entrée précédente |
| `{{newUuid}}` | un nouvel UUID aléatoire, généré à chaque exécution — pratique pour un identifiant de trace |
| `{{newDate}}` | la date et l'heure courantes, ISO 8601 |

Comme le fichier ne contient que des champs vides, il peut être commité et partagé : personne ne peut s'en servir sans les valeurs.

## Remplir les champs sans divulguer de secrets {#filling-the-blanks-without-leaking-secrets}

Quatre façons de donner ses valeurs à Hurl, de la plus explicite à la plus automatique :

| Option | Exemple | Remarque |
| --- | --- | --- |
| `--variable` | `--variable username=emilys` | affiché tel quel dans les logs verbeux |
| `--secret` | `--secret password=emilyspass` | remplacé par `***` partout où Hurl affiche quelque chose |
| `--variables-file` | `--variables-file vars.env` | un `name=value` par ligne |
| Environnement | `HURL_VARIABLE_username=emilys`, `HURL_SECRET_password=...` | parfait pour la CI, où les secrets vivent déjà dans l'environnement |

Le schéma habituel garde les identifiants dans un fichier `.env` — <Link to="/blog/bash-load-env">chargé par le shell</Link> — qui n'est jamais commité, et la recette dans le fichier `.hurl` qui, lui, l'est. L'occasion d'essayer sur votre machine : les deux fichiers ci-dessous sont la recette `login.hurl` du début de cet article et son `.env`.

<ProjectSetup folderName="hurl-demo">
  <Guideline>
    Maintenant, lancez la commande ci-dessous depuis le dossier hurl-demo.
  </Guideline>
<Snippet filename="login.hurl" source="./files/login.hurl" defaultOpen={false} />
<Snippet filename=".env" source="./files/.env" defaultOpen={true} />
</ProjectSetup>

<Terminal wrap={true} source="./files/terminal_source_env.txt" />

Le masquage de `--secret` ne se limite pas à la ligne de commande. Avec `--very-verbose`, Hurl affiche la requête qu'il envoie — sous forme de commande `curl` équivalente — **et** la réponse qu'il reçoit, et le mot de passe est caché dans les deux, y compris dans le profil utilisateur renvoyé par DummyJSON :

```plaintext
* curl --header 'Content-Type: application/json' --data $'{\n  "username": "emilys",\n  "password": "***"\n}' 'https://dummyjson.com/auth/login'
...
* {"id":1,"firstName":"Emily","lastName":"Johnson",...,"username":"emilys","password":"***",...}
```

Un log verbeux peut donc être collé dans un ticket sans arrière-pensée.

## Assertions : la checklist de chaque réponse {#assertions-the-checklist-on-every-answer}

`HTTP 200` dit que le serveur a répondu *« OK »*. Il ne dit rien sur **ce qu'il** a répondu : une liste vide, un champ manquant et un CSV écrit à moitié reviennent tous avec un 200. C'est le travail de `[Asserts]`.

Ce fichier demande à DummyJSON tous ses utilisateurs et vérifie que la liste est complète et bien formée :

<Snippet filename="users.hurl" source="./files/users.hurl" defaultOpen={true} />

Ligne par ligne :

- `header "Content-Type" contains ...` — le serveur annonce qu'il envoie du JSON.
- `jsonpath "$.users" isCollection` puis `count == 208` — `$.users` est une liste, avec exactement 208 entrées.
- `jsonpath "$.users[?!@.firstName]" not exists` — *ne garder que les utilisateurs sans prénom*, et il ne doit y en avoir aucun. Lisez les trois lignes ensemble comme *« chaque utilisateur a un prénom, un nom et un email »*.
- `matches /.../` — une expression régulière sur une valeur.
- `duration < 5000` — la réponse est arrivée en moins de cinq secondes.

Lancez-le — toutes les vérifications passent :

<Terminal source="./files/terminal_users_ok.txt" />

Cassez maintenant une vérification volontairement : à la ligne 11, remplacez `jsonpath "$.total" == 208` par `jsonpath "$.total" == 200`, puis relancez la même commande. Hurl affiche la valeur attendue à côté de la valeur réelle :

<Terminal source="./files/terminal_users_ko.txt" />

Remettez `208` à la ligne 11 avant de continuer : les chapitres suivants réutilisent ce fichier.

<AlertBox variant="tip" title="Un filtre vide n'est pas une liste vide">
Un filtre JSONPath qui ne correspond à rien ne renvoie **aucune valeur** dans Hurl, pas un tableau vide. Donc « personne n'a de prénom manquant » s'écrit `not exists` ; `isEmpty` échouerait avec `actual: none`.
</AlertBox>

### Les prédicats les plus utilisés {#the-predicates-you-will-use-most}

| Prédicat | Exemple |
| --- | --- |
| `==`, `!=`, `>`, `>=`, `<`, `<=` | `jsonpath "$.total" >= 100` |
| `contains`, `startsWith`, `endsWith` | `body startsWith "Name,Code"` |
| `matches` | `jsonpath "$.email" matches /@example\.com$/` |
| `exists`, `isEmpty`, `count` | `jsonpath "$.users" count > 0` |
| `isCollection`, `isString`, `isInteger`, `isBoolean` | `jsonpath "$.users" isCollection` |
| `isIsoDate`, `isUuid` | `jsonpath "$.createdAt" isIsoDate` |

N'importe quel prédicat peut être nié avec `not`, et les queries vont bien au-delà du JSON : `status`, `header`, `cookie`, `body`, `bytes`, `xpath`, `regex`, `sha256`, `duration`, `url`, `redirects`…

## Au-delà du JSON {#beyond-json}

[httpbin.org](https://httpbin.org) est un service gratuit qui renvoie en écho ce qu'il reçoit — parfait pour essayer les autres types de requêtes. Ce seul fichier envoie un formulaire (la forme d'un appel OAuth2 `client_credentials`), utilise l'authentification basique, génère un identifiant de trace, attend un 404 **volontairement**, vérifie une page HTML avec XPath et suit les redirections :

<Snippet filename="features.hurl" source="./files/features.hurl" defaultOpen={false} />

<Terminal source="./files/terminal_features.txt" />

Huit requêtes pour six entrées : suivre les deux redirections de la dernière entrée en coûte deux de plus.

Trois détails méritent l'attention :

- `HTTP 404` est une attente parfaitement valable. Tester qu'une ressource supprimée a bien disparu, ou qu'un mauvais token est bien refusé, est aussi important que tester le cas nominal.
- Une clé JSON contenant un tiret s'écrit avec des crochets : `$.headers['X-Trace-Id']`, pas `$.headers.X-Trace-Id`.
- `[Options]` ne change le comportement que d'une seule requête — ici `location: true` suit les redirections, et `redirects count == 2` vérifie le nombre de sauts effectués.

### Télécharger un fichier, et le vérifier d'abord {#downloading-a-file-and-checking-it-first}

`output:` écrit le corps de la réponse dans un fichier au lieu du terminal — ici une liste CSV de pays issue d'un dataset GitHub public :

<Snippet filename="countries.hurl" source="./files/countries.hurl" defaultOpen={true} />

<Terminal source="./files/terminal_countries.txt" />

`body startsWith` garantit que les titres de colonnes sont là, dans le bon ordre ; `body split "\n" count > 200` s'assure que le fichier n'a pas été coupé au milieu. Et quand une de ces vérifications échoue, Hurl **n'écrit pas le fichier du tout** : une mauvaise réponse n'atterrit jamais sur le disque.

## Côté développeur d'API : les fichiers `.hurl` comme tests {#for-the-api-developer-hurl-files-as-tests}

Vu du côté de celui qui construit l'API, un dossier de fichiers `.hurl` est une suite de tests : chaque fichier est un scénario, chaque ligne `[Asserts]` un test. Donnez plusieurs fichiers à Hurl et `--test` les exécute **en parallèle**, puis affiche un résumé ; deux options supplémentaires produisent un rapport HTML pour les humains et un fichier XML JUnit pour la CI :

<Terminal source="./files/terminal_suite.txt" />

Les deux variables `HURL_...` sont écrites devant la commande : elles n'existent que pour cette exécution. Un `export` garderait `HURL_SECRET_password` dans votre shell, et chaque `--secret password=...` ultérieur s'arrêterait alors avec `secret 'password' can't be reassigned`.

Douze requêtes dans les quatre fichiers créés jusqu'ici, exécutées dans le temps de la plus lente. Le code de sortie indique au pipeline ce qui s'est passé : `0` tout est passé, `2` un fichier `.hurl` n'a pas pu être parsé, `3` une requête n'a pas pu être envoyée du tout (DNS, TLS, timeout…), `4` une assertion a échoué.

Pour exécuter les mêmes scénarios contre votre portable, le serveur de staging et la production, remplacez l'host par un champ à remplir — à la ligne 2 de `users.hurl` :

```plaintext title="users.hurl"
GET {{base_url}}/users
```

L'host se choisit désormais en ligne de commande. Ici c'est toujours DummyJSON ; sur votre propre API, ce serait `http://localhost:8000` sur votre portable et l'adresse de staging dans la CI, avec exactement les mêmes fichiers :

<Terminal source="./files/terminal_base_url.txt" />

Contrairement aux tests unitaires, ceux-ci parlent à l'API réelle, en train de tourner — routage, authentification, sérialisation et base de données compris — exactement comme le fera un client.

## Côté consommateur d'API : une recette que vous pouvez transmettre {#for-the-api-consumer-a-recipe-you-can-hand-over}

Passons de l'autre côté. Votre client veut le catalogue produits dans sa propre base de reporting, rafraîchi chaque nuit. Au lieu d'une page de documentation et d'un « bonne chance », envoyez-lui ce fichier :

<Snippet filename="products.hurl" source="./files/products.hurl" defaultOpen={true} />

Il sait le lire — se connecter, télécharger le catalogue, vérifier qu'il y a plus de cent produits, tous avec un titre et un prix positif, l'enregistrer — et l'exécuter :

<Terminal source="./files/terminal_products.txt" />

`products.json` est maintenant sur le disque, et <Link to="/blog/duckdb-json-csv">DuckDB</Link> le transforme en table avec une seule instruction SQL — pas d'outil d'import, pas de schéma à déclarer. La commande ci-dessous utilise la fonction `duckdb` basée sur Docker de cet article, où `--write` autorise l'écriture de `catalog.duckdb` dans le dossier courant ; avec un DuckDB natif, supprimez `--write` :

<Snippet filename="load.sql" source="./files/load.sql" defaultOpen={true} />

<Terminal source="./files/terminal_duckdb.txt" />

Mettez les deux étapes dans un script, et laissez cron l'exécuter chaque nuit. cron ne charge pas les fonctions de votre shell, donc le script appelle directement l'image `duckdb-cli` construite dans l'article sur DuckDB :

<Snippet filename="refresh-catalog.sh" source="./files/refresh-catalog.sh" defaultOpen={false} />

```plaintext title="crontab -e"
0 2 * * * /home/me/catalog/refresh-catalog.sh >> /home/me/catalog/refresh.log 2>&1
```

C'est là que les assertions se rentabilisent. La nuit où l'API répond 200 avec une liste vide, ou un prix à zéro, Hurl refuse la réponse, n'écrit rien, et `set -e` arrête le script avant DuckDB : la base garde les données de la veille au lieu d'être silencieusement vidée, et `refresh.log` nomme la ligne exacte qui a échoué.

## Vous avez déjà une commande `curl` ? {#already-have-a-curl-command}

Hurl est livré avec `hurlfmt`, qui convertit une ligne de commande `curl` en entrée Hurl — le moyen le plus rapide de faire passer un historique shell dans un fichier :

<Terminal source="./files/terminal_curl_import.txt" />

Ajoutez un `HTTP 200` et deux ou trois assertions en dessous, et la commande ponctuelle devient une vérification réutilisable.

## Hurl, curl et les clients graphiques {#hurl-curl-and-the-gui-clients}

| | `curl` | Hurl |
| --- | --- | --- |
| Lisible par un non-développeur | 😕 | 🙂 |
| Enchaîner plusieurs appels | variables shell + <Link to="/blog/linux-jq">`jq`</Link> | `[Captures]`, dans un seul fichier |
| Vérifier chaque réponse | à l'œil | `HTTP 200` + `[Asserts]` |
| Masquer les secrets dans les logs | ❌ | `--secret` |
| Natif sous Windows | 😕 | ✅ |

Si vous préférez cliquer plutôt que taper, <Link to="/blog/postman">Postman</Link> et <Link to="/blog/bruno">Bruno</Link> couvrent le même terrain avec une interface graphique. Hurl est le choix inverse : aucune interface, un fichier texte qui se diffe proprement dans une pull request et s'exécute à l'identique sur un portable, en CI et dans un crontab.

## Conclusion {#conclusion}

La danse du token du début de cet article — `curl`, `jq`, une variable, `curl` à nouveau, puis plisser les yeux sur la sortie — tient désormais dans un fichier lisible qui se connecte, garde le token, appelle l'API et vérifie la réponse, champ par champ. Le développeur exécute un dossier entier comme suite de tests ; le client en exécute un chaque nuit pour alimenter une base, protégé par ces mêmes assertions. Commencez par la requête que vous tapez le plus souvent : passez-la dans `hurlfmt`, ajoutez une ligne `[Asserts]`, et commitez-la à côté du code qui dépend de cette API.
