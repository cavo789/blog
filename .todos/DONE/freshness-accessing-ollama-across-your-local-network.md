# Freshness: accessing-ollama-across-your-local-network

**Detected:** 2026-07-30
**Closed:** 2026-07-31
**Article:** blog/2026/05/18/accessing-ollama-across-your-local-network/index.md
**Verdict:** DONE

## Finding

Continue (the VSCode extension used throughout the "Configure your Code Editor" section) was acquired by Cursor on June 18, 2026, and the standalone product has been shut down. The July 15, 2026 user-data export deadline has passed, the `continuedev/continue` GitHub repository is now read-only, and the final release was v2.0.0. The article's core recommendation for connecting VSCode to a local Ollama instance is therefore defunct.

## Source

- https://thenewstack.io/cursor-acquires-continue-coding/ — "Cursor quietly acquires Continue, an open-source alternative to GitHub Copilot"
- https://webdeveloper.com/news/cursor-acquires-continue-open-source-agent/ — Cursor acquires Continue: acqui-hire, product shutting down

## Suggested action

Rewrite the "Configure your Code Editor (VSCode)" section to replace all Continue-specific instructions with a current alternative that supports Ollama as a backend. Candidates to evaluate: RooCode (roo-cline), Codeium, or the Cursor IDE itself. The rest of the article (Ollama server setup, network configuration, curl verification) remains fully accurate and does not need changes.

AlertBox warning already added at the top of the article on 2026-07-30.

## Done (2026-07-31)

- `description` updated (no longer mentions Continue)
- `updates:` entry added (2026-07-31)
- `<AlertBox variant="warning">` upgraded to `variant="caution"` with title "The Continue extension is shut down" and full details (acquisition date, export deadline, read-only repo)
- TLDR rewritten: removes Continue mention, describes the principle generically
- Section "Configure your Code Editor (VSCode)" completely rewritten: removed StepsCard, screenshots (continue_features.webp, continue_settings.webp), Snippet config.yaml, three Continue-specific AlertBoxes, "Using chat with Continue" subsection, "You'll have to install Continue in any of your devcontainers" subsection — replaced with a tool-agnostic explanation of the two capabilities + mention of Cline/RooCode as current alternatives + WSL note
- Conclusion rewritten to remove "Continue extension" reference, replaced with generic "VSCode extension that supports Ollama"
