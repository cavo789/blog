# Reader review : pest_tips

**Détecté :** 2026-08-09
**Article :** blog/2024/09/27/pest_tips/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **21 %** (preuve ligne 88 — sortie `PASS` d'un vrai test Pest — sur un corps de
223 lignes, entre les lignes 42 et 265).

Drapeaux : install-avant-preuve — la première section après le `<!-- truncate -->` est
littéralement `## Installation` (l. 44), avec trois commandes `composer require` / `php artisan
pest:install` avant la moindre preuve que Pest fonctionne.

Redondance : aucune mesurée, sujet vaste mais chaque section apporte une info nouvelle.

Test des 30 secondes : proche de la limite — la TLDR est claire, mais le corps ouvre sur de
l'installation Composer avant de montrer un seul test qui passe. Un lecteur qui connaît déjà
PHPUnit et se demande « pourquoi changer » ne voit aucun exemple de syntaxe avant d'installer.

## Risque

La sortie `PASS Tests\Feature\MyFirstTest` (l. 88) est la preuve la plus convaincante de
l'article — la syntaxe expressive de Pest face à PHPUnit — et elle est reléguée après
l'installation. L'article se termine aussi par une section `## Links` (l. 259) sans
`## Conclusion` : pas de recap, la ligne d'atterrissage manque.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : un test Pest minimal + sa sortie `PASS` | l. 54-88, condensé (juste `Pest.php` + `MyFirstTest.php` + la sortie) |
| 2 | Pourquoi Pest (syntaxe expressive vs PHPUnit) | reformulé à partir des exemples de tests, sans code |
| 3 | Installation (`composer require`, `php artisan pest:install`) | l. 44-52 |
| 4 | Écriture des tests (suite des cas d'usage) | l. 90-178 |
| 5 | Fonctions globales et bootstrap | l. 180-196 |
| 6 | Astuces (optionnel, à marquer comme tel) | l. 198-204 |
| 7 | Convertir depuis PHPUnit (optionnel) | l. 206-222 |
| 8 | Outils | l. 224-258 |
| 9 | Conclusion (à écrire — actuellement absente) + Links | l. 259-265 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
