# Reader review : docker-joomla-part-2

**Détecté :** 2026-08-09
**Article :** blog/2024/10/18/docker-joomla-part-2/index.mdx
**Verdict :** RESTRUCTURE

## Problème

Time to value : **24 %** (première sortie console réelle — `make up`, l. 194 — sur un corps de
575 lignes, entre les lignes 54 et 629). Le vrai bénéfice annoncé par la TLDR (« déployer un site
entièrement configuré, sans repasser par l'assistant d'installation ») ne se voit lui qu'à la
ligne 322 (capture de l'installeur Joomla court-circuité), soit 47 % du corps.

Drapeaux : install-avant-preuve — l'article ouvre littéralement sur `## Prerequisites` (l. 56,
juste après le `<!-- truncate -->`) — et abstraction-avant-preuve (les `<Snippet>` de
`compose.yaml`, `.env` et `makefile`, l. 88-159, précèdent toute sortie).

Redondance : aucune mesurée, l'article couvre des sujets distincts (lancement, pause,
configuration avancée, projets multiples).

Test des 30 secondes : « j'abandonne » — le titre de la section d'ouverture est littéralement
« Prerequisites », et le texte demande de créer trois fichiers de configuration « pour qu'on
puisse entrer directement dans le vif du sujet » — sans jamais montrer ce vif du sujet avant.

## Risque

Article de 629 lignes, le plus long du lot : le setup (compose.yaml/.env/makefile, l. 56-159)
est nécessaire mais spectaculairement plus visible que le résultat qu'il permet. De plus,
l'article se termine (l. 625-629) par un simple lien vers l'article suivant, sans section
`## Conclusion` — pas de recap, la ligne d'atterrissage (mouvement 7) manque complètement.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : site Joomla démarré, déjà configuré, assistant d'installation court-circuité (capture) | l. 322 (image) + l. 194-200 (sortie `make up`) |
| 2 | Pourquoi ça marche (compose.yaml + .env + makefile = un point de configuration unique, réutilisable) | l. 39-52, reformulé sans code |
| 3 | Créer les trois fichiers (compose.yaml, .env, makefile) | l. 56-159 |
| 4 | Lancer le site (`make config`, `make up`, `make start`) | l. 162-322 |
| 5 | Pause — récap rapide (`StepsCard`) | l. 328-341 |
| 6 | Configuration avancée (autres versions, projets multiples en parallèle) | l. 343-625 |
| 7 | Sous le capot : logs, arrêt/reset (optionnel, à marquer comme tel) | l. 239-285 |
| 8 | Conclusion (à écrire — actuellement absente) + lien vers la restauration JPA | l. 625-629 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
