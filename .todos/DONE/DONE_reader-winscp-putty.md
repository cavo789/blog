# Reader review : winscp-putty

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/winscp-putty/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la capture d'écran du réglage (déjà existante) et la phrase de résultat déplacées en premier, avant le chemin de menu et le rappel d'installation.

## Problème

Time to value : **100 %** (aucune preuve claire du résultat trouvée dans le corps de 13 lignes ;
seule une capture d'écran du panneau de configuration apparaît en l.30, sans jamais montrer le
résultat concret — une connexion PuTTY sans invite de mot de passe).
Drapeaux : aucun (pas de `<Prerequisite>` ni `## Prerequisites`, donc pas d'install-avant-preuve
au sens strict — mais l'ordre reste « configure d'abord, résultat décrit ensuite »).
Redondance : aucune, l'article est trop court pour en accumuler.

Test des 30 secondes : le lecteur lit "installe PuTTY d'abord" (l.26) avant de voir la capture
d'écran (l.30) qui est la vraie astuce — il doit lire quatre phrases avant de savoir ce que
l'article lui apporte concrètement.

## Risque

Le lecteur presse : il ouvre l'article pour une astuce d'une ligne ("comment éviter de retaper
mon mot de passe PuTTY") et tombe d'abord sur un rappel d'installation avant la capture qui
montre la case à cocher. Rien n'est perdu — la capture existe déjà (l.30) — elle est juste
précédée d'un rappel d'installation qui n'apporte rien à ce stade.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Capture d'écran du réglage à cocher + phrase de résultat ("coche cette case, PuTTY ne redemandera plus ton mot de passe") | l.30, l.32 |
| 2 | Chemin de menu pour atteindre ce réglage (Options > Preferences > Applications > Integrations) | l.28 |
| 3 | Rappel : s'assurer que PuTTY est installé | l.26 |
| 4 | Section Tip (lien vers l'article SSH connexe) | l.34-36 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
