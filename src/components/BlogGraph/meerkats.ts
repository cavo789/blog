/**
 * Which meerkat sticker a node wears on `/map`.
 *
 * The bubbles used to be flat colored dots with a handful of illustrated exceptions. They are
 * now stickers from `static/img/meerkat/emojis/` — 68 square, face-centered portraits, which is
 * what makes them work here: the previous images were full-body poses, so clipping them to a
 * ~20px circle cut the meerkat in half. These are centered by construction (measured: content
 * box 0.084 → 0.916 on both axes, dead center on all 68), so a plain "cover" draw lands the
 * face in the middle with no per-image tuning.
 *
 * One sticker per **mainTag**, not per article: 22 Docker posts wearing the same sticker is the
 * point — a family reads at a glance, exactly like the node colors it replaces. Tags with no
 * obvious match fall back to a deterministic pick from whatever the explicit map left unused,
 * so every node gets a meerkat and the same tag always gets the same one.
 */

/** Where the stickers are served from — a site-absolute path; see `meerkatPathFor` on the prefix. */
const STICKER_DIR = "/img/meerkat/emojis";

// The sticker *names*, read off the folder at build time so adding or renaming a file needs no
// edit here — but deliberately NOT the modules themselves, hence the "weak" mode: these webp are
// small enough for webpack to inline, and a plain context turned /map's chunk into 502 KB of
// base64 (all 68 stickers, on a page that draws ~20). The files ship in `static/` already, one
// copy per locale, so the browser fetches the handful it needs from there and caches them.
const STICKERS = require.context(
  "../../../static/img/meerkat/emojis",
  false,
  /\.webp$/,
  "weak",
);

/**
 * Every sticker's base name (no extension), alphabetically. Exported because it is the folder's
 * contents read at build time, and a second component would otherwise hand-maintain the same
 * list — see `.todos/0128` (a `<Meerkat name="…" />` for MDX authors).
 */
export const MEERKAT_NAMES: string[] = STICKERS.keys()
  .sort()
  .map((key) => key.replace(/^\.\//, "").replace(/\.webp$/, ""));

/** Same names, for the "does this sticker still exist?" check `meerkatPathFor` does. */
const KNOWN = new Set(MEERKAT_NAMES);

/**
 * mainTag → sticker, for the tags where one sticker is obviously *the* one. Only names that
 * exist in the folder count: a renamed or deleted file silently drops its tag to the fallback
 * pool rather than breaking the map.
 */
export const MEERKAT_BY_MAIN_TAG: Record<string, string> = {
  // Tooling & platforms
  docker: "tech_deploy_to_production",
  linux: "job_engineer",
  "self-hosted": "job_astronaut",
  devcontainer: "job_chef_2",
  makefile: "job_chef_1", // a Makefile is a book of recipes
  vscode: "tech_debug",
  fzf: "activity_searching",

  // Languages & frameworks
  php: "tech_php",
  python: "job_scientist",
  bash: "job_hacker",
  zsh: "job_wizard",
  laravel: "job_firefighter",
  excel: "job_businessman",
  ai: "tech_ai_brain",

  // Writing & publishing
  docusaurus: "job_architect",
  component: "job_handyman",
  markdown: "activity_reading",
  "doc-as-code": "activity_podcasting",
  quarto: "activity_graduation",
  joomla: "emotion_affectionate", // the CMS this blog's author spent years on

  // Version control & collaboration
  git: "gesture_victory",
  github: "gesture_thumbs_up",
  gitlab: "gesture_fist",
  api: "gesture_pointing",
  bluesky: "gesture_waving",

  // Remote access & security
  ssh: "gesture_salute",
  winscp: "gesture_handshake",
  security: "job_cybersecurity_analyst",
  ssl: "job_police_officer",

  // Quality
  "code-quality": "tech_approved_check",
  tests: "tech_build_success",
};

// Everything the explicit map didn't claim — the pool the remaining tags draw from. Derived,
// never hand-listed: adding a tag above removes its sticker from the pool on its own.
const CLAIMED = new Set(Object.values(MEERKAT_BY_MAIN_TAG));
const FALLBACK_POOL = MEERKAT_NAMES.filter((name) => !CLAIMED.has(name));

/** FNV-1a — any stable string hash would do; this one is short and has no dependencies. */
function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

/**
 * The sticker for one node as a site-absolute path, or `null` if the folder is empty — in which
 * case the caller just draws the flat colored dot it always drew. The caller runs it through
 * `withBaseUrl`, without which the path carries no locale prefix and `/fr/map/` asks for a file
 * that only exists under `/fr/` (the exact trap documented in src/pages/map.mdx).
 *
 * Keyed on the mainTag so every article of a tag shares a sticker; a post with no mainTag at
 * all falls back to its own permalink, which at least keeps it stable across renders.
 */
export function meerkatPathFor(node: {
  mainTag: string | null;
  permalink: string;
}): string | null {
  const explicit = node.mainTag ? MEERKAT_BY_MAIN_TAG[node.mainTag] : undefined;
  if (explicit && KNOWN.has(explicit)) {
    return `${STICKER_DIR}/${explicit}.webp`;
  }

  if (FALLBACK_POOL.length === 0) {
    return null;
  }

  const key = node.mainTag ?? node.permalink;
  return `${STICKER_DIR}/${FALLBACK_POOL[hash(key) % FALLBACK_POOL.length]}.webp`;
}
