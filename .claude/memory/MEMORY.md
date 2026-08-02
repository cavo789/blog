# Memory Index

- [User Profile](user_profile.md) — Christophe Avonture, technical blogger, Docker/WSL/Markdown, cavo789
- [Project Overview](project_overview.md) — Docusaurus 3.x blog, stack, URLs, commands, Docker-first infra
- [Blog Conventions](project_blog_conventions.md) — Post structure, all frontmatter fields, co-location, authors, series, .unpublished (draft:true)
- [Writing Style](writing_style.md) — Openings, recurring phrases, TLDR, section titles, AlertBox, Conclusion, transitions
- [Components & Plugins](project_components.md) — All MDX components with props, AlertBox variants, Terminal/Snippet/StepsCard usage, plugins
- [Images & Tags](project_images_tags.md) — All banner images (/img/v2/, 131 as of 2026-07-27) and all valid tag slugs (tags.yml)
- [Coding Style](feedback_coding_style.md) — React/CSS/Docker rules from AGENTS.md, American English everywhere
- [Blog Map](project_blog_map.md) — Catalogue exhaustif des 245 posts + 16 drafts : slug, titre, date, mainTag, tags, séries — source de vérité
- [Blog Coverage Map](project_blog_coverage.md) — Gaps et opportunités par tech (WSL2/ZSH/Git/Docker/FZF/SSH/Bash/Ollama)
- [Article Proposals](project_article_proposals.md) — Pending article ideas across all series, incl. "Ollama daily-use functions"
- [Post Creation Feedback](feedback_post_creation.md) — draft:true for .unpublished, image selection, frontmatter ordering
- [Article Weight](feedback_article_weight.md) — pas d'empilement de post-mortems ni de setup non-standard ; un article doit donner envie de tester
- [YAML Date Parsing](feedback_yaml_date_parsing.md) — frontmatter dates arrive as ISO strings after SSR; always use new Date(value), never concatenate
- [TODO Folder Convention](project_todos_convention.md) — .todos/ est privé : écrire en français, format NNN-slug.md, sections Problème/Risque/Solution
- [TODO Triage Feedback](feedback_todo_triage.md) — rejects reader-engagement TODOs (polls/Q&A/share/bookmarks/counters) as WONT_DO, low traffic
- [Unpublished Plan Maintenance](feedback_unpublished_plan.md) — always keep .unpublished/plan.md in sync with drafts, written in French, never published
- [Internal Linking Rule (new posts)](feedback_internal_linking.md) — tout nouveau post embarque 2-4 `<Link>` inline + lien réciproque ; jamais d'orphelin
- [Internal Links Audit](project_internal_links.md) — run `internal-link-opportunities.mjs --stats`; verified baseline + the 4 traps that break naive greps
