# 0093 — Soft-404 : toute URL inconnue renvoie 200

- **Priority**: Medium
- **Batch**: deploy-pipeline
- **Depends**: —
- **Files**: `static/.htaccess`

## Problème

`static/.htaccess` se termine par la règle de repli SPA :

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

Conséquence : **aucune URL de ce site ne renvoie jamais 404**. Une adresse inexistante reçoit un
HTTP 200 accompagné de la page d'accueil, dans laquelle le routeur React affiche ensuite quelque
chose — constaté le 2026-08-18 en testant `/admin-data/drafts.json` supprimé : le serveur a
renvoyé 200 et la page de recherche.

Trois dégâts distincts.

**SEO.** Google appelle ça un _soft 404_ et le traite comme une erreur de qualité : il continue de
crawler des URLs mortes, et peut indexer des pages de contenu identique (la home servie sous
mille adresses différentes). C'est un signal négatif documenté.

**Diagnostic.** Aucun outil de surveillance de liens morts ne peut fonctionner : lychee, Search
Console ou un simple `curl` verront 200 partout. Cela rend aussi le smoke test du workflow moins
utile qu'il n'y paraît — il vérifie des codes 200 sur un serveur qui répond 200 à tout.

**Interaction avec l'absence de `--delete` sur `blog/`.** Le déploiement ne supprime jamais la page
d'un article retiré. Combiné au repli SPA, un article dépublié reste donc joignable **et** son URL
répond 200 même après suppression manuelle. Rien ne disparaît vraiment de ce site.

Enfin, la règle est en partie inutile : Docusaurus pré-rend **toutes** ses routes en fichiers
statiques. Le repli SPA n'a rien à rattraper — chaque page légitime existe déjà sur disque, ce que
la condition `!-f` vérifie juste avant.

## Solution

Remplacer le repli par une vraie page d'erreur. Docusaurus génère déjà `build/404.html`.

```apache
# Plus de RewriteRule . /index.html [L]
ErrorDocument 404 /404.html
```

Le serveur renvoie alors un vrai code 404 avec la page 404 du thème, correctement stylée.

### Points de vigilance

- **Vérifier qu'aucune route n'est réellement dynamique côté client.** Les routes de tags et de
  séries sont générées par nos plugins ; si elles produisent bien des fichiers dans `build/`
  (`find build -path '*tags*' -name index.html`), le repli ne leur sert pas. À confirmer avant de
  supprimer la règle — c'est le seul scénario où le repli était utile.
- **Les redirections permanentes existantes** (`RedirectPermanent` en haut du fichier) doivent
  continuer de fonctionner : elles sont évaluées avant, mais à retester.
- **Tester après déploiement** : `curl -o /dev/null -w '%{http_code}' https://<site>/nimportequoi`
  doit renvoyer 404, et `https://<site>/blog/<un-vrai-article>` toujours 200.

Une fois la règle en place, envisager d'ajouter ces deux assertions au smoke test du workflow —
c'est peu coûteux et ça verrouille le comportement.

## Risque

Moyen, et concentré sur un point : si une route légitime n'existait **pas** sous forme de fichier,
elle se mettrait à renvoyer 404 en production. D'où la vérification préalable ci-dessus, qui est
mécanique et rapide.

Le rollback est immédiat : remettre la `RewriteRule` et redéployer.

## Acceptance

- Une URL inexistante renvoie HTTP 404 et affiche la page 404 du thème.
- Toutes les pages du sitemap renvoient 200 (à vérifier en boucle sur `build/sitemap.xml`).
- Les pages de tags et de séries renvoient 200.
- Les `RedirectPermanent` existants fonctionnent toujours.
