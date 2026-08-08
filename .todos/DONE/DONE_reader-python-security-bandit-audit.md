# Reader review : python-security-bandit-audit

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/python-security-bandit-audit/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la démo (app.py + Terminal du scan) déplacée en position 2, avant les quatre `<Snippet>` d'implémentation.

## Problème

Time to value : **60 %** (preuve — le `<Terminal>` montrant le scan Bandit/pip-audit — ligne 61
sur un corps de 60 lignes après `<!-- truncate -->`).
Drapeaux : **abstraction-avant-preuve** — quatre `<Snippet>` d'implémentation (`Dockerfile`,
`scan.sh`, `compose.yaml`, le wrapper `py-security-scan`, l. 36-50) s'affichent tous avant la
seule preuve de l'article.
Redondance : « deux outils, deux questions différentes » énoncé 3 fois (TLDR, l. 27-32, Key
Takeaways) — sous le seuil, pas le problème principal.

Test des 30 secondes : « je survole le Dockerfile sans savoir pourquoi je le lis, rien ne m'a
encore montré ce que l'outil trouve » — le lecteur atteint la section Docker Image avant toute
preuve que Bandit/pip-audit trouvent quoi que ce soit d'utile.

## Risque

La preuve la plus forte de l'article — le scan réel sur `app.py` (mot de passe en dur détecté,
`subprocess shell=True` détecté, deux dépendances obsolètes détectées) — existe déjà et est
courte (l. 54-67), mais elle arrive après trois `<Snippet>` d'implémentation complets. Un
lecteur qui n'a pas encore vu ce que l'outil détecte n'a aucune raison de lire un Dockerfile.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | l. 15-23 |
| 2 | Démo — `app.py`/`requirements.txt` (collapsed) + `<Terminal>` du scan | l. 54-67 |
| 3 | Two Tools, Two Different Questions (pourquoi ça marche, sans code) | l. 27-32 |
| 4 | The Docker Image (installation) | l. 34-46 |
| 5 | The Global Wrapper | l. 48-52 |
| 6 | Key Takeaways | l. 69-81 |
| 7 | Conclusion | l. 83-85 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
