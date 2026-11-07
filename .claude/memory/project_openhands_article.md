---
name: project-openhands-article
description: "Drafts .unpublished/openhands-agents (3 Python lessons + PHP finale, Ollama via UI) and openhands-laravel-upgrade (laravel_todos → PHP 8.6); verified setup facts"
metadata:
  node_type: memory
  type: project
  originSessionId: 42b108c8-c0c8-4c76-8cd7-e74453b5a51c
  modified: 2026-11-07T10:04:05.922Z
---

Restructured 2026-11-07 at the author's request ("John Doe must understand"):
- `.unpublished/openhands-agents`: lessons on a 10-line school Python script (`projects/school/grades.py`, `/ 4` bug) — 1 fix, 2 CHANGELOG, 3 unit test (vague prompt → weak test, precise prompt → 5 unittest tests) — then the PHP invoice bug as grand finale. All outputs/screenshots real (qwen3-coder:30b, Playwright).
- `.unpublished/openhands-laravel-upgrade`: old mission 4, not run yet (needs PHP 8.6 GA 2026-11-19 + Laravel support). "Write tests" and "write a Dockerfile" missions dropped.
- Open questions live as `<!-- AUTHOR-CHECK(kind): … -->` markers, resolved by `/suggestions:review` ([[suggestions-review-markers]]).

**Why:** the author found the first version too complex; a reader only copies their codebase into `projects/` and never does anything else — no helper scripts nobody explains.

**How to apply — verified facts:**
- LLM is set **in the UI**, no script: first-run wizard → Advanced (Custom Model `ollama_chat/qwen3-coder:30b`, Base URL `http://host.docker.internal:11434`, API Key any) → All (Native Tool Calling OFF, Reasoning Effort `none`). Persisted server-side in the data volume; the wizard itself reappears per browser (Skip for now).
- Dockerfile is required: UID remap (10001 → host) + PHP. `--user` + `HOME=…` on the official image breaks the browser tool (chromium preload error) and `HOME=/tmp` floods the workspace browser with /tmp junk.
- Workspace: Open Workspace → + Add Workspace → /projects favorite → Add all subdirectories → pick → Confirm. "Add this directory" adds the CURRENT folder.
- Playwright selectors: testids `chat-input`, `submit-button`, `workspace-dropdown`, `sdk-settings-llm.<field>`.
- Ollama-local quirks seen: invented tasks in the Tasks box; duplicated CHANGELOG entry.
