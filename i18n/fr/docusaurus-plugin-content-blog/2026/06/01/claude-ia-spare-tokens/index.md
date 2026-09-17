---
slug: claude-ia-spare-tokens
title: Claude Code - Optimiser la consommation de tokens
authors: [christophe]
image: /img/v2/claude-code-tokens.webp
series: Claude Code
mainTag: ai
tags:
  - ai
description: Un guide pratique pour réduire la consommation de tokens dans Claude Code; commandes CLI, optimisation de CLAUDE.md et autre gestion du contexte.
language: fr
ai_assisted: true
date: 2026-06-01
blueskyRecordKey: 3mn7fa4zqp22w
---

![Claude Code - Optimiser la consommation de tokens](/img/v2/claude-code-tokens.webp)

<TLDR>
Les tokens sont la monnaie des conversations avec l'IA : chaque mot que vous envoyez et recevez a un coût. Cet article parcourt des techniques concrètes pour réduire la consommation de tokens dans Claude Code — des commandes slash comme `/clear` et `/compact` aux optimisations de CLAUDE.md, en passant par des règles de récupération de données plus intelligentes et des conseils d'utilisation en heures creuses.
</TLDR>

Si vous débutez avec Claude Code, vous ne savez peut-être pas encore que chaque interaction a un coût mesuré en **tokens**. Grosso modo, un token est un petit morceau de texte (environ 4 caractères ou ¾ d'un mot). Plus Claude a de contexte à traiter — votre historique de conversation, les fichiers ouverts, les sorties des outils — plus de tokens sont consommés. Sur les plans payants, cela affecte votre quota ; sur les plans gratuits, cela limite directement ce que vous pouvez faire dans une session.

Cet article rassemble des conseils pratiques pour tirer le maximum de votre budget de tokens.

<!-- truncate -->

## Réduire le contexte {#reducing-context}

<StepsCard
  variant="remember"
  title="Astuces pour économiser des tokens"
  steps={[
    {
      content: "**`/clear`** — Démarrez une nouvelle conversation quand l'historique actuel n'est plus pertinent. Plus la conversation est longue, plus chaque nouveau message coûte de tokens en entrée.",
      substeps: [
        "**`/compact`** — Quand le quota atteint ~40% et que vous voulez garder l'historique, `/compact` le résume à l'aide de l'IA. Lancez-le quand la conversation est longue et va se poursuivre sur plusieurs échanges."
      ]
    },
    {
      content: "**Committez vos changements** — Après avoir terminé une tâche, lancez `git add` + `git commit`. Claude Code relit en continu le diff pour détecter les régressions ; un `git diff` vide signifie moins de contexte consommé à chaque message."
    },
    {
      content: "**`/caveman`** ([plugin](https://github.com/JuliusBrussee/caveman)) — Force Claude à répondre le plus compactement possible, ce qui réduit les tokens en sortie. Compromis : une qualité de réponse moindre.",
      substeps: [
        "**`/caveman-compress CLAUDE.md`** — Réécrit votre CLAUDE.md dans une syntaxe ultra-compacte, en remplaçant les phrases verbeuses par des abréviations comme `SOLID` ou `SRP`, sans perdre la moindre instruction."
      ]
    },
    {
      content: "**`/context`** — Montre ce qui est chargé et combien de tokens chaque élément consomme, y compris chaque serveur MCP. Utilisez **`/.mcp`** pour activer ou désactiver les MCP."
    },
    {
      content: "**`/usage-credits`** — Ouvre claude.ai pour afficher immédiatement votre pourcentage d'utilisation actuel."
    },
    {
      content: "**Taille de `CLAUDE.md`** — Ce fichier est chargé à chaque démarrage et consomme des tokens en entrée avant que vous ayez tapé le moindre mot. Gardez-le minimal — uniquement ce qui est vraiment nécessaire."
    },
    {
      content: "**Invalidation du cache** — Changer de modèle ou ajouter un serveur MCP invalide le cache de prompt de Claude et le force à tout relire. Faites ces changements au début d'une nouvelle conversation (après `/clear`)."
    },
    {
      content: "**Fichiers et images** — Attacher un PDF, un document Word ou une image coûte nettement plus de tokens en entrée. Collez directement le texte pertinent dans le prompt quand c'est possible."
    },
    {
      content: "**`/btw`** — Ajoute une note éphémère à la conversation sans l'inclure dans l'historique complet du contexte. À noter : `/btw` empêche les agents de lancer le moindre outil sur votre codebase."
    }
  ]}
/>

### Choix du modèle {#model-choice}

Le choix du modèle a un impact direct sur la consommation de tokens — plus le modèle est capable, plus il coûte cher :

<StepsCard
  variant="remember"
  title="Coût du modèle vs cas d'usage"
  steps={[
    { content: "**Claude Opus** — Coût en tokens le plus élevé. Idéal pour le raisonnement complexe et les décisions d'architecture." },
    { content: "**Claude Sonnet** — Coût en tokens moyen. Idéal pour les tâches de développement au quotidien." },
    { content: "**Claude Haiku** — Coût en tokens le plus faible. Idéal pour la rapidité, les questions simples et les petites modifications." }
  ]}
/>

## Fichier CLAUDE.md {#claudemd-file}

Chargé à chaque démarrage — chaque octet ici coûte des tokens avant votre premier message. Écrivez en style télégraphique ; `SOLID` et `SRP` sont compris sans phrases complètes. Si une instruction n'arrête pas de grossir parce qu'elle doit expliquer le *pourquoi*, et pas seulement énoncer le *quoi*, sa place n'est peut-être pas ici du tout —
<Link to="/blog/claude-code-workflow">un article ultérieur</Link> explique comment déplacer ce genre de
règle permanente dans un skill, un agent ou un fichier de règles plutôt que de la réécrire dans `CLAUDE.md` chaque fois qu'elle
grossit.

### Règles de récupération des données {#data-fetching-rules}

Indique à Claude d'utiliser des appels ciblés à <Link to="/blog/ripgrep">`grep`</Link>/<Link to="/blog/linux-jq">`jq`</Link>/`yq` au lieu de charger des fichiers entiers.

**Restrictif** — économie de tokens maximale :

   ```markdown
   ## Data Fetching Rules

   **Fetch only what each check requires — never pull full metadata upfront.**
   ```

**Équilibré** — lecture complète pour les fichiers source courts, ciblée pour l'infra :

   ```markdown
   ## Data Fetching Rules

   **Distinguish between code and metadata:**

   - **Source Code:** Because files are strictly max 200 lines, you may read full source files to grasp the complete import/dependency context and avoid breaking SRP.
   - **Infrastructure & Logs:** Never read full logs, `.lock` files, or raw JSON/YAML metadata. You MUST use targeted shell tools (`grep`, `jq`, `yq`) for Docker configs, `compose.yaml`, JSON files or CI/CD files.
   ```

:::note
La version restrictive peut mener à des hallucinations ; la version équilibrée échange quelques tokens supplémentaires contre un contexte de fichier exact sur les fichiers source courts.
:::

### Mode de sortie {#output-mode}

Ajoute ~25 tokens en entrée au démarrage mais raccourcit chaque réponse de l'IA, ce qui cumule les économies sur les longues sessions.

**Agressif** — réponses les plus courtes, raisonnement moins visible :

   ```markdown
   ## Output mode

   **Ultra-concise.** No filler words, no repetition, no introductions, no conclusions. Density over readability. Skip pleasantries. Go straight to findings.
   ```

**Modéré** — bref, avec une justification en une ligne par changement :

   ```markdown
   ## Output mode

   **High-Density Technical.** No filler, pleasantries, or generic introductions. When proposing code changes, you MUST provide a 1-sentence technical rationale explaining your architectural choice (e.g., how it serves SOLID, DRY, or a specific PHP 8.4/Python 3.14 feature). Be a highly critical peer reviewer; flag flaws bluntly.
   ```

:::note
Le mode agressif économise plus de tokens mais masque le raisonnement de l'IA. Utilisez le mode modéré si vous voulez comprendre et apprendre de chaque suggestion.
:::

### Génération de code {#code-generation}

Empêche Claude de renvoyer des fichiers entiers — seules les lignes modifiées, avec un contexte environnant minimal.

   ```markdown
   ## Code generation

   Do not output unchanged code blocks. Only display the specific lines modified, providing minimal surrounding context. Rely strictly on tools for full file rewrites.
   ```

## Heures creuses et heures de pointe {#off-peak-and-peak-hours}

Anthropic a confirmé qu'en journée, pendant les heures de bureau, la **limite de débit de messages** est différente. Le nombre de tokens reste le même, mais pas leur pondération : vous épuiserez votre quota plus ou moins vite selon l'heure de la journée. Si votre budget est serré, travailler pendant les heures creuses (le soir ou le week-end) fera durer votre quota plus longtemps.

## Bonus {#extra}

### Si vous ne voulez pas installer caveman {#if-you-dont-want-to-install-caveman}

Créez simplement une nouvelle conversation et collez ce prompt, en remplaçant `[YOUR-CLAUDE.MD-CONTENT]` par le contenu réel de votre fichier :

<AlertBox variant="tip" title="Prompt de compression façon caveman">

```text
I want you to act as a token compressor for an LLM system prompt (in a "Caveman" style). Your goal is to drastically reduce the size of the following text while retaining 100% of the rules, technical constraints, and architectural guidelines. Compression rules: 1. Remove all connecting words, articles, polite language, and human grammar. 2. Use extreme telegraphic syntax, keywords, and standard abbreviations. 3. Group concepts by tags (e.g., [Rules], [Stack], [Lint]). 4. Do NOT omit ANY technical constraints (e.g., tool names, versions, strict limits). 5. Generate only the compressed result, with no introduction or conclusion. Here is the file to be compressed:

[YOUR-CLAUDE.MD-CONTENT]
```

</AlertBox>
