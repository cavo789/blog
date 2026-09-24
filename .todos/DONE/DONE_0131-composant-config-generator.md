# 0131 — Composant ConfigGenerator : générateur de config interactif basé sur Handlebars

- **Priority**: Medium
- **Batch**: config-generator
- **Depends**: —
- **Files**: `src/components/ConfigGenerator/index.tsx`, `src/components/ConfigGenerator/styles.module.css`, `src/theme/MDXComponents.js`, `.unpublished/ssh-config-tips/index.md`, `.unpublished/ssh-config-tips/files/template_remotecommand.hbs`

## Problème

Les snippets de config dans les articles (SSH, Docker Compose, nginx, etc.) contiennent des valeurs
codées en dur. Le lecteur doit faire un copy/paste puis adapter manuellement — alias, hostname, user,
répertoire, etc. Le composant `Vars` permet de substituer certaines valeurs mais n'a pas d'interface
d'édition in-situ et ne génère pas d'output copiable.

Pour l'article `ssh-config-tips`, le besoin est plus fort encore : le lecteur peut avoir 1, 2 ou N
serveurs (test, dev, staging, prod, …) et doit aujourd'hui dupliquer et adapter les blocs manuellement.

## Solution

Créer un composant React générique `<ConfigGenerator>` — **aucune logique métier SSH ou autre
dedans** — qui :

### Moteur de template

- Utilise **Handlebars.js** (bibliothèque client-side, ~20 KB gzip).
- Template chargé depuis un fichier via `source="./files/mon-template.hbs"` (co-localisé avec
  l'article) ou inline via `template={...}`.
- Supporte `{{variable}}`, `{{#each list}}…{{/each}}`, `{{#if condition}}…{{/if}}`.
- Le composant ne connaît rien au domaine — il rend le template avec les valeurs du formulaire.

### Formulaire

Trois types de champs :

**1. Champs globaux** (`globalFields` prop) — liste de clés issues du store `Vars` de la page.
Affichés dans un groupe **"Common settings"** replié par défaut (collapse/expand). Quand le lecteur
les modifie ici, le store `Vars` est mis à jour → tous les `%%key%%` dans les `<Terminal>` et
`<Snippet>` de la page se mettent aussi à jour. Plus besoin de scroller jusqu'au `<Vars>` en haut
de l'article.

**2. Champs simples** (`type: "string"` | `type: "select"`) — inputs et selects classiques, groupés
et affichés directement sous le groupe global.

**3. Champs liste** (`type: "list"`) — tableau répétable avec une ligne par item, bouton **+ Add**
et bouton **×** par ligne. Chaque ligne a ses propres sous-champs (définis dans `fields`). C'est ce
type qui permet de gérer N serveurs dans `ssh-config-tips`.

### Output

- Zone de code live, mise à jour à chaque frappe.
- Bouton **Copy** (même mécanique que les autres composants du blog).
- Pas de bouton "Submit" — le rendu est immédiat.

### Props (interface publique)

```tsx
type FieldDef =
  | { type: 'string' | 'select'; name: string; label: string; default?: string; options?: string[] }
  | { type: 'list'; name: string; label: string; fields: FieldDef[]; defaultRows?: Record<string, string>[] }

interface ConfigGeneratorProps {
  source?: string          // chemin vers le fichier .hbs (relatif à l'article)
  template?: string        // template inline (alternatif à source)
  globalFields?: string[]  // clés Vars à afficher dans le groupe "Common settings" replié
  fields: FieldDef[]       // champs locaux du générateur (simples ou liste)
}
```

### Intégration dans l'article `ssh-config-tips`

Remplacer le deuxième bloc `<Vars>` (lignes 152–165) et le `<Snippet source="./files/ssh_config_remotecommand.txt">` par un `<ConfigGenerator>` :

```mdx
<ConfigGenerator
  source="./files/template_remotecommand.hbs"
  globalFields={["vmUser", "vmIp", "sshKey", "userB"]}
  fields={[
    {
      type: "list",
      name: "servers",
      label: "Servers",
      defaultRows: [
        { name: "project_test", hostname: "server-test.office.corp.example",
          appUser: "mass_upload", appDir: "/opt/folder_devcontainer",
          bannerText: "This is the test server", bannerStyle: "yellow" },
        { name: "project_prod", hostname: "server-prod.office.corp.example",
          appUser: "app-user", appDir: "/opt/project",
          bannerText: "⚠  Production server — be careful!", bannerStyle: "red-bold" },
      ],
      fields: [
        { type: "string", name: "name",       label: "Alias prefix"  },
        { type: "string", name: "hostname",   label: "Hostname"      },
        { type: "string", name: "appUser",    label: "App user"      },
        { type: "string", name: "appDir",     label: "App directory" },
        { type: "string", name: "bannerText", label: "Banner text"   },
        { type: "select", name: "bannerStyle", label: "Banner color",
          options: ["yellow", "red-bold", "green", "cyan", "none"]   },
      ],
    },
  ]}
/>
```

Créer le fichier template `files/template_remotecommand.hbs` avec les boucles Handlebars sur
`{{#each servers}}` — une paire de stanzas par ligne, `{{name}}_app` / `{{name}}`, `{{hostname}}`,
`{{appUser}}`, `{{appDir}}`, `{{../userB}}`, et la séquence ANSI issue de `{{bannerStyle}}` via un
Handlebars helper `bannerAnsi`.

Mettre à jour le texte de l'article autour du générateur pour refléter le nouvel usage.

## Risque

- Handlebars.js doit être ajouté aux dépendances (`yarn add handlebars`) — vérifier l'impact sur le
  bundle.
- Le chargement d'un fichier `.hbs` distant (via `source=`) nécessite un `fetch` au rendu côté
  client — prévoir un état de chargement.
- Le store `Vars` n'est pas encore une API publique documentée — vérifier le mécanisme interne avant
  d'y écrire depuis `ConfigGenerator`.

## Réutilisabilité — principe fondateur

Ce composant est **entièrement générique**. La logique SSH est dans le template `.hbs`, pas dans le
composant. Autres articles où `ConfigGenerator` s'applique naturellement dès qu'il est disponible :
articles Docker Compose (variables de service, ports, volumes), articles nginx/Apache (vhosts),
articles Bash (scripts paramétrables), et tout article qui se termine aujourd'hui par "adaptez ce
bloc à votre config".

Ne pas introduire de prop ou de logique SSH-spécifique dans le composant — toute spécialisation
passe par le template.
