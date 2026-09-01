# Christophe Avonture - Blog

<div align="center">
<img width="200" src="https://raw.githubusercontent.com/cavo789/blog/main/static/img/meerkat/suricate.webp" />
</div>

<div align="center">
<img src="https://img.shields.io/badge/dynamic/json.svg?label=@docusaurus/core&query=$.dependencies[%22@docusaurus/core%22]&url=https://raw.githubusercontent.com/cavo789/blog/main/package.json" />
</div>

## Clone this repository

Start a console and run `cd ~ && git clone https://github.com/cavo789/blog.git && cd blog` to clone this repository if needed.

Then run `make install` to install dependencies.

_If you don't have `make` on your computer, please run `sudo apt-get update && sudo apt-get -y install make`._

## Build, run and start the blog in production mode

Just run `TARGET=production make build` to create the Docker image then `TARGET=production make up` to run a container based on that image.

This done, the site is now running, and you can access to it using `https://localhost`. _If you don't have the site running, please wait a little and refresh the page. Sometimes it helps to create a new browser tab and surf to `https://localhost` again._

If you want to remove the image later on, just run `TARGET=production make remove` and that's all.

### Push the production image

If you want to push your blog as a Docker image on Docker Hub:

- Do a login using `docker login` (you'll see `Authenticating with existing credentials...`),
- run `make push`

## Build, run and open the blog as a developer

This time, please run `make build && make devcontainer`. Once in VSCode, press <kbd>F1</kbd> and select the option **Dev Containers: Rebuild without cache and Reopen in Container**. _If you don't have this command, please make sure to install the VSCode [Dev Container from Microsoft](https://marketplace.visualstudio.com/publishers/Microsoft)._

Wait until the devcontainer is fully created then so to `https://localhost:3000` to surf on the site.

This is the development i.e. if you make changes to VSCode files, they will be reflected in your browser.

## Bash console

Depending on if you're working with the production image or with devcontainer, please run `TARGET=production make bash` (for the production image) or just `make bash` for the devcontainer.

You'll then start an interactive console in the Docker container.

## Suggest tags for an article using local Ollama

`yarn tags:suggest <article-file>` reads an article's frontmatter plus `blog/tags.yml` and asks a
local Ollama model (see `scripts/suggest-tags.mjs`) which existing tags apply — confirming tags
already set and suggesting up to 5 relevant ones that are missing. Suggestion only: it never
writes to the article.

A VS Code task wraps it (`.vscode/tasks.json`, `Suggest tags (Ollama)`) so it can run against the
file currently open in the editor: open the article, press <kbd>F1</kbd>, run **Tasks: Run Task**,
then pick **Suggest tags (Ollama)**. No keybinding is set up for it — `Ctrl+T` was tried and
dropped: VS Code keybindings only live in a personal, per-machine `keybindings.json` (no
workspace-level file to version here), that file can end up read-only depending on the setup, and
a silent shortcut nobody else can discover defeats the point anyway. The Command Palette route
above works the same way for everyone, every time.

## Deployment

For this repository, the deployment is made using GitHub actions. By pushing changes to GitHub, there is a `CI/CD` pipeline who'll be started by GitHub, download Node, run `yarn build` and, once HTML files have been generated in the `build` folder, an FTP copy job will copy every file from GitHub to the host where the blog is running.

## Troubleshooting: purging the service worker

The production build registers a service worker (`@docusaurus/plugin-pwa`, see `docusaurus.config.js`) so the blog can be installed as an app and its homepage stays reachable offline. It only activates for a reader who installed the app or is running it standalone (or added `?offlineMode=true` to a URL) — a normal browser visit never registers it, so this only ever matters when reproducing an issue reported from an installed instance.

If something looks stale or broken only in that installed/standalone context (an old version won't go away, a page that should render doesn't), suspect the service worker first — it's a layer of caching most people forget exists once it's out of sight. To clear it in Chrome/Edge:

- Open DevTools → **Application** tab → **Service Workers** in the sidebar.
- Click **Unregister** next to this site's worker (or check **Update on reload** while debugging).
- Still in **Application**, open **Storage** and click **Clear site data** to also drop the cached shell (homepage, manifest, the "Ask my blog" question index) alongside it.
- Reload the page.

A rebuild alone doesn't force this: existing installs keep running their currently-installed worker until it detects a byte-level change in `sw.js` and a reader accepts the in-app "New version available" reload prompt — the steps above are the manual override when that isn't happening.

## Troubleshooting: dev server stuck on a red "Compiled with problems" screen

If `yarn start` suddenly shows a full-page webpack error instead of the blog — typically
`Module not found: Error: Can't resolve '@theme/PwaReloadPopup'` — it means a `yarn build` ran
at the same time `yarn start` was already watching files. Both used to regenerate Docusaurus's
codegen folder (`.docusaurus/`) in place, with no locking between them; `@docusaurus/plugin-pwa`
only wires itself up for `NODE_ENV=production`, so a dev-server rebuild that lands mid-build
can pick up the production plugin registration (theme alias included) without the matching
production webpack config that would actually resolve it — hence the "can't resolve" error.

Fixed structurally, not just documented: `yarn start` now writes its codegen to its own
`.docusaurus-dev/` (via `DOCUSAURUS_GENERATED_FILES_DIR_NAME`, see `package.json`), so a
concurrent `yarn build` — which still uses the default `.docusaurus/` — can no longer race it.
`yarn clear` removes both folders. If you still hit the red screen (a leftover install predating
this fix, or a new codegen-sharing bug), the manual override is the same either way:

```bash
yarn clear && yarn start
```
