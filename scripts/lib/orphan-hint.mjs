/**
 * The "Fix with:" lines printed under an ORPHANED sidecar (eli5 and questions freshness checks).
 *
 * A sidecar is orphaned when its source is gone, and `rm` is only the right fix when the source
 * was meant to go. When the source was deleted by mistake, `rm` destroys the annotation too —
 * that is exactly how docusaurus-ask-my-blog/files/demo.questions.json and then its
 * `.eli5.json` were lost one after the other, each deletion following the previous one's hint.
 * So when git still remembers the source, restoring it is offered first.
 */

import { execFileSync } from "child_process";

/**
 * Commit that last deleted `relSource`, or null when git does not know the file (never
 * committed, or a shallow CI clone without that history) — then `rm` is the only hint left.
 *
 * @param {string} relSource source path, relative to projectRoot
 * @param {string} projectRoot
 * @returns {{ hash: string, subject: string } | null}
 */
function deletingCommit(relSource, projectRoot) {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--diff-filter=D", "--format=%h%x00%s", "--", relSource],
      { cwd: projectRoot, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (!out) return null;
    const [hash, subject] = out.split("\0");
    return { hash, subject };
  } catch {
    return null;
  }
}

/**
 * @param {string} relSource the missing source, relative to projectRoot
 * @param {string} relJson the orphaned sidecar, relative to projectRoot
 * @param {string} projectRoot
 * @returns {string[]} lines to print, already indented
 */
export function orphanFixHint(relSource, relJson, projectRoot) {
  const commit = deletingCommit(relSource, projectRoot);
  if (!commit) return [`   Fix with: rm ${relJson}`];
  return [
    `   The source was deleted in ${commit.hash} (${commit.subject}).`,
    `   Deleted by mistake? Restore it: git checkout ${commit.hash}^ -- ${relSource}`,
    `   Deleted on purpose? Then:       rm ${relJson}`,
  ];
}
