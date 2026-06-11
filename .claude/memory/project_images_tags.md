---
name: project-images-tags
description: All available banner images (/img/v2/*.webp) and all 175 defined tag slugs
metadata: 
  node_type: memory
  type: project
  originSessionId: 771ca3a9-f666-4860-bab3-6091afb7179a
---

## Banner Images

All social card images live in `/opt/docusaurus/static/img/v2/` as `.webp` files.
Use in frontmatter as `image: /img/v2/<slug>.webp`.

Available slugs (119 images):
```
adding_ssh_profile_to_windows_terminal, ai, api, ascii_art, ascii_art_html,
autopsy_binary_crime, bash, belgif, changelog, check_images,
claude-code-tokens, clean_code, csv, customization_prompt, dagger,
database_admin, db_diagrams, devcontainer, devcontainer_quarto, diagrams,
docker-python-mermaid, docker_concepts, docker_gui, docker_init,
docker_playing_with_app, docker_secrets, docker_tips,
docker_workflow_prod_devcontainer, docusaurus_bluesky, docusaurus_component,
docusaurus_docker, docusaurus_react, docusaurus_rss_enhanced, docusaurus_tips,
docusaurus_using_docker, encryption, etl, excel, experiments,
fighting_against_spam, frankenphp, functional_tests, gemini, gemini-co-author,
gemini_tldr, git, git_branches_status, github_profile_automate, github_tips,
gitlab, go_top_banner, happy_new_year, htaccess, image_optimization, joomla,
json, keepass, laravel, limesurvey, linux_parallel, linux_progress_bar,
linux_tips, lovable_dev, makefile, markdown, matomo, mindmaps, minification,
msaccess, msdos_tips, mssql, mustache, obfuscated_code, old_blog_notice,
ollama_docusaurus_tags, oracle, outlook_vba, pandas, php_tips, planethoster,
planethoster-using-ssh, playing_with_ollama, postgresql, postgrest,
project_setup, putty, python, python-ai-helper, quarto,
quarto-industrialisation, quarto_reveal_docker, rector, repo_with_fzf,
ribbon, secrets, sftp, site_creation, sql_format, ssh, sshf, tags_manager,
unit_tests, using_ollama_local_network, vba_export_xlsm, vbs, viruses,
vscode_ssh_dev, vscode_tips, welcome, windows_terminal_customization,
windows_terminal_splitted_panes, windows_terminal_tips, windows_tips, winscp,
wordpress, workflows, wsl, zorin_os, zsh
```

When picking an image for a new post, choose the closest semantic match. If nothing fits, flag it — the user may need to create a new one.

## All Tags (from `blog/tags.yml` — count may evolve, always verify against the file)

All tags used in frontmatter `tags:` must exist here. `onInlineTags: "throw"` makes unrecognized tags break the build.

```
.env, .htaccess, actions, addon, adminer, aesecure, ai, apache, api,
assembly, autoflake, bash, bdd, behat, black, bluesky, bookmark, bruno,
captainhook, chrome, ci, code-quality, component, composer, console, cpanel,
csv, customization, cypress, dagger, dashboard, database, devcontainer,
doc-as-code, docker, docusaurus, docx, dood, dos, encryption, etl, excel,
fastapi, firefox, frankenphp, ftp, fzf, gimp, git, github, gitlab, grumphp,
gui, hooks, https, husky, iconify, images, intelephense, introspection, isort,
java, javascript, joomla, jq, json, keepass, laravel, limesurvey, linux,
makefile, markdown, matomo, mermaid, mindmap, mink, monitoring, msaccess,
mssql-server, mustache, mypy, mysql, n0c, network, nginx, nodejs, note-taking,
npm, ollama, openapi, optimization, oracle, outlook, pandas, pandoc, pascal,
pest, phan, php, php-cs-fixer, php-grep, phpcbf, phpcs, phpdoc, phplint,
phpmyadmin, phpstan, phpunit, pipeline, planethoster, plugin, postgresql,
postgrest, postman, powerpoint, powershell, pre-commit, prospector, putty,
pydocstyle, pylint, pyright, python, quarto, rdp, react, recraft, rectorphp,
refactoring, rest, revealjs, ribbon, roundcube, ruff, scp, secrets, sed,
self-hosted, series, sftp, shell, shellcheck, shellformat, snippets, soap,
sonarlint, spamassassin, sql, ssh, sshpass, ssl, ssms, swagger, swizzle,
synology, telescope, tests, tips, tool, ubuntu, vba, vbs, visualisation,
vscode, vulture, wamp, windows, windows-terminal, winget, winscp, wordpress,
workflow, wsl, xml, xmlstarlet, yarn, zsh
```

**Why:** Build fails if any tag in a post's frontmatter is not declared in `tags.yml`. Always pick from this list.
