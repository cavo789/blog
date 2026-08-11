# Reader review : laravel_events

**Détecté :** 2026-08-11
**Article :** blog/2023/11/23/laravel_events/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **78 %** (preuve ligne 91 sur un corps de 79 lignes, `<!-- truncate -->` l. 29).
Drapeaux : **abstraction-avant-preuve** — cinq `<Snippet>` de code source
(`EventServiceProvider.php` l. 50, `web.php` l. 54, `Employee.php` l. 71, `SampleEvent.php` l. 79,
`SampleListener.php` l. 85) sont livrés avant la moindre sortie.
Redondance : « les événements permettent d'ajouter des fonctionnalités futures sans toucher au
code existant » énoncé **5 fois** (TLDR l. 20, l. 25-27, l. 31, l. 33, AlertBox l. 36) — dont
quatre dans les dix premières lignes du corps.

Section morte : `## PHP example (not Laravel)` (l. 99-101) ne contient plus aucun exemple depuis
que le dépôt `cavo789/event_thephpleague_learning` a été retiré (voir `updates:` du 2026-07-30).
Il reste un paragraphe qui annonce un exemple absent.

Pas de `## Conclusion` : l'article se termine sur une `AlertBox` signalant qu'il s'agit d'une
reprise d'un billet dev.to.

Test des 30 secondes : **j'abandonne** — on me demande de lire cinq fichiers PHP avant de me
montrer une seule ligne de sortie, alors que la démonstration entière tient dans deux blocs
`curl localhost` de quatre lignes.

## Risque

Le lecteur d'une minute ne verra jamais le cœur de l'article : la paire avant/après
`terminal-2.txt` (`Georges Washington`, le listener a modifié l'employé) et `terminal-1.txt`
(`John Doe`, listener commenté, le code fonctionne quand même). C'est **exactement** la preuve
que le titre promet — les événements découplent — et elle est à 78 % de la page.

Tout le matériau existe déjà, il est simplement rangé dans l'ordre où l'auteur l'a écrit
(les fichiers d'abord, le résultat à la fin) et non dans l'ordre où le lecteur en a besoin.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | Les événements du CMS Joomla, la promesse en une phrase. Couper la redondance : garder l. 23-27, supprimer l. 31 et l. 33 (mêmes faits reformulés) | l. 23-27 |
| 2. La preuve | Nouvelle section `## What an event actually buys you`. Les deux `<Terminal>` en paire avant/après, avec une phrase entre les deux : « même route, même code appelant ; seul le listener a été commenté ». | `<Terminal>` l. 91 et l. 97 + la phrase l. 89 et l. 93 |
| 3. Pourquoi ça marche | Les 3 idées, sans code : l'événement transporte un objet, le listener le modifie, le code appelant ne connaît pas le listener. Reprendre l'AlertBox « In fact, you never know » ici — c'est le seul passage philosophique qui apporte un fait neuf. | AlertBox l. 35-38 + liste l. 56-61 |
| 4. Le code, dans l'ordre du flux | `## Building it` — `routes/web.php` (le point d'entrée) puis `Employee.php`, `SampleEvent.php`, `SampleListener.php`, et `EventServiceProvider.php` en dernier (c'est le câblage, pas la logique). Tous en `defaultOpen={false}` sauf le listener. | l. 48-85, réordonnées |
| 5. Sous le capot (facultatif) | `## Under the Hood (skip this if you just want to use it)` — pourquoi les setters sont publics, pourquoi le pseudo n'est pas modifié. | l. 77, l. 83 |
| 6. Atterrissage | `## Conclusion` : rappel du gain (ajouter une fonctionnalité sans toucher au code existant), lien vers <Link to="/blog/laravel-telescope">Laravel Telescope</Link> pour rendre les événements visibles. Conserver l'AlertBox dev.to en fin de section. | l. 103, l. 105-108 |

À décider séparément (hors périmètre reader review) : soit réécrire `## PHP example (not Laravel)`
avec un vrai extrait `League\Event`, soit supprimer la section — en l'état elle promet un exemple
qui n'existe plus.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
