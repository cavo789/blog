# replace-details-with-snippets.sh

This script will loop all `blog/**/*.md` files and will replace a construction like:

```md
<details>
<summary>src/components/Bluesky/index.js</summary>
(content)
</details>
```

To this:

```md
<Snippet filename="src/components/Bluesky/index.js">
(content)
</Snippet>
```
