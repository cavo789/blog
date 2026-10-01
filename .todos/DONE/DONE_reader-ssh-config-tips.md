# Reader review : ssh-config-tips

**Détecté :** 2026-09-29
**Article :** blog/2026/10/01/ssh-config-tips/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **8.3 %** (Terminal preuve l. 52 sur un corps de 300 lignes). 🟢
Drapeaux : **abstraction-avant-preuve** 🔴 (binaire).

Le `<Snippet source="./files/ssh_config_optimized.txt" />` (34 lignes de config SSH) apparaît
à la l. 48, soit 4 lignes avant le `<Terminal>` preuve (l. 52). Le lecteur lit la config
entière — 34 lignes de stanzas numérotées — avant de voir si la commande fonctionne. TTV mécanique
excellent (8.3 %), mais l'ordre est inversé : la config est l'implémentation, le Terminal est la preuve.

Drapeaux additionnels (non déclencheurs) :

- **Redondance 🟠** — "first-value-wins" énoncé **4 fois** : TLDR (l. 20), l. 68, l. 82, l. 151.
- **Avertissement quasi-dupliqué** — "a `ProxyJump none` placed after `Host *` [would be/is]
  silently ignored" au mot près en l. 81 (corps) et l. 151 (AlertBox devcontainer).
- **2 deep-dives non signalés** : `## Why Each Alias Needs Its Own User Line` (l. 112) et
  `## One Caveat: The Wildcard Is Truly Universal` (l. 139) — ni "optional", ni "skip", ni
  "under the hood" dans le titre.

Test des 30 secondes : je reste — le hook est précis, la promesse tenue ; mais je lis 34 lignes
de config avant de voir ssh fonctionner, alors que l'ordre naturel serait : preuve d'abord, config ensuite.

## Risque

Le lecteur qui arrive sans connaître SSH config voit d'abord 34 lignes de stanzas numérotées et doit
les comprendre pour juger si l'article vaut son temps. La preuve (le Terminal montrant `ssh project_prod`
fonctionner sans flag) existe déjà — elle est juste placée 4 lignes trop bas.

## Solution

**Un seul swap dans `## The Config`** — Terminal en premier, Snippet après.

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `<Vars … />` (inchangé, doit précéder le Snippet) | l. 29-42 |
| 2 | `## The Config` (inchangé) | l. 44 |
| 3 | Une phrase d'introduction — ex. "Two commands work out of the box, no flags needed:" | nouveau |
| 4 | `<Terminal>` — `ssh project_prod` + `ssh server-test.cloud…` + leurs sorties | l. 52-59 |
| 5 | "No `ProxyJump` flag, no explicit key — the config handles both transparently." | l. 61 |
| 6 | "The config that makes this possible:" (transition) | rewording de l. 46 |
| 7 | `<Snippet source="./files/ssh_config_optimized.txt" />` | l. 48 |
| 8+ | Suite de l'article inchangée | l. 63+ |

Corrections supplémentaires (MINOR, applicables au même passage) :

1. **Fusionner les deux instances du warning "ProxyJump none must come before Host *"** : garder
   l'AlertBox devcontainer (l. 143-153, contexte utile), retirer la phrase identique en l. 81 dans
   `## The Four Sections` — la règle y est déjà couverte par "Position is load-bearing: this stanza
   must come *before* `Host *`."
2. **Marquer les deux deep-dives** :
   - `## Why Each Alias Needs Its Own User Line` → `## Why Each Alias Needs Its Own User Line (skip if the config just works for you)`
   - `## One Caveat: The Wildcard Is Truly Universal` → `## One Caveat: The Wildcard Is Truly Universal (skip if this machine is corporate-only)`

Cible : time to value < 15 % (**déjà atteint**), abstraction-avant-preuve éliminée.
Structure de référence : `.claude/skills/blog-post-structure/SKILL.md`.
