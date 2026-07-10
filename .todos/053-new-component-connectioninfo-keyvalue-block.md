# 053 — Nouveau composant candidat : bloc `ConnectionInfo` / `KeyValue`

**Priority:** Low

## Problème

Un pattern revient dans 5-6 articles de 2025 : une liste à puces de paires `Label: valeur` pour
décrire des identifiants de connexion ou des variables de configuration, formatée différemment à
chaque fois (parfois avec virgule finale, parfois sans, ordre variable) :

- `blog/2025/03/16/vba-excel-sql-server-part-2/index.md` — "Server name: `localhost,1433` /
  Authentication: ... / Login: `SA` / Password: ..."
- `blog/2025/04/04/docker-oracle-database-server/index.md` — connexion Oracle SQL Developer
  (Username/Role/Password/Hostname/Port/Service name)
- `blog/2025/04/11/docker-oracle-ords/index.md` — quasi le même bloc, répété
- `blog/2025/06/20/pentaho-discovery/index.md` — paramètres serveur pgAdmin (Host Name, etc.)
- `blog/2025/05/30/gitlab-runner-ssh-key/index.md` et
  `blog/2025/06/06/gitlab-using-private-images/index.md` — variables CI/CD GitLab (nom + valeur)

Aucun composant existant ne couvre ce cas ; `Columns`/`Card` pourraient être détournés mais ne sont
pas pensés pour de l'étiquette/valeur alignée.

## Risque

Rien de cassé, mais 5-6 façons légèrement différentes de présenter la même chose = manque de
cohérence visuelle, et un futur article refera probablement encore une variante différente.

## Solution proposée

Créer un petit composant `ConnectionInfo` (ou `KeyValue`) du type :

```jsx
<ConnectionInfo
  items={[
    { label: "Username", value: "SYS" },
    { label: "Role", value: "SYSDBA" },
    { label: "Hostname", value: "127.0.0.1" },
  ]}
/>
```

rendu en grille label/valeur alignée (2 colonnes), thème-aware comme les autres composants
(`StepsCard`, `AlertBox`). Une fois créé, rétrofiter les 5-6 articles listés ci-dessus.

## Lien avec l'existant

Aucun TODO existant. Trouvé lors du même audit `blog/2025` que [[049]]-[[052]]. C'est le seul
candidat de "nouveau composant" identifié lors de cet audit qui atteint le seuil de 3+ articles
avec un pattern réellement identique (les autres cas identifiés — glossaire, avant/après, etc. —
n'ont pas atteint ce seuil).
