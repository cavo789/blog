# 069 — Internal linking opportunities (maillage interne)

**Priority:** Medium
**Category:** content-quality / seo

## Context

Two automatic discovery mechanisms already exist and must **not** be duplicated by this TODO:

- `RelatedPosts` (`src/components/Blog/RelatedPosts`) — auto-injected on every post, shows up to 3
  cards filtered by `mainTag` (fallback: shared `tags`).
- `Series` (`src/components/Blog/Series` + `SeriesPosts`/`SeriesCards`) — auto-injected on every
  post that has a `series:` frontmatter value, listing sibling articles in that series.

So posts that already share the same `mainTag`, or already belong to the same `series`, get a
"related content" box for free. This TODO only lists pairs/clusters that fall **outside** both
safety nets — different `mainTag`, no `series` field — plus a couple of strong narrative
("part 1 → part 2") sequences worth an explicit in-body mention even though the automation
technically covers them.

A full-corpus grep (`grep -rl '](/blog/' blog/`) shows that, as of today, only **12 of 238** posts
contain any manual in-body link to another post. Everything below is a genuine gap, not a
duplicate of existing links.

Check a box once the link has been added (and reads naturally in context — don't force it).

## Proposed solution — check off as each link is added

### FZF / fuzzy-finder toolkit (mainTags: linux, linux, fzf, fzf, zsh — not auto-related)

- [x] `linux-fzf-introduction` → link forward to `fzf-ripgrep` and/or `ssh-with-fuzzy-finder` as
      "here's fzf applied to X" follow-ups
- [x] `ssh-with-fuzzy-finder` → link back to `linux-fzf-introduction` (prerequisite) and to
      `modular-zsh-workflow` (where the function lives)
- [x] `modular-zsh-workflow` → link to `linux-fzf-introduction` and `zsh-docker-functions`
- [x] `zsh-docker-functions` → link to `linux-fzf-introduction` (fzf container picker) and
      `modular-zsh-workflow` (where these functions are organized)

### ZSH shell customization stack (mixed mainTags: zsh/ssh/fzf/git — not auto-related)

- [x] `zsh-install` → link forward to `zsh-plugin-autosuggestions`, `zsh-syntax-highlighting` as
      "next, add these plugins"
- [x] `zsh-plugin-autosuggestions` / `zsh-syntax-highlighting` → link back to `zsh-install`
      (prerequisite)
- [x] `powerlevel10k_sandbox` → link to `zsh-install` (prerequisite: Oh-My-Zsh first)
- [x] `zsh-plugin-ssh-config-suggestions` → link to `zsh-install` and `modular-zsh-workflow`
- [x] `modular-zsh-workflow` → link to `zsh-install` as the starting point of the stack
- [x] `git-branches-gst` → link to `modular-zsh-workflow` (same organizational pattern, ZSH hook)

### "Play with Docker and X" language playground mini-series (mainTags: python/docker/php — not auto-related)

- [x] `docker-python` → link to `docker-definition-like-im-five` (ELI5 intro) and sibling
      `docker-pascal` / `docker-assembly` / `docker-java`
- [x] `docker-pascal` → link to `docker-python`, `docker-assembly`, `docker-java` as "same idea,
      different language"
- [x] `docker-assembly` → same cross-links as above
- [x] `docker-java` → same cross-links as above
- [x] `install-docker` (PHP) → link to `docker-definition-like-im-five` and the language-playground
      posts as "same approach for other languages"

### Markdown conversion companion posts (mainTags: excel vs markdown — not auto-related, same day)

- [x] `markdown-xls2md` → link to `markdown-csv2md` ("need CSV instead of Excel? see...")
- [x] `markdown-csv2md` → link to `markdown-xls2md` (reverse)

### Ollama / local AI setup path (same mainTag but strong part-1→part-2 narrative)

- [x] `accessing-ollama-across-your-local-network` → link back to `ollama-installation`
      (prerequisite: install Ollama first)

### AI-assisted-content meta-thread (mixed mainTags ai/component, only 2 of 4 share a series)

- [x] `gemini-meerkat` → link to `docusaurus-ai-gemini` (how AI-assisted posts are flagged) and/or
      `gemini-tldr`
- [x] `lovable-dev-ai` → link to `docusaurus-ai-gemini` (same "AI on this blog" thread)
- [x] `docusaurus-ai-gemini` → link forward to `gemini-meerkat` and `lovable-dev-ai` as other
      examples of AI tooling used on the blog

### PHP code-quality toolbox (mainTag `php` vs series hub mainTag `code-quality` — not auto-related)

- [x] `php-rector` → link to `php-jakzal-phpqa` and/or `online-php-linter` (the "code quality"
      series hub)
- [x] `vscode-php-refactoring` → link to `php-jakzal-phpqa` / `online-php-linter`
- [x] `php-obfuscator` → link to `php-jakzal-phpqa` (same PHP code-quality toolbox theme)

### JSON tooling (mainTags doc-as-code vs linux — not auto-related)

- [x] `json-crack` → link to `json-faker` and/or `json-lint` as companion JSON tools
- [x] `json-faker` → link to `json-crack` / `json-lint`
- [x] `json-lint` → link to `json-crack` / `json-faker`

### Spam-fighting narrative trilogy (same mainTag, but an explicit numbered story worth sequencing)

- [x] `cpanel-spam` → link forward to `planethoster-n0c-spam` ("next in this fight...")
- [x] `planethoster-n0c-spam` → link back to `cpanel-spam` and forward to
      `planethoster-n0c-spam-roundcube-action`
- [x] `planethoster-n0c-spam-roundcube-action` → link back to `planethoster-n0c-spam`

### VBA calling external APIs (mainTag excel vs api — not auto-related)

- [x] `vba-excel-call-soap-webservice` → link to `php-api-tips` ("API REST - How to write good
      APIs") for general API design context

## Relationship to existing TODOs

None. Complements the already-closed link-hygiene passes (`DONE_064` fixed _broken_ links; this
one adds _missing_ ones) and is independent of `068` (native Docusaurus features).
