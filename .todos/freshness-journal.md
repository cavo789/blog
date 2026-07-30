# Freshness Journal

Tracks articles already reviewed so that each `/freshness` session continues where the last one
left off. Do not edit manually — maintained by the `/freshness` skill.

| Reviewed | Slug | mainTag | Verdict | Notes |
| -------- | ---- | ------- | ------- | ----- |
| 2026-07-30 | vscode-tabnine | ai | CRITICAL | Free tier killed Apr 2025; enterprise-only $39/mo. AlertBox added + TODO created. |
| 2026-07-30 | cpanel-spam | self-hosted | OK | SpamAssassin on cPanel still standard; content accurate. |
| 2026-07-30 | planethoster-n0c-spam | self-hosted | OK | RoundCube/Sieve approach unchanged on N0C; mg.n0c.com URLs live. |
| 2026-07-30 | planethoster-n0c-spam-roundcube-action | self-hosted | MINOR | actions/checkout@v3→@v6, FTP-Deploy-Action @v4.3.4→@v4.3.5 (Node24 required since Jun 2026). |
| 2026-07-30 | matomo-install | self-hosted | OK | Matomo still active and free; docusaurus-plugin-matomo repo live. |
| 2026-07-30 | docker-limesurvey | self-hosted | OK | Already updated 2026-06-15 (MySQL 8.4 pin, healthcheck). |
| 2026-07-30 | vscode-markdown-code-folding | vscode | OK | Built-in feature unchanged; GitHub issue link live. |
| 2026-07-30 | vscode-github-dev | vscode | OK | github.dev/.key shortcut still active; docs links live (200). |
| 2026-07-30 | vscode-sticky-scroll | vscode | OK | Built-in feature unchanged. link-starved (1 Link). |
| 2026-07-30 | vscode-autosave | vscode | OK | Built-in feature unchanged; no external URLs. |
| 2026-07-30 | vscode-devcontainer | php | MINOR | PHP_CodeSniffer link updated squizlabs→PHPCSStandards (abandoned Dec 2023); FriendsOfPHP/PHP-CS-Fixer link updated to PHP-CS-Fixer/PHP-CS-Fixer; PHP-CS-Fixer v3.46.0→v3.89.2 noted. |
| 2026-07-30 | vscode-php-refactoring | php | OK | Both extensions (st-pham, marsl) still live on marketplace; content accurate. |
| 2026-07-30 | vscode-errorlens | vscode | OK | Extension stable and maintained; no external URLs. |
| 2026-07-30 | docker-volume | docker | MINOR | php:8.1.5-apache (EOL Nov 2024) updated to php:8.3-apache in all examples. |
| 2026-07-30 | docker-volumes | docker | OK | Alpine/compose concepts timeless; Docker Desktop volume path still accurate. |
| 2026-07-30 | docker-java | docker | MINOR | openjdk:11 deprecated on Docker Hub (Dec 2022) — replaced with eclipse-temurin:21 across all examples. |
| 2026-07-30 | docker-assembly | docker | OK | esolang/x86asm-nasm image live (200); nostalgia content unchanged. |
| 2026-07-30 | docker-pascal | docker | OK | signumtemporis/fpc image live (200); cavo789/swag repo live. |
| 2026-07-30 | docker_uptime_kuma | docker | MINOR | Demo URL demo.uptime.kuma.pet:27000 dead (timeout) → updated to demo.kuma.pet; v2.0 released Oct 2025 noted. |
| 2026-07-30 | sql-formatter | self-hosted | OK | Own tool: GitHub repo + avonture.be demo both live (200). |
| 2026-07-30 | docker-php-ini | docker | OK | Volume-override technique timeless; no external URLs. |
| 2026-07-30 | vscode-codesnap | vscode | OK | adpyke.codesnap extension live (200); no deprecation found. |
| 2026-07-30 | vscode-export-list-of-extensions | vscode | OK | `code --list-extensions` stable CLI; no external URLs. |
| 2026-07-30 | vscode-multiple-cursors | vscode | OK | Built-in Shift+Alt+I feature; no external URLs. |
| 2026-07-30 | docker-inspect | docker | OK | `docker inspect` stable; uses php:8.2-apache (current). |
| 2026-07-30 | docker-wordpress | docker | MINOR | mysql:8.0.13→mysql:8.4 (EOL Apr 2026); mariadb:11.2.2→mariadb:11.4 LTS; wordpress:6.4.2-php8.2→wordpress:php8.3-apache (WP 7.0 released May 2026). |
| 2026-07-30 | docker-network-and-extra-hosts | docker | OK | docker network/extra_hosts stable; php:8.2-apache current. |
| 2026-07-30 | vscode-php-getter-setter | vscode | OK | phproberto.vscode-php-getters-setters live (200). |
| 2026-07-30 | docker-health-condition | docker | OK | depends_on/service_healthy stable; Docker docs URL live. |
| 2026-07-30 | site-creation | docusaurus | OK | All URLs live; docusaurus-search-local not archived; withcabin.com live (solo-maintained since Jan 2025 after Normally studio closure). |
| 2026-07-30 | vscode-regions | vscode | OK | maptz.regionfolder + autofoldyeah extensions both live (200); last maptz update Mar 2023 but no deprecation. review_date added. |
| 2026-07-30 | ai-image-generation | ai | OK | recraft.ai still live with free tier (commercial restrictions apply); bing.com/images/create live. review_date added. |
| 2026-07-30 | docusaurus-number-of-posts | docusaurus | OK | GitHub discussion link live; archive-page trick still valid. review_date added. |
| 2026-07-30 | docusaurus-docker | docusaurus | MINOR | node:21-alpine EOL Jun 2024 → updated Dockerfile + prose to node:22-alpine LTS; updates: entry added. |
| 2026-07-30 | vscode-jetbrains-font | vscode | OK | JetBrains Mono still free and maintained; jetbrains.com/lp/mono live. review_date added. |
| 2026-07-30 | docusaurus-docker-own-blog | docusaurus | OK | All docusaurus.io links live; docker compose cp approach still valid in Docusaurus v3. review_date added. |
| 2026-07-30 | docusaurus-articles-tips | docusaurus | OK | Already updated 2025-09-13 (Highlight component); all links live. No review_date (recent updates entry). |
| 2026-07-30 | docker-html-site | docker | OK | httpd:alpine current; github.com/toidicode/template live (not archived). review_date added. |
| 2026-07-30 | docker-docusaurus-prod | docusaurus | MINOR | node:21-alpine EOL Jun 2024 → updated Dockerfile to node:22-alpine LTS; updates: entry added. (Article already deprecated per AlertBox.) |
| 2026-07-30 | heimdall-dashboard | self-hosted | OK | linuxserver/docker-heimdall active (GitHub pushed 2026-07-24); heimdall.site live. review_date added. |
| 2026-07-30 | update-env-files-cli | linux | OK | No external URLs; bash functions timeless. review_date added. |
| 2026-07-30 | linux-fzf-introduction | linux | OK | fzf GitHub active; updates:2024-03-31 > 1yr. review_date added. |
| 2026-07-30 | docker-out-of-docker-dood | docker | OK | portainer.io live; updates:2025-08-03 < 1yr. No action. |
| 2026-07-30 | bash-logging | bash | OK | No external URLs; bash timeless. review_date added. |
| 2026-07-30 | bash-console-log-together | bash | OK | No external URLs; bash timeless. review_date added. |
| 2026-07-30 | vscode-todo-tree | vscode | OK | marketplace+dev.to links live (200). review_date added. |
| 2026-07-30 | postman | api | OK | postman.com+docs live (200). review_date added. |
| 2026-07-30 | ubuntu-install | linux | OK | ubuntu.com+balena.io+launchpad live (200); Ubuntu 24.04 still LTS. review_date added. |
| 2026-07-30 | docker-php-run-script-or-website | php | MINOR | php:7.4-apache (EOL Dec 2022) → php:8.3-apache; php:8.2-apache → php:8.4-apache. updates: added. |
| 2026-07-30 | install-docker | php | MINOR | php:7.4.29→8.3 (EOL Dec 2022) and php:8.1.5→8.4 (EOL Nov 2024). Prose + TLDR updated. updates: added. |
| 2026-07-30 | docker-init-php-apache | docker | OK | docs.docker.com links live; PHP 8.2 supported until Dec 2026. review_date added. |
| 2026-07-30 | ftp-erase-files | linux | OK | No external URLs; PHP technique timeless. review_date added. |
| 2026-07-30 | docker-python | python | OK | hub.docker.com/_/python live; hackr.io 403 (anti-bot, skip). review_date added. |
| 2026-07-30 | docker-init | php | OK | docker.com/blog/docker-desktop-4-26 + cli/issues/4702 live; bug in 4.26 is historical. review_date added. |
| 2026-07-30 | docker-git | docker | OK | No external URLs; volume-mount technique timeless. review_date added. |
| 2026-07-30 | docker-phpdocumentor | php | OK | docs.phpdoc.org + phpdoc/phpdoc Docker image live (200). review_date added. |
| 2026-07-30 | github-action | github | OK | deploy.yml uses actions@v4 + Node 20 (current). review_date added. |
| 2026-07-30 | linux-diff-file-folder | linux | OK | No external URLs; diff timeless. review_date added. |
| 2026-07-30 | linux-compare-two-versions-of-the-same-script | linux | OK | No external URLs; bash timeless. review_date added. |
| 2026-07-30 | linux-sort-functions-in-script | bash | OK | No external URLs; bash timeless. review_date added. |
| 2026-07-30 | linux-generate-documentation-from-bash-scripts | bash | OK | docs.phpdoc.org docblock link live (200). review_date added. |
| 2026-07-30 | php-rector | php | MINOR | Rector v1.0.0 in title; now at v2.5.8. updates: entry added noting migration guide. |
| 2026-07-30 | github-retrieve-email | github | OK | emailaddress.github.io live (200); .patch trick still works. review_date added. link-starved (1 Link). |
| 2026-07-30 | php-devcontainer | php | OK | cavo789/php_devcontainer live; squizlabs PHPCS not archived per API. review_date added. |
| 2026-07-30 | github-connect-using-ssh | github | OK | updates:2026-02-04 < 1yr. No action. |
| 2026-07-30 | vbs-auto-update | github | OK | cavo789/vbs_utilities live (200); VBScript timeless on Windows. review_date added. |
| 2026-07-30 | zsh-install | zsh | OK | updates:2026-02-04 < 1yr; ohmyz.sh+powerlevel10k live. No action. |
| 2026-07-30 | zsh-plugin-autosuggestions | zsh | OK | updates:2026-02-04 < 1yr; zsh-autosuggestions GitHub live. No action. |
| 2026-07-30 | zsh-syntax-highlighting | zsh | OK | updates:2026-02-04 < 1yr; zsh-syntax-highlighting GitHub live. No action. |
| 2026-07-30 | docker-karakeep | self-hosted | OK | karakeep.app live (200); self-hosted app active. review_date added. |
| 2026-07-30 | docker-gui-in-browser | docker | OK | linuxserver/firefox + linuxserver/docker-gimp active; hub.docker.com links live. review_date added. link-starved (1 Link). |
| 2026-07-30 | docker-run-linux-gui | docker | OK | jetthoughts article live; xhost+X11 technique still valid; classiccontainers/doom2 live. review_date added. |
| 2026-07-30 | docker-healthy | bash | OK | No external URLs; docker inspect/container list stable commands. review_date added. |
| 2026-07-30 | linux-jq | linux | OK | randomuser.me (200), jqlang.github.io (200), public-apis (200, not archived). jq stable. review_date added. |
| 2026-07-30 | linux-xmlstarlet | linux | OK | xmlstar.sourceforge.net (200); xmlstarlet stable. review_date added. link-starved (1 Link). |
| 2026-07-30 | bash-ascii-art | bash | OK | patorjk.com/software/taag (200); technique timeless. review_date added. |
| 2026-07-30 | bash-load-env | bash | OK | mihow gist (200); set -o allexport pattern timeless. review_date added. |
| 2026-07-30 | docker-postgrest | api | MINOR | PostgREST v10.1.1 → v14.16; archive filename changed linux-static-x64 → linux-static-x86-64. Download command updated, updates: entry added. |
| 2026-07-30 | linux-sed-tips | linux | OK | No external URLs; sed technique timeless. review_date added. |
| 2026-07-30 | compare-env-files-cli | linux | OK | No external URLs; diff/grep/sort timeless. review_date added. |
| 2026-07-30 | docker-definition-like-im-five | docker | OK | All Docker Hub URLs live (dockurr/windows, dockurr/macos, gimp, linuxserver/firefox); Doom-in-Docker not archived. review_date added. |
| 2026-07-30 | php-obfuscator | php | MINOR | php:7.4-fpm (EOL Nov 2022) → php:8.3-fpm in all 3 docker run commands; updates: entry added. |
| 2026-07-30 | bash-parallel-task | bash | OK | No external URLs; parallel jobs bash technique timeless. review_date added. |
| 2026-07-30 | bash-progression-bar | bash | OK | xieme-art.org link live (200); bash progress bar technique timeless. review_date added. |
| 2026-07-30 | linux-history | linux | OK | Wikipedia DOSKEY link stable; shell history/HISTFILE content timeless. review_date added. |
| 2026-07-30 | docker-lubuntu | linux | OK | VcXsrv SourceForge live (last updated May 2024); YouTube link not broken; Lubuntu Docker approach unchanged. review_date added. |
| 2026-07-30 | json-lint | linux | OK | jsonlint.avonture.be (200), github.com/cavo789/jsonlint (200), Chrome JSON Formatter extension (200). review_date added. |
| 2026-07-30 | vscode-code-server | vscode | OK | codercom/code-server Docker image still active; github.com/coder/code-server + coder.com/docs links live. review_date added. |
| 2026-07-30 | json-faker | linux | MINOR | Mockaroo acquired by Tonic.ai (Apr 2025); free tier (200 API calls/day) unchanged, service operational; updates: entry added. |
| 2026-07-30 | linux-inotifywait | bash | OK | No external URLs; inotifywait/inotify-tools package timeless. review_date added. |
| 2026-07-30 | docker-memos | self-hosted | MINOR | Shortcuts docs URL moved: /docs/getting-started/shortcuts (404) → /docs/usage/shortcuts (200). Link updated + updates: entry added. |
| 2026-07-30 | gemini-meerkat | ai | OK | All URLs live; Gemini Nano Banana feature still active and expanded (Nano Banana 2 Lite, Jun 2026). Article < 1yr, no review_date. |
| 2026-07-30 | welcome | (none) | OK | docusaurus.io live; timeless intro post. review_date added. |
| 2026-07-30 | wslg-rpd-connection | wsl | OK | nextofwindows.com live (200); xrdp/WSL2 approach still valid; medium.com 403 (anti-bot, skipped). review_date added. |
| 2026-07-30 | apache-htaccess | apache | OK | hstspreload.org + aspirine.org/htpasswd.html live (200); Apache directives reference is timeless. review_date added. |
| 2026-07-30 | move-wsl-to-another-location | wsl | OK | dev.to/mefaba link live (200); wsl --export/--import approach still valid. review_date added. link-starved (1 Link). |
| 2026-07-30 | wsl-windows-explorer | wsl | OK | Already updated 2026-06-15 (< 1yr); WSL GitHub discussion live (200). No action needed. link-starved (1 Link). |
| 2026-07-30 | frankenphp-docker-joomla | joomla | MINOR | FrankenPHP now stable at v1.11+ (not beta); alexandreelise/frankenphp-joomla repo live (not archived). Updates entry added noting production-ready status. |
| 2026-07-30 | laravel_events | laravel | MINOR | cavo789/event_thephpleague_learning repo deleted (404); link removed from prose. League/Event library still maintained (v3.0.3, updated Jan 2026). Updates entry added. |
| 2026-07-30 | docker-diagram-as-code | doc-as-code | OK | All URLs live; mermaid-js.github.io redirects to mermaid.js.org (200); gtramontina/docker-diagrams not archived (pushed 2024-12); 0.23.4 latest (0.23.3 was in article but already qualified). review_date added. |
| 2026-07-30 | laravel-filament | laravel | OK | filamentphp.com + demo.filamentphp.com + GitHub repo all 200; still free and very active. review_date added. |
| 2026-07-30 | docker_ssl_encrypt | ssl | OK | hub.docker.com/r/alpine/openssl 200; AES-256-CBC/PBKDF2 approach timeless. review_date added. link-starved (1 Link). |
| 2026-07-30 | windows-winget | windows | OK | learn.microsoft.com winget 200; woluweb.be 200; `winget upgrade --all --silent` + `--include-unknown` syntax unchanged. review_date added. |
| 2026-07-30 | docker-mindmap | doc-as-code | OK | markmap.js.org/repl + /docs 200; hub.docker.com/r/leopoul/markmap 200 (only v1.0.0, matches article); source GitHub repo 404 but image still functional. review_date added. |
| 2026-07-30 | docker-joomla | joomla | MINOR | Dockerfile link 6.0/php8.3→6.1/php8.4 (404 confirmed; 6.0 folder removed, 6.1 now exists); prose updated "Joomla 6.0/php:8.3-apache"→"Joomla 6.1/php:8.4-apache"; updates: entry added. No review_date (recent updates 2026-01-03). |
| 2026-07-30 | quarto-conditional-display | quarto | OK | quarto.org/docs/authoring/conditional.html 200; content-visible/content-hidden feature stable. review_date added. |
| 2026-07-30 | quarto-powerpoint | quarto | OK | quarto.org/docs/presentations/powerpoint.html 200; `--to pptx` feature stable. review_date added. |
| 2026-07-30 | wsl-powershell | wsl | OK | No external URLs; `powershell.exe <file>` trick still valid on WSL2. review_date added. |
| 2026-07-30 | new-year-2024 | (none) | OK | No external URLs; timeless greeting post. review_date added. |
| 2026-07-30 | powerlevel10k_sandbox | customization | OK | github.com/romkatv/powerlevel10k 200, not archived (pushed 2026-06-15); Alpine Docker sandbox approach timeless. review_date added. |
| 2026-07-30 | docker-quarto | quarto | MINOR | Quarto 1.6.36→1.10.18; Dockerfile updated; updates: entry added. All quarto.org URLs live. |
| 2026-07-30 | quarto-project-variables | quarto | OK | quarto.org/docs/authoring/variables.html 200; {{< var >}} / {{< env >}} feature unchanged. review_date added. |
| 2026-07-30 | quarto-revealjs-tips | quarto | OK | All quarto.org revealjs docs 200; gist emoji list 200; mine.quarto.pub 200; core features unchanged. review_date added. |
| 2026-07-30 | json-crack | doc-as-code | OK | jsoncrack.com/editor 200; premium features moved to todiagram.com but free editor still operational; VSCode ext AykutSarac.jsoncrack-vscode 200. review_date added. |
| 2026-07-30 | git-config | git | OK | Already updated 2026-02-04 (< 1yr); github.com/git-tips/tips 200. No action. |
| 2026-07-30 | markdown-lint | code-quality | OK | DavidAnson/markdownlint GitHub 200; peterdavehello/markdownlint Docker image has latest tag; blog/makefile link 200. review_date added. |
| 2026-07-30 | joomla-db-kill-tables-prefix | joomla | OK | github.com/cavo789/joomla_free kill_db_tables.php 200; forum.joomla.fr post 200. review_date added. |
| 2026-07-30 | windows-terminal | windows-terminal | OK | github.com/microsoft/terminal/releases 200; settings.json approach unchanged. review_date added. |
| 2026-07-30 | python-fastapi | api | OK | fastapi.tiangolo.com 200; Starlette 1.0 bump, no breaking changes for basic usage covered; realpython.com 403 (anti-bot). review_date added. |
| 2026-07-30 | docker-python-devcontainer | python | OK | Python 3.13-slim pinned in .docker.env; 3.13 still supported until Oct 2026; article notes version is configurable; no external URLs. review_date added. |
| 2026-07-30 | php-jakzal-phpqa | code-quality | MINOR | squizlabs/PHP_CodeSniffer link updated to PHPCSStandards/PHP_CodeSniffer (squizlabs abandoned Dec 2023; README confirms). jakzal/phpqa image active (updated daily, now supports php8.5). updates: entry added. |
| 2026-07-30 | quarto-callout-blocks | quarto | OK | quarto.org/docs/authoring/callouts.html 200; callout syntax unchanged. review_date added. |
| 2026-07-30 | quarto-includes-shortcode | quarto | OK | quarto.org/docs/authoring/includes.html 200; {{< include >}} shortcode unchanged. review_date added. |
| 2026-07-30 | quarto-inline-style | quarto | OK | mine-cetinkaya-rundel.github.io/quarto-tip-a-day 200; [text]{style} feature unchanged. review_date added. |
| 2026-07-30 | docker-python-devcontainer-windows | python | OK | No external URLs; make.bat + devcontainer approach timeless; .docker.env already pins 3.13-slim. review_date added. |
| 2026-07-30 | docker-python-devcontainer-microsoft | python | MINOR | Wizard example updated 3.12-bullseye → 3.13-bookworm (Python 3.13 current stable; Bookworm now default Debian base). marketplace link live. updates: entry added. |
| 2026-07-30 | python-pandas-merge | python | OK | No external URLs; pandas merge technique timeless. review_date added. |
| 2026-07-30 | joomla-show-table | joomla | MINOR | cavo789/joomla_show_table archived May 2025; Joomla 6.1 now current (article said compatible up to 5.1). Prose updated with archive note; updates: entry added. |
| 2026-07-30 | python-pydot | python | OK | github.com/pydot/pydot 200 (active, v4.0.1 Apr 2026); app.diagrams.net 200; graphviz.readthedocs.io 200. review_date added. |
| 2026-07-30 | docker-compose-viz | doc-as-code | OK | github.com/compose-viz/compose-viz 200 (not archived); hub.docker.com/r/wst24365888/compose-viz 200; updates:2025-05-14 < 1yr. No review_date. |
| 2026-07-30 | behat-introduction | tests | OK | All URLs live (200): phpunit.de, pestphp.com, docs.behat.org, marketplace.visualstudio.com, gitlab.com/behat-chrome. Behat still active (updated Jan 2026). PHP 8.2 still supported. review_date added. |
| 2026-07-30 | linux-bash-too-many-function-parameters | code-quality | OK | No external URLs; timeless bash associative-array technique. review_date added. |
| 2026-07-30 | outlook-vba-pdf | windows | OK | github.com/cavo789/vba_outlook_save_pdf live (200). VBA/Outlook macro timeless. review_date added. |
| 2026-07-30 | linux-eza | customization | MINOR | the.eza.website dead (000) → updated to eza.rocks (current official site, confirmed via eza-community/eza). ogham/exa still returns 200 (label "abandoned" already correct). updates: entry added. No review_date (updates:2026-02-04 < 1yr). |
| 2026-07-30 | aesecure-quickscan | security | STALE | Demo quickscan.avonture.be returns 500. Project seeking new maintainer since Mar 2025 (forum.joomla.fr). No Joomla 6.x support (tops out at J5.2.2). TODO created: freshness-aesecure-quickscan.md. |
| 2026-07-30 | php-api-tips | api | OK | belgif.be (200), jsonapi.org (200), developer.mozilla.org (200); Belgif REST guide is a living document, still maintained. review_date added. |
| 2026-07-30 | docker-localhost-ssl | ssl | OK | hub.docker.com/_/httpd (200), github.com/FiloSottile/mkcert (200), github.com/peterfinlan/Sedna (200). updates:2026-06-15 < 1yr. No action. |
| 2026-07-30 | docker-use-ssh-during-build | ssh | OK | github.com/deepfence/SecretScanner (200, not acquired/renamed). Docker BuildKit --mount=type=secret is stable. review_date added. |
| 2026-07-30 | docker-name-property | docker | OK | No external URLs; Docker compose name: property stable. Published 2025-10-10 (293 days). No review_date (< 1yr). |
| 2026-07-30 | docker-prod-devcontainer | docker | OK | No external URLs; devcontainer.json + VSCode approach still current. Published 2025-10-13 (290 days). No review_date (< 1yr). |
| 2026-07-30 | pest_tips | tests | MINOR | Pest v5 released Laracon US 2026 (PHP 8.4/PHPUnit 13); AlertBox updated v4→v5; updates: entry added. All links live. |
| 2026-07-30 | keepass-overriding-url | winscp | OK | keepass.info/autourl.html, putty.org, winscp.net/integration_keepass all 200. cmd:// feature unchanged. review_date added. |
| 2026-07-30 | docker-joomla-right-to-the-point | joomla | OK | hub.docker.com/_/joomla 200 (Joomla 6.1.2 current). Simple "copy from Docker Hub" article; always current. review_date added. |
| 2026-07-30 | docker-joomla-part-2 | joomla | OK | updates:2026-01-03 < 1yr. Akeeba links 200. No action. |
| 2026-07-30 | docker-joomla-restore-jpa | joomla | OK | updates:2026-01-03 < 1yr. akeeba.com + cavo789/docker_joomla_restore live (200). No action. |
| 2026-07-30 | linux-sftp-cli | ssh | OK | redhat.com/sysadmin/ssh-automation-sshpass 200. sftp/sshpass timeless. review_date added. |
| 2026-07-30 | makefile-help | makefile | OK | cavo789/blog/blob/main/makefile 200. gnu.org 000 (anti-bot CDN, known alive). Content timeless. review_date added. |
| 2026-07-30 | makefile-using-make | makefile | OK | gnu.org 000 (anti-bot), cavo789/makefile_tips 200. Content timeless. review_date added. |
| 2026-07-30 | winscp-retrieve-password | winscp | OK | WinSCP Preferences→Logging→"Log passwords" feature still active (winscp.net/eng/docs/faq_password confirmed). review_date added. |
| 2026-07-30 | online-php-linter | code-quality | MINOR | pint-express (benjamincrozat.com/pint-express) 404 → replaced with hexmos.com/freedevtools/tldr/common/pint; squizlabs→PHPCSStandards; Laravel docs 11.x→13.x. updates: added. |
| 2026-07-30 | bruno | api | MINOR | Bruno v3 released Jan 2026; official usebruno/cli Docker image now available (AlertBox custom-image workaround from Jul 2025 may be outdated). updates: added. |
| 2026-07-30 | dagger-python | code-quality | MINOR | Dead link docs.dagger.io/integrations/gitlab/#docker-executor → docs.dagger.io/ci/integrations/gitlab (404 confirmed, new URL 200). updates: added. |
| 2026-07-30 | python-qa | code-quality | MINOR | pydocstyle GitHub repo archived Nov 2023; AlertBox added warning + updates: entry; Ruff (already in "Extra" section) is the recommended replacement. |
| 2026-07-30 | putty-no-supported-authentication-methods | winscp | OK | Timeless PuTTY registry fix; PuTTY still maintained; StackOverflow link 200. review_date added. |
| 2026-07-30 | gitlab-runner-ssh-key | gitlab | OK | SSH key base64 CI/CD approach unchanged; gitlab-examples/ssh-private-key link 200 (426 days old). review_date added. |
| 2026-07-30 | git-precommit | code-quality | OK | pre-commit framework active; all GitHub repos (husky, grumphp, captainhook, trufflehog, gitleaks) 200 (566 days old). review_date added. |
| 2026-07-30 | gitlab-using-private-images | gitlab | OK | Docker Hub PAT approach unchanged; app.docker.com/settings/personal-access-tokens 302 (auth redirect, normal). review_date added (419 days old). |
| 2026-07-30 | winscp-synchronize-both | winscp | OK | WinSCP synchronize command unchanged; winscp.net/eng/docs/scriptcommand_synchronize 200 (804 days old). review_date added. |
| 2026-07-30 | zsh-plugin-ssh-config-suggestions | ssh | OK | GitHub repo live, not archived (created Jan 2024, 1 commit, 1 star); updates:2026-02-04 < 1yr, no action. |
| 2026-07-30 | running-docusaurus-with-docker | docusaurus | OK | All URLs live: docuxlab.com, cavo789/blog, erikvl87/languagetool, Juniors017/docux-blog all 200. 261 days old (< 1yr), no action. |
| 2026-07-30 | docusaurus-override-img | component | OK | No external URLs; remark-image-transformer plugin approach stable. review_date added. |
| 2026-07-30 | docusaurus-lazy-loading | component | OK | No external URLs; MDXComponents.js lazy-load intercept stable. review_date added. |
| 2026-07-30 | docusaurus-old-notice | component | OK | updates:2026-07-30 (review_date feature) added today by dev session — content current. No review_date (recent updates entry). |
| 2026-07-30 | gitlab-docker-out-of-docker | gitlab | OK | dagger.io (200, active v0.19.9+), docs.gitlab.com/ci (200), github.com/jakzal/phpqa (200, v1.120.1 active). DooD socket passthrough approach stable. review_date added. |
| 2026-07-30 | docker-networking-troubleshooting | docker | OK | en.wikipedia.org/wiki/OSI_model 200; python:3.14-slim tag exists on Docker Hub; no_proxy pattern timeless. 220 days old (< 1yr), no review_date. |
| 2026-07-30 | docusaurus-changelog | docusaurus | OK | docusaurus.io/docs/.../last_update 200; yarn swizzle BlogPostItem/Content approach stable. review_date added. link-starved (1 Link). |
| 2026-07-30 | docusaurus-ascii-art | docusaurus | OK | folge.me/tools/image-to-ascii 200; postBuild plugin approach stable. review_date added. |
| 2026-07-30 | laravel-telescope | laravel | OK | laravel.com/docs/master/telescope 200; Telescope active in Laravel 13.x (Feb 2026). review_date added. |
| 2026-07-30 | makefile_tips | makefile | OK | All 9 URLs 200: tech.davis-hansson.com, gnu.org, devhints.io, makefiletutorial.com, isaacs gist, docker compose docs, jakzal/phpqa, VSCode marketplace. GNU Make timeless. review_date added. |
| 2026-07-30 | cypress | tests | MINOR | cypress/included:14.2.0→15.19.0 in Dockerfiles; "cypress":"^12.17.4"→"^15.19.0" in package.json. openclassrooms.com 200. updates: entry added. |
| 2026-07-30 | dos-case-sensitive | windows | OK | `fsutil.exe file setCaseSensitiveInfo` is a Windows built-in; timeless content. review_date added. link-starved (1 Link). |
| 2026-07-30 | winscp-vba | winscp | OK | winscp.net/eng/docs/library_vb + forum all 200; VBA COM library approach unchanged. review_date added. |
| 2026-07-30 | reduce-image-size | linux | OK | saerasoft.com/caesiumclt 200; squoosh.app 200; CaesiumCLT still active (Homebrew formula maintained). updates:2026-02-04 < 1yr. No action. |
| 2026-07-30 | blog-post-feed | docusaurus | OK | All RSS tool links live (feedly, inoreader, codebeautify, rss.app, rssgizmos, validator.w3.org, rssboard.org, ralfvanveen all 200). Published 2025-12-07 < 1yr. No action. |
| 2026-07-30 | winscp-download-recursively-files | winscp | OK | winscp.net/eng/docs/guide_automation 200; WinSCP scripting feature unchanged. review_date added. |
| 2026-07-30 | windows-terminal-background | windows-terminal | OK | github.com/microsoft/terminal active (200); apps.microsoft.com 000 (Microsoft Store anti-curl, verified alive via aka.ms/terminal); background image feature unchanged. review_date added. |
| 2026-07-30 | quarto-extensions | quarto | OK | All 5 extension repos alive and not archived (gadenbuie/quarto-partials last push 2026-04-23; ute/search-replace 2025-12-29; code-fullscreen unmaintained since 2023 but functional); include-code-files AlertBox already in article. updates:2026-01-26 < 1yr. No action. |
| 2026-07-30 | linux-ssh-scp | ssh | OK | linuxize.com 403 (anti-bot, skip); SSH ed25519 keygen + ssh-copy-id approach timeless. updates:2025-05-08 < 1yr. No action. |
| 2026-07-30 | quarto-mustache | quarto | OK | gadenbuie/quarto-partials active (last push 2026-04-23); ghcr.io/quarto-dev/quarto:latest standard image; tengattack/phplint 200 (just a usage example). review_date added. |
| 2026-07-30 | lovable-dev-ai | ai | OK | lovable.dev 200; active with free tier (5 credits/day, $0 plan); renamed from GPT Engineer App Dec 2024 — article correctly uses Lovable.dev. Published 2026-03-23 < 1yr. No action. |
| 2026-07-30 | ollama-installation | ai | OK | All URLs live (ollama.com/library, marketplace Continue, canirun.ai). Already updated 2026-07-27 noting Continue acquired by Cursor + config.yaml migration. < 1yr since last update. No action. |
| 2026-07-30 | zorin | linux | OK | All URLs live (zorin.com, help.zorin.com, blog.zorin.com, techpowerup.com). Zorin OS 18.1 is latest point release — article says "Zorin OS 18" which is still accurate. 241 days old (< 1yr). No review_date. |
| 2026-07-30 | markdown-csv2md | markdown | MINOR | GitHub repo (cavo789/marknotes_csv2md) archived Dec 8, 2024; csv2md.avonture.be still live (200). Updates entry added noting archive. |
| 2026-07-30 | php-grep-searching-at-lightning-speed | winscp | MINOR | GitHub repo (cavo789/php_grep) archived May 25, 2025; winscp.net live (200). Script itself still functional when deployed. Updates entry added noting archive. |
| 2026-07-30 | vscode-docker-markmap | doc-as-code | OK | All URLs live (markmap.js.org/repl, marketplace gera2ld extension, docs). ghcr.io/quarto-dev/quarto not pinned. 370 days old (> 1yr). review_date added. |
| 2026-07-30 | docusaurus-check-images | docusaurus | MINOR | Playwright Python image updated v1.57.0-jammy → v1.61.0-jammy (latest as of Jul 2026). Prose docker run command + updates: entry updated. 185 days (< 1yr). |
| 2026-07-30 | docusaurus-tags | docusaurus | OK | docusaurus.io/docs tags-file 200; python:3.14-slim active on Docker Hub. 178 days (< 1yr). No action. |
| 2026-07-30 | docusaurus-bluesky-share | bluesky | OK | bsky.app 200; Bluesky intent/compose API still active. 351 days (< 1yr). No action. link-starved (0 Link). |
| 2026-07-30 | docusaurus-bluesky-comments | bluesky | OK | Bluesky public API still active; bsky.app 200. 346 days (< 1yr). No action. link-starved (0 Link). |
| 2026-07-30 | pest-functional-testing | tests | MINOR | Pest v5.0.0 released Jul 24, 2026 (PHP 8.4 required). Article covers v4 which remains valid. pestphp.com 200. Updates entry added. 334 days (< 1yr). link-starved (1 Link). |
| 2026-07-30 | bats-unit-tests | tests | OK | bats-core active (v1.14.0); bats/bats Docker image current (1.14.0 on Hub). readthedocs.io 200. review_date added. |
| 2026-07-30 | docusaurus-relatedposts | component | OK | No external URLs; Docusaurus still active. review_date added (330 days > 1yr). |
| 2026-07-30 | docusaurus-cards | component | OK | docuxlab.com/card-component 200; docusaurus.community/Card 200; github.com/Juniors017/docux-blog 200. review_date added (325 days > 1yr). |
| 2026-07-30 | docusaurus-series | component | OK | No external URLs; Docusaurus active. updates:2025-11-15 < 1yr — no review_date. |
| 2026-07-30 | docusaurus-go-top | component | OK | github.com/Juniors017/docux-blog/ScrollToTopButton 200. review_date added (321 days > 1yr). |
| 2026-07-30 | vba-excel-ribbon | excel | MINOR | hintdesk.com/imagemso 404 → github.com/christianarielli/ImageMso; MS Download id=6627 404 → OfficeDev/office-fluent-ui-command-identifiers. Both links updated. updates: entry added. |
| 2026-07-30 | docker-adminer-pgadmin-phpmyadmin | database | OK | hub.docker.com adminer/pgadmin4/phpmyadmin all 200; Adminer 5.4.4 active (Jul 2026); AdminerEvo archived Jan 2025. review_date added (946 days > 1yr). |
| 2026-07-30 | docusaurus-plugin-replace | component | OK | No external URLs; Docusaurus active. review_date added (315 days > 1yr). |
| 2026-07-30 | docker-mssql-server | database | MINOR | SA_PASSWORD deprecated → MSSQL_SA_PASSWORD (required from 2022 CU 14+). Both occurrences updated. hub.docker.com/_/microsoft-mssql-server 200; learn.microsoft.com SSMS download 200. updates: entry added. |
| 2026-07-30 | docusaurus-snippets | component | OK | w3schools.com/tag_summary 200; docuxlab.com/logoicon 200; icon-sets.iconify.design 200. updates:2026-02-23 < 1yr — no review_date. |
| 2026-07-30 | drawdb-app | database | OK | drawdb.app/editor 200; hub.docker.com xinsodev/drawdb 200; sqltutorial.org 200; drawdb-io GitHub active (Jun 2026); no acquisition/rename. review_date added (625 days > 1yr). |
| 2026-07-30 | pentaho-discovery | database | OK | pentaho.com/pentaho-developer-edition/ 200; PDI CE 10.2.0.0 (Aug 2024) still latest stable; Java 11 requirement correct for Pentaho 10.2. review_date added (404 days > 1yr). |
| 2026-07-30 | vba-excel-call-soap-webservice | excel | OK | ec.europa.eu/taxation_customs/vies/ 200; VIES SOAP endpoint returns 405 (expected for GET on POST-only service); VBA/MSXML2.ServerXMLHTTP60 timeless. review_date added (890 days > 1yr). |
| 2026-07-30 | msaccess-optimize | msaccess | OK | No external URLs; MS Access optimization advice is timeless. review_date added (873 days > 1yr). |
| 2026-07-30 | vbs-msaccess-get-fields | msaccess | MINOR | GitHub repo cavo789/vbs_access_get_fields_list archived Mar 9, 2024 (read-only); scripts remain functional. updates: entry added. |
| 2026-07-30 | vba-excel-sql-server | excel | MINOR | GitHub repo cavo789/vba_excel_sql archived May 25, 2025 (read-only); VBA code remains functional. updates: entry added. |
| 2026-07-30 | quarto-devcontainer | devcontainer | OK | marketplace remote-containers 200; quarto.org 200; pre-commit.com 200. updates:2025-12-12 < 1yr — no review_date. |
| 2026-07-30 | accessing-ollama-across-your-local-network | ai | CRITICAL | Continue acquired by Cursor (Jun 18, 2026), shut down (Jul 15 export deadline passed, repo read-only). VSCode integration section defunct. AlertBox added + TODO created: freshness-accessing-ollama-across-your-local-network.md. |
| 2026-07-30 | github-profile-last-blogposts | github | OK | gautamkrishnar/blog-post-workflow@v1 current (latest 1.9.6, no v2 tag); actions/checkout@v4 current; marketplace 200. Published 2026-02-09 (171 days < 1yr) — no review_date. |
| 2026-07-30 | vba-excel-ribbon-load | excel | OK | bettersolutions.com/vba/ribbon/custom-ui-editor-download.htm 200; CustomUIEditor.exe still available. VBA ribbon approach timeless. review_date added (523 days). |
| 2026-07-30 | vba-excel-sql-server-part-2 | excel | MINOR | SA_PASSWORD deprecated since SQL Server 2022 CU14+ → MSSQL_SA_PASSWORD (confirmed by MS docs); cavo789/vba_excel_sql repo archived Nov 2021. Prose updated, AlertBox added, updates: entry added. |
| 2026-07-30 | gemini-tldr | component | OK | aistudio.google.com 200; gemini.google.com 200; google-genai v2.15.0 still active on PyPI; pip install command unchanged. Published 2026-02-16 (164 days < 1yr) — no review_date. |
| 2026-07-30 | docker-oracle-database-server | oracle | OK | Oracle container registry URLs 200/302 (auth redirect, normal); db-sample-schemas v23.3 matches article reference; oracletools/sqlplus:v19.18_lin tag still available; Oracle SQL Developer now at v26.2 (still free, Jul 2026). review_date added (482 days). |
| 2026-07-30 | docker-oracle-ords | oracle | OK | container-registry.oracle.com/database/ords-developer 200; ORDS 21.4 docs still accessible; thatjeffsmith.com articles live (200); apex.oracle.com 000 (anti-bot, known alive). review_date added (475 days). |
| 2026-07-30 | docusaurus-project-setup | component | OK | docuxlab.com/blog/logoicon-component-docusaurus 200; github.com/Juniors017 200; npm packages (@iconify/react, prop-types, clsx, jszip) stable. Published 2026-02-23 (157 days < 1yr) — no review_date. |
| 2026-07-30 | ssh-with-fuzzy-finder | linux | OK | github.com/junegunn/fzf 200 (active); ZSH/SSH config approach timeless. Published 2026-04-27 (94 days < 1yr) — no review_date. |
| 2026-07-30 | oracle-dotnet-nodejs-php-python | oracle | OK | All Oracle container URLs from prior articles (oracle-db network); oracledb npm at v7.0.1 (basic query API unchanged). review_date added (468 days). |
| 2026-07-30 | git-branches-gst | git | OK | No external URLs; git for-each-ref/chpwd hook timeless ZSH/git content. Published 2026-04-06 (115 days < 1yr) — no review_date. |
| 2026-07-30 | excel-formatter | excel | OK | excel-formatter.avonture.be 200 (own tool, live). review_date added (431 days). link-starved (1 Link). |
| 2026-07-30 | running-revealjs-with-docker | quarto | OK | revealjs.com 200; quarto.org 200; deepl.com 200; Dev Container marketplace 200. Published 2025-12-15 (227 days < 1yr) — no review_date. |
| 2026-07-30 | markdown-xls2md | excel | MINOR | cavo789/marknotes_xls2md GitHub repo archived Dec 8, 2024 (read-only); xls2md.avonture.be demo still live (200); jonmagic source repo live. updates: entry added. |
| 2026-07-30 | docusaurus-ai-gemini | docusaurus | OK | Docusaurus swizzling approach stable in v3; gemini.google.com live (200). All internal links. 143 days (< 1yr) — no review_date. |
| 2026-07-30 | connect-using-ssh-to-your-hosting-server | ssh | OK | mg.n0c.com live (200); SSH ed25519/ssh-copy-id approach timeless. 213 days (< 1yr) — no review_date. |
| 2026-07-30 | vscode-remote-ssh | ssh | OK | marketplace ms-vscode-remote.remote-ssh 200; Remote-SSH extension maintained by Microsoft. updates:2026-01-11 < 1yr — no review_date. |
| 2026-07-30 | vbs-files-csv | vba | OK | No external URLs; VBScript/WMI file scanning timeless on Windows. 609 days (> 1yr). review_date added. link-starved (1 Link). |
| 2026-07-30 | zsh-docker-functions | zsh | OK | No external URLs; custom ZSH fns using fzf for Docker. updates:2026-03-23 < 1yr — no review_date. |
| 2026-07-30 | windows-terminal-split-panes | windows-terminal | OK | learn.microsoft.com/wt-args 200; MS Store link live; wt.exe nt/sp/mf syntax unchanged. 199 days (< 1yr) — no review_date. |
| 2026-07-30 | claude-ia-spare-tokens | ai | OK | github.com/JuliusBrussee/caveman live (not archived); /clear, /compact, /btw are valid Claude Code commands. 59 days (< 1yr) — no review_date. |
| 2026-07-30 | windows-terminal-ssh-profile | windows-terminal | OK | No external URLs; settings.json SSH profile approach still valid. 192 days (< 1yr) — no review_date. |
| 2026-07-30 | assets-minification | bash | OK | github.com/tdewolff/minify live (not archived); hub.docker.com/r/tdewolff/minify 200; go.tacodewolff.nl/minify 200. 108 days (< 1yr) — no review_date. |
| 2026-07-30 | quarto-industrialisation | doc-as-code | OK | quarto.org + pandoc.org live (200); WritingDoc is an internal custom system, no external tools to deprecate. 136 days (< 1yr) — no review_date. |
| 2026-07-30 | belgif-api-linter | api | OK | belgif.be/specification/rest/api-guide + github.com/belgif/rest-guide-validator live (200, pushed 2026-07-29); content accurate, OpenAPI 3.1 still SHOULD NOT be used per Belgif. 80 days (< 1yr) — no review_date. |
| 2026-07-30 | vba-access-export | msaccess | MINOR | GitHub repo cavo789/vbs_access_export archived (read-only, last pushed 2021-11-01); VBS script remains functional and downloadable. updates: entry added. |
| 2026-07-30 | docker-python-mermaid | doc-as-code | OK | mermaid.js.org + github.com/mermaid-js/mermaid-cli (pushed 2026-07-24) + mermaid.live all 200; no version numbers cited in prose. 101 days (< 1yr) — no review_date. |
| 2026-07-30 | vba-excel-list-references | excel | MINOR | GitHub repo cavo789/vbs_xls_list_references archived (read-only, last pushed 2021-11-01); VBS script remains functional. updates: entry added. |
| 2026-07-30 | modular-zsh-workflow | fzf | OK | No external URLs; ZSH fpath/autoload mechanism is timeless. 66 days (< 1yr) — no review_date. |
| 2026-07-30 | fzf-ripgrep | fzf | OK | github.com/BurntSushi/ripgrep + github.com/sharkdp/bat both live and active (pushed 2026-07-29); ripgrep/bat versions in checkOutput are illustrative. 52 days (< 1yr) — no review_date. |
| 2026-07-30 | markitdown | markdown | MINOR | markitdown v0.1.5 → v0.1.7 (released 2026-07-29); AlertBox version reference + Dockerfile updated; github.com/microsoft/markitdown active. updates: entry added. |
| 2026-07-30 | git-delta | git | OK | github.com/dandavison/delta active (pushed 2026-07-30, v0.19.2); version 0.18.2 in checkOutput is illustrative; lazygit + tig references alive. 45 days (< 1yr) — no review_date. |
| 2026-07-30 | docusaurus-terminal-typewriter | component | OK | MDN Intersection Observer API 200; no external dependencies; component is own implementation. 38 days (< 1yr) — no review_date. |
| 2026-07-30 | docusaurus-easter-eggs | docusaurus | OK | playwright.dev + MDN + Wikipedia links 200; Playwright framework active (not discontinued). All content about own React components, timeless. 17 days (< 1yr) — no review_date. |
| 2026-07-30 | ripgrep | zsh | OK | github.com/BurntSushi/ripgrep 200, not archived (v15.2.0 current); checkOutput shows 14.1.0 but is illustrative only — no breaking changes in v15, all commands valid. 24 days (< 1yr) — no review_date. |
| 2026-07-30 | git-worktree | git | OK | Built-in git command since v2.5; no external URLs; all commands unchanged. 31 days (< 1yr) — no review_date. |
| 2026-07-30 | docusaurus-eli5-snippet-tooltips | component | OK | console.anthropic.com 200; claude-haiku-4-5-20251001 still current (not deprecated); pricing $1/M input tokens still correct; claude-sonnet-4-6 still current. 10 days (< 1yr) — no review_date. |
| 2026-07-30 | docusaurus-reactions | component | OK | No external third-party services; own PHP + React code; avonture.be live. 3 days (< 1yr) — no review_date. |
