---
description: Autonomously turn the open article ideas into tested drafts, one at a time, with a reader review after each
argument-hint: "[max-articles] or [keyword]"
---

# Write the suggestions backlog, one article at a time

The author is away from the keyboard and wants as many articles as the quota allows. Work through
the ideas of `.todos/0000-suggestions-articles-a-publier.md`, in file order, without
asking for a selection. `$ARGUMENTS` optionally caps the number of articles (an integer) or filters
the ideas (a keyword).

This command drives `/suggestions:write`, whose steps still apply (duplicate check, skills, fact
verification, slug, deleting the idea from the backlog), with one exception: **skip its `AskUserQuestion`
selection step**.

## Before starting

Load `blog-post-structure` and `safe-install-commands`, and read the `writing_style`,
`feedback_article_weight` and `feedback_internal_linking` memories.

Read the open ideas once and spot those that need a decision only the author can make (a use case
left undefined, private source files, an article too big for one post). If the author is present,
ask them all at once, with a recommended option. Otherwise, take the recommended option and report
it at the end.

## Author's requirements for every article

1. **100% Docker-first.** The reader installs nothing. A native package may appear as an optional
   aside, never as the path of the article.
2. **A Dockerfile in the first part whenever possible.** The "what it does for me" part gives a
   throwaway image containing the tool and the sample data, so that the reader sees the benefit
   at once. Model: "Seeing It in Action with Docker" in `blog/2026/10/19/linux-yq/index.md`. When
   the tool is a service, a `compose.yaml` plays this role.
3. **The easiest example first**, then the more complete ones.
4. **Examples the audience recognizes**, the kind that makes them think "that's exactly what I
   wanted to do". Avoid toy data with no story.

## Loop, for each idea

1. **Check for duplicates**, as in `/suggestions:write`.
2. **Verify the facts**: latest versions from the release APIs, package availability, security
   advisories on the tool itself.
3. **Run everything for real before writing.** Build the sandbox, run each command the article
   shows, and copy the real output. Test the mounted-project form as well as the demo. A command
   that wasn't run must be presented as such, or removed. For a web UI, take a real screenshot with
   a Playwright container, and filter out the host's unrelated containers. Remember the DooD trap:
   `-v` paths resolve on the host, so feed test data through a named volume or stdin.
4. **Clean up what the tests started**: containers (including those left behind by `act` and
   `kind`), networks and volumes.
5. **Write** `.unpublished/<slug>/index.md` with its `files/` and `images/`, with the proof before
   the Dockerfile, and 2 to 4 inline `<Link>` to slugs that exist.
6. **Delete the idea** from the backlog, as `/suggestions:write` describes.
7. **Run `/review:reader <path>`**. If the verdict isn't `OK`, refactor the article right away so
   that it meets the requirements, re-measure, and record both results in the journal. Also check
   that every `source=` file exists, and that the image exists in `static/`.
8. **Move on to the next idea.** Give a one-line progress update between articles.

A defect found in this repository during a test (a real accessibility problem, say) becomes a TODO
through `todo-authoring`, and isn't fixed during this run.

## Finally

- Check all the new drafts: internal links, banner images, `markdownlint-cli2`, and the
  `blog-prose` grep.
- **Compile them**, since `.unpublished/` is never built. Copy each draft into
  `blog/YYYY/MM/DD/<slug>/` and remove `draft: true` from the copy only. Then run the isolated
  build (`DOCUSAURUS_GENERATED_FILES_DIR_NAME=.docusaurus-verify npx docusaurus build --locale en
  --out-dir build-verify`), and check that each page exists in `build-verify/blog/<slug>/`. Fix the
  original in `.unpublished/`, never the copy. Finally, delete the copies and the two verify
  folders, after checking with `git ls-files` that they hold no tracked file.
- A known MDX trap: in a `<Terminal>` without a template literal, `"${PWD}"` is evaluated as
  JavaScript, and the build fails with `PWD is not defined`. Write `"$PWD"` there instead.
- A new `series:` must be declared in `src/data/series.js` and `src/data/series.fr.js`.
- Commit nothing unless asked.
- Report in French: one row per article (path, verdict, what was tested), the decisions taken on
  the author's behalf, what could not be verified, and what is left to do by hand (a new banner, a
  series to declare in `src/data/series.js`, `/todos:plan` if TODOs were filed).
