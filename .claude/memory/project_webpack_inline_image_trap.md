---
name: project-webpack-inline-image-trap
description: "importer une petite image de static/ via webpack l'inline en base64 dans le chunk ; passer par withBaseUrl, et require.context mode \"weak\" pour n'avoir que les noms"
metadata:
  node_type: memory
  type: project
  originSessionId: 2831be86-f031-44cb-999e-2dd1a5feac50
  modified: 2026-09-18T16:08:31.355Z
---

Les images sous le seuil d'inline de webpack (les 68 `.webp` de `static/img/meerkat/emojis/` font
9–18 KB) ne sont **pas émises comme fichiers** : elles partent en base64 dans le chunk qui les
importe. Mesuré le 2026-09-18 sur `/map` : un `require.context` sur ce dossier a fait passer le chunk
de la page de 32 KB à **502 KB (363 KB gzip)**, pour une page qui en dessine une vingtaine.

**Why:** un `import x from "@site/static/..."` a l'air gratuit — les fichiers sont déjà dans
`static/`, donc on croit juste fabriquer une URL. La duplication ne se voit qu'en pesant le chunk
construit (`grep -c 'data:image/webp'` sur le `.js` du build le prouve en une commande).

**How to apply:** pour une image de `static/`, construire l'URL — `withBaseUrl("/img/…")`, jamais une
chaîne nue : un chemin absolu ne porte pas le préfixe de locale et `/fr/` récupère le fallback SPA
(même piège que dans `src/pages/map.mdx`). Chaque build de locale copie `static/`, donc
`/fr/img/…` existe. Si le code a besoin de la *liste* des fichiers d'un dossier sans les embarquer :
`require.context(dir, false, /\.webp$/, "weak")` — webpack n'embarque aucun module mais `keys()`
reste peuplé (le type dans `src/global.d.ts` accepte ce 4e argument). Voir
`src/components/BlogGraph/meerkats.ts`.
