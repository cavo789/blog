/**
 * Pure BM25 lexical scoring over the build-time question index — see the plugin
 * (plugins/questions-index-plugin) for where `questions` comes from and ../../../.todos
 * (0083) for why this is plain lexical matching rather than embeddings: the semantic bridge
 * between a reader's vocabulary and an article's wording was already built once, at build
 * time, by the model that phrased each question — nothing here needs to "understand" the
 * query, only find the closest wording among the ~2500 precomputed ones.
 */

// Standard Okapi BM25 constants — term-frequency saturation and length-normalization strength.
const K1 = 1.5;
const B = 0.75;

/** Lowercase word tokens — good enough for short question strings; hyphenated terms like
 * "php-cs-fixer" split into individual words, which still matches a query typed either way.
 * CamelCase/compound product names (e.g. "CaesiumCLT") get a boundary inserted before
 * lowercasing, so a query for just "caesium" still matches the "caesium" part of the token —
 * without this, "caesiumclt" is one indivisible token that a partial name never matches.
 * The *unsplit* form is kept too (union, not replace): "WordPress" would otherwise only
 * yield "word" + "press", and a reader typing "wordpress" as one word would match neither. */
export function tokenize(text) {
  const withBoundaries = text.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  const split = withBoundaries.toLowerCase().match(/[a-z0-9]+/g) || [];
  const whole = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  return [...new Set([...split, ...whole])];
}

/**
 * Precomputes everything BM25 needs to score `questions` against future queries: per-document
 * tokens, document length, and per-term document frequency. Call once when the index loads,
 * not per keystroke — scoring itself (in `search`) is the only per-keystroke work.
 */
export function buildSearchIndex(questions) {
  const docs = questions.map((entry) => tokenize(entry.question));
  const docFrequency = new Map();

  for (const tokens of docs) {
    for (const term of new Set(tokens)) {
      docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
    }
  }

  const avgDocLength =
    docs.reduce((sum, tokens) => sum + tokens.length, 0) / (docs.length || 1);

  return { questions, docs, docFrequency, avgDocLength, docCount: docs.length };
}

function idf(docFrequency, docCount, term) {
  const n = docFrequency.get(term) || 0;
  return Math.log((docCount - n + 0.5) / (n + 0.5) + 1);
}

/** Expands one query token to the indexed terms it should match: itself, if it's already an
 * indexed term, or — for a still-being-typed prefix like "docus" — every indexed term it's a
 * prefix of (e.g. "docusaurus"). Below 3 characters a prefix matches too much of the vocabulary
 * to be useful, so short unindexed tokens are dropped instead of expanded. */
function expandTerm(docFrequency, term) {
  if (docFrequency.has(term)) return [term];
  if (term.length < 3) return [];
  const matches = [];
  for (const key of docFrequency.keys()) {
    if (key.startsWith(term)) matches.push(key);
  }
  return matches;
}

/** Scores and ranks `index` against `query`, returning the top `limit` matches with score > 0. */
export function search(index, query, limit = 8) {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const { questions, docs, docFrequency, avgDocLength, docCount } = index;
  // Expand once per query, not per document — the doc loop below only ever scores against
  // real indexed terms.
  const expandedTerms = queryTerms.flatMap((term) => expandTerm(docFrequency, term));
  if (expandedTerms.length === 0) return [];

  const scored = [];

  for (let i = 0; i < docs.length; i += 1) {
    const tokens = docs[i];
    if (tokens.length === 0) continue;

    let score = 0;
    for (const term of expandedTerms) {
      const freq = tokens.filter((t) => t === term).length;
      if (freq === 0) continue;

      const numerator = freq * (K1 + 1);
      const denominator = freq + K1 * (1 - B + (B * tokens.length) / avgDocLength);
      score += idf(docFrequency, docCount, term) * (numerator / denominator);
    }

    if (score > 0) scored.push({ entry: questions[i], score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}
