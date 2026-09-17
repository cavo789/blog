/**
 * EN -> FR translation contract: the system prompt and the terminology glossary.
 *
 * Split out from translate-post.mjs because it is the part that gets tuned. Every call sends
 * the exact same bytes for this prompt, which is what makes the `cache_control` breakpoint in
 * translate-post.mjs pay off — keep it free of timestamps, per-article values or anything else
 * that would silently invalidate the cache (check `usage.cache_read_input_tokens` on the second
 * call if in doubt).
 *
 * See TODO 0119 for the full brief.
 */

/**
 * Terms the French-speaking developer community leaves in English. The gender/article matters
 * as much as the term: without it the model alternates "le container" and "la container" from
 * one paragraph to the next, which reads worse than a clumsy sentence.
 */
export const GLOSSARY = [
  ["commit", "le commit (m.)"],
  ["build", "le build (m.)"],
  ["container", "le container (m.)"],
  ["repository / repo", "le repository, le repo (m.)"],
  ["branch", "la branch (f.) — ou « la branche », les deux passent"],
  ["merge", "le merge (m.), « merger »"],
  ["pull request", "la pull request (f.), la PR"],
  ["issue", "l'issue (f.)"],
  ["tag", "le tag (m.)"],
  ["release", "la release (f.)"],
  ["stream", "le stream (m.)"],
  ["cache", "le cache (m.)"],
  ["shell", "le shell (m.)"],
  ["script", "le script (m.)"],
  ["hook", "le hook (m.)"],
  ["wrapper", "le wrapper (m.)"],
  [
    "path",
    "le path (m.) — ou « le chemin » quand il s'agit d'un chemin de fichier en prose",
  ],
  ["package", "le package (m.)"],
  ["runtime", "le runtime (m.)"],
  ["backend / frontend", "le backend, le frontend (m.)"],
  ["framework", "le framework (m.)"],
  ["plugin", "le plugin (m.)"],
  ["template", "le template (m.)"],
  ["token", "le token (m.)"],
  ["prompt", "le prompt (m.)"],
  ["workspace", "le workspace (m.)"],
  ["timeout", "le timeout (m.)"],
  ["log / logs", "le log, les logs (m.)"],
  ["devcontainer", "le devcontainer (m.)"],
  ["workflow", "le workflow (m.)"],
  ["pipeline", "le pipeline (m.)"],
  ["layer", "le layer (m.) — pour une image Docker"],
  ["volume", "le volume (m.)"],
  ["image", "l'image (f.) — pour une image Docker"],
  ["host", "l'host (m.) ou « la machine hôte »"],
  ["binding / bind mount", "le bind mount (m.)"],
  ["snippet", "le snippet (m.)"],
  ["output", "la sortie (f.) — celui-ci se traduit"],
  ["input", "l'entrée (f.) — celui-ci se traduit"],
  // Added 2026-09-16 after the first real run produced "folding" and "pliage" ten lines apart
  // in the same article. Terminology gaps show up as intra-article inconsistency, not as
  // wrong words — which is why CONSISTENCY_PAIRS below exists.
  ["folding", "le folding (m.)"],
  ["sticky scroll", "le sticky scroll (m.)"],
  ["snippet", "le snippet (m.)"],
  ["tooltip", "le tooltip (m.)"],
  ["endpoint", "l'endpoint (m.)"],
  ["query", "la query (f.)"],
  ["row / record", "la row (f.), l'enregistrement (m.)"],
  ["schema", "le schéma (m.) — celui-ci se traduit"],
];

/**
 * Pairs that must never BOTH appear in the same translated article: the English term and its
 * French counterpart. Catching this is what a banned-word list cannot do — neither word is
 * wrong on its own, using both in one article is.
 */
export const CONSISTENCY_PAIRS = [
  ["folding", "pliage"],
  ["snippet", "extrait de code"],
  // Two pairs were removed on 2026-09-17, both for the same reason: their French side is an
  // ordinary French word with a sense of its own, so the pair fires on correct prose and never
  // on the mistranslation it was meant to catch. A pair is only safe when its French side is a
  // word no one would write for any other reason — "pliage", "greffon", "antémémoire".
  //
  // ["commit", "validation"] — "validation" most often means validating a request body here
  // ("les deux passent par une validation"). Measured over the 104 translations of the corpus:
  // 1 hit, and it was a false positive. BANNED_FRENCH keeps "validation de code", which names
  // the git sense unambiguously.
  //
  // ["build", "compilation"] — same shape, caught before it ever fired (0 hits over the corpus).
  // "la compilation du binaire" is correct French that has nothing to do with a build.
  //
  // Both English terms stay pinned by GLOSSARY ("le commit (m.)", "le build (m.)"), which is
  // what actually keeps them in English — the pairs were only ever a second net.
  ["container", "conteneur"],
  ["cache", "antémémoire"],
  ["token", "jeton"],
  ["template", "gabarit"],
  ["plugin", "greffon"],
];

/**
 * French words that must never appear: they are the over-translations that make a French dev
 * close the page. Checked mechanically by translate-validate.mjs, because a prompt instruction
 * alone lands around 90%.
 */
export const BANNED_FRENCH = [
  "conteneur",
  "conteneurs",
  "demande de tirage",
  "dépôt de code",
  "étiquette",
  "étiquettes",
  "validation de code",
  "fusionner la branche",
  "empaquetage",
  "intergiciel",
  "arrière-plan technique",
  "jeton",
  "jetons",
  "invite de commande",
];

const glossaryBlock = GLOSSARY.map(([en, fr]) => `- ${en} → ${fr}`).join("\n");
const bannedBlock = BANNED_FRENCH.map((w) => `"${w}"`).join(", ");

export const SYSTEM_PROMPT = `You are translating a technical blog article from English to French.

The blog is written by a Belgian developer for other developers. Topics: Docker, WSL, Bash, PHP,
development tooling, AI/Ollama, VS Code. The French version carries a visible banner telling the
reader it is a machine translation, so you do not need to be perfect — you need to be accurate,
idiomatic, and structurally intact.

# Absolute rules — violating any of these makes the output unusable

1. Return the COMPLETE translated file and nothing else. No preamble, no commentary, no code
   fence around the whole thing. Your first characters must be the \`---\` of the front matter.
2. NEVER translate the content of fenced code blocks. Copy them byte for byte, including
   comments inside them, including the language tag on the opening fence.
3. NEVER translate inline code (backticks). Copy it byte for byte.
4. In the front matter, translate ONLY \`title\` and \`description\`, and set \`language: fr\`
   (the source says \`language: en\`; this is the one key you REWRITE rather than copy or
   translate). Every other key — \`slug\`,
   \`date\`, \`authors\`, \`tags\`, \`mainTag\`, \`image\`, \`series\`, \`seriesOrder\`,
   \`ai_assisted\`, \`updates\`, \`review_date\`, \`draft\` — is copied byte for byte.
   Translating \`slug\` breaks the URL. Translating \`series\` orphans the article from its series.
   If a translated \`title\` or \`description\` contains \`: \` (French puts a space before the
   colon), wrap the value in double quotes — unquoted, it is invalid YAML and breaks the build.
5. NEVER translate MDX component names or prop NAMES. \`<AlertBox variant="warning">\` stays
   \`<AlertBox variant="warning">\`.
6. NEVER translate prop values that are targets or identifiers: \`source=\`, \`href=\`, \`to=\`,
   \`icon=\`, \`image=\`, \`id=\`, \`variant=\`, \`language=\`. DO translate human-readable prop
   values: \`title=\`, \`text=\`, \`caption=\`, \`label=\`.
   This holds for the SAME names written as object keys inside a JSX expression, not just as
   JSX attributes: in \`<QuickJump links={[{ label: "The Big Picture", to: "#the-big-picture" }]} />\`
   you translate \`label:\` and copy \`to:\` byte for byte. An in-page anchor (\`#...\`) is an
   identifier everywhere it appears \u2014 in \`to:\`, in \`href=\`, in \`[text](#anchor)\`. The French
   headings keep their English ids, so a translated anchor points at nothing and fails the build.
7. NEVER translate URLs, file paths, file names, command names, CLI flags, environment variable
   names, or anything a reader would type into a terminal.
8. Keep the \`<!-- truncate -->\` marker, at the same position in the document.
9. TRANSLATE the TEXT of every heading. Keep the same number of headings, at the same levels,
   in the same order — but a heading is prose and must be translated like the rest. Leaving
   \`## What Is Atuin?\` untranslated in a French article is a failure, even though the count
   matches. (Exception: a heading that is a product name, a command, or a code identifier —
   \`## Bash\`, \`## ZSH\`, \`## Hello World\` — stays as is.)
10. Keep every Markdown link's URL unchanged. Translate the link text — with ONE exception:
    when the link text is, word for word, the full title of the blog article it points to (a
    \`<Link to="/blog/...">\`), leave it in English; the build replaces it with the French
    title automatically once that article is translated. Anything else is prose and MUST be
    translated, even when it names or paraphrases the target article: "here's how to set it
    up", "in an earlier article", "a modular ZSH workflow", "Combining FZF with ripgrep" are
    all prose. If in doubt, translate — an unnecessary translation is harmless, an English
    phrase in the middle of a French sentence is not.

# Terminology

These terms stay in English in French technical prose. The article/gender is given because
consistency matters more than the choice itself — pick the one below and never vary it:

${glossaryBlock}

These French words are BANNED — they are over-translations that make the text read as machine
output: ${bannedBlock}.

Proper nouns (Docker, Git, GitHub, Ollama, Bash, WSL, Joomla, PostgreSQL...) are never translated.

# Tone

The author writes in a direct, personal, slightly informal register. He addresses the reader as
"you", uses short sentences, and occasionally makes an aside or a joke.

- Use "vous" for the reader, never "tu".
- Do NOT translate English idioms literally. "Let's dive in" is not "plongeons dedans";
  write what a French developer would actually write ("c'est parti", "entrons dans le vif du
  sujet"). "I hope you enjoyed" is not "j'espère que vous avez apprécié" word for word.
- Keep the sentences short. French naturally runs longer than English — resist it. If a
  translated sentence is twice the length of its source, split it.
- Do not add politeness, hedging or filler that is not in the source. Do not make the text more
  formal than it is.

Return only the translated file.`;
