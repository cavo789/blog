---
description: Review a batch of articles for technical staleness (dead links, tool renames, acquisitions, deprecated options). Tracks progress in .todos/freshness-journal.md so each session continues where the last one stopped.
argument-hint: "[batch-size (default 10)]"
allowed-tools: Read, Glob, Grep, Bash, Edit, Write, WebSearch, WebFetch
---

# Article Freshness Review

Scan a batch of articles for technical obsolescence — dead links, deprecated tools, renamed/acquired
projects, changed licences — without touching the whole corpus at once.

## 0. Parse arguments

Read `$ARGUMENTS`.

- If empty → `BATCH_SIZE = 10`
- If a single integer → `BATCH_SIZE = that number`
- Otherwise → stop and print: `Usage: /freshness [batch-size]  Example: /freshness 5`

**Hard cap:** if `BATCH_SIZE > 10`, stop immediately and print:

```text
Error: batch size {BATCH_SIZE} exceeds the maximum of 10.

Each article requires web searches whose results accumulate in the context window.
Beyond 10 articles, input-token costs grow faster than the per-session overhead saved.

Run: /freshness 10   (or omit the argument — 10 is the default)
Then: /clear
Then: /freshness 10  (for the next batch — the journal remembers your progress)
```

## 1. Load the journal

Read `.todos/freshness-journal.md` (create it if absent — see format below).

The journal records every article already reviewed: its slug and the date of review.

Build a **reviewed set** from it: `{ slug → review-date }`.

## 2. Select the batch

Read the blog map at
`/home/node/.claude/projects/-opt-docusaurus/memory/project_blog_map.md`
to get the full list of published articles with their `date` and `mainTag`.

**Volatility score per mainTag** (higher = changes faster, review first):

| Score | mainTags |
| ----- | -------- |
| 10 | `ai` |
| 9 | `self-hosted` |
| 8 | `vscode` |
| 7 | `docker` |
| 6 | `docusaurus` |
| 5 | `linux`, `bash`, `api` |
| 4 | `php`, `python`, `github`, `gitlab`, `zsh`, `fzf` |
| 3 | `ssh`, `ssl`, `wsl`, `windows`, `windows-terminal`, `quarto`, `code-quality`, `laravel`, `joomla`, `tests` |
| 2 | `winscp`, `markdown`, `makefile` |
| 1 | `vba`, `excel`, `msaccess`, `oracle`, `database` |
| 3 | *(any unlisted tag)* |

**Priority formula** for each article not in the reviewed set (or reviewed more than 52 weeks ago):

```text
days_unreviewed = today − max(review-date, publish-date)
priority = days_unreviewed × volatility_score
```

Sort descending by priority. Take the top `BATCH_SIZE` articles.

**Tell the user upfront:** list the selected articles (slug, mainTag, days unreviewed) before
starting any checks.

## 3. For each article — mechanical pass

Find the article file:

```bash
find blog -path "*/<slug>/index.md" -o -path "*/<slug>/index.mdx" | head -1
```

Read the file. Extract:

- **External URLs** — all `http(s)://` links in prose and frontmatter (skip `localhost`,
  `yourdomain`, `example.com`).
- **GitHub repos** — `github.com/<owner>/<repo>` patterns.
- **Docker images** — `docker pull <image>` or `image: <name>` patterns.
- **Version numbers** — explicit `vX.Y.Z` cited as "current" or "latest".

**Check external URLs** (limit to first 15 per article to avoid rate limiting):

```bash
curl -s -o /dev/null -w "%{http_code}" --max-time 10 -L "<url>"
```

Flag: `4xx` (not 429), `000` (timeout/DNS). A `404` alone is not proof — note it as "suspected
dead" and let the semantic pass confirm. Do not flag `429`, `503` (transient). Skip URLs that
return anti-bot pages (status 403 on known CDNs).

**Check GitHub repos** status:

```bash
curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://github.com/<owner>/<repo>"
```

Also check for the "archived" banner via a quick scrape if the repo returns 200:

```bash
curl -s --max-time 10 "https://github.com/<owner>/<repo>" | grep -i "archived" | head -3
```

## 4. For each article — semantic pass

Identify the **main tool or subject** of the article (usually the product named in the title or the
first paragraph).

Run a targeted web search:

```text
"<tool-name>" (acquired OR renamed OR discontinued OR deprecated OR "end of life" OR alternative) 2025 OR 2026
```

If the mechanical pass flagged a dead project URL, narrow the search to confirm.

**Rules for the semantic pass:**

- Never assert an acquisition or rename without a URL from a reputable source (official blog,
  TechCrunch, GitHub announcement, vendor press release).
- Keep the source URL for every finding — it will go into the journal and/or the article update.
- If the search is inconclusive, record "no change found" — that is also a valid outcome.

## 5. Triage each article

After both passes, apply **exactly one** verdict:

| Verdict | Condition | Action |
| ------- | --------- | ------ |
| `OK` | Nothing suspicious found | Add `review_date` to frontmatter if article is over a year old; update journal |
| `MINOR` | Small factual error, version bump, dead link with working replacement | Edit the article + add `updates:` entry in frontmatter |
| `STALE` | Major change (acquisition, rename, discontinued) but article still salvageable | Create `.todos/freshness-<slug>.md` with source URLs; do NOT edit the article yet |
| `CRITICAL` | Article is actively misleading (wrong company, wrong licence, recommends abandoned tool) | Add `<AlertBox variant="warning">` at the top of the article; create a TODO for the rewrite |

### For `OK` — articles over a year old

If the article's effective date (publication date, or most recent `updates:` entry date) is more
than one year ago, add `review_date` to the frontmatter after the `language:` line:

```yaml
review_date: YYYY-MM-DD
```

This replaces the yellow "may be outdated" banner with a green "reviewed on [date]" notice for
readers. Do not add `review_date` if the article already has a recent `updates:` entry (the
`OldPostNotice` component will not show at all for those). Do not touch any prose.

### For `MINOR` corrections

Edit the article file. Then add or extend the `updates:` block in frontmatter:

```yaml
updates:
  - date: 2026-07-30
    note: "Updated version number from X to Y / Fixed dead link / <short factual note>"
```

Keep the note to one sentence. Do not rewrite prose that is still accurate.

### For `STALE` — TODO format

Create `.todos/freshness-<slug>.md`:

```markdown
# Freshness: <slug>

**Detected:** 2026-07-30
**Article:** blog/YYYY/MM/DD/<slug>/index.md
**Verdict:** STALE

## Finding

<One paragraph: what changed, why it matters for the article>

## Source

- <URL> — <one-line description>

## Suggested action

<Rewrite section X / Add a warning box / Depublish / Add a note about the acquisition>
```

### For `CRITICAL` — AlertBox

Insert at the very top of the article body (after frontmatter, before any prose):

```mdx
<AlertBox variant="warning">
  **Update (2026-07-30):** <One sentence stating what changed and why the reader should know.>
  [Source](<url>)
</AlertBox>
```

Then create a TODO as for `STALE`.

## 6. Cross-link opportunity (bonus, low cost)

While the article file is open, check whether it has fewer than 2 internal `<Link>` tags. If so,
note "link-starved" in the journal — this is the right moment to also run `/links` on it (but do
not do it now unless the user explicitly asks; just flag it).

## 7. Update the journal

Append rows to `.todos/freshness-journal.md` for every article processed (including `OK` ones —
that is the point: we must not re-scan them next time).

Journal row format:

```text
| YYYY-MM-DD | <slug> | <mainTag> | <verdict> | <one-line note or "—"> |
```

## 8. Session report

After all articles are processed, print a summary table:

| Slug | mainTag | Days old | Verdict | Notes |
| ---- | ------- | -------- | ------- | ----- |
| ... | ... | ... | OK / MINOR / STALE / CRITICAL | ... |

Then: "Journal updated. Next `/freshness` will start from the next batch."

If any `STALE` or `CRITICAL` verdicts were issued, list the TODO files created.

Finally, always print this block verbatim:

```text
---
Token hygiene: web-search results from this batch are now in the context window.
Run /clear before the next batch to reset the context and keep costs low.
The journal has saved your progress — /freshness will resume from where it stopped.
---
```

---

## Journal file format (create if absent)

`.todos/freshness-journal.md`:

```markdown
# Freshness Journal

Tracks articles already reviewed so that each `/freshness` session continues where the last one
left off. Do not edit manually — maintained by the `/freshness` skill.

| Reviewed | Slug | mainTag | Verdict | Notes |
| -------- | ---- | ------- | ------- | ----- |
```
