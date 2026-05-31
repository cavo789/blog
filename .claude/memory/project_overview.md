---
name: project-overview
description: "Docusaurus 3.x personal blog — stack, URLs, repo, key conventions"
metadata: 
  node_type: memory
  type: project
  originSessionId: 00c5ecbb-c9bf-4541-b607-05360c5e9363
---

## Identity
- **Site:** https://www.avonture.be
- **Repo:** https://github.com/cavo789/blog
- **Local dev:** http://localhost:3000
- **Working dir:** /opt/docusaurus

## Stack
- Docusaurus 3.9.x (always keep latest stable)
- React functional components + Hooks — **no TypeScript, no class components**
- JavaScript ES6+, no inline styles, CSS Modules / Infima CSS variables
- Node ≥ 18, Yarn 1.22

## Key Commands (via makefile or yarn)
- `yarn start` — dev server
- `yarn build` — production build
- `make up` / `make build` / `make devcontainer`

## Infrastructure
- Docker-first: multi-stage Dockerfile (base → deps → dev → build → prod)
- `compose.yaml` (no version key, read-only containers where possible, tmpfs)
- VSCode DevContainers (`.devcontainer/devcontainer.json`)
- CI/CD: GitHub Actions (`.github/workflows/deploy.yml`)
- Analytics: Matomo + Cabin

**Why:** Docker-first ensures reproducible builds across machines. [[project-blog-conventions]]
