// Shared content-hashing helper for build-time sidecar freshness tracking (.eli5.json,
// .questions.json). Used by generate-eli5.mjs / bulk-eli5.mjs / check-eli5-freshness.mjs and,
// for the "ask my blog" question index (TODO 0083), generate-questions.mjs /
// check-questions-freshness.mjs — same hash-and-compare shape, generic enough to share.

import crypto from "crypto";

export function hashSource(content) {
  return crypto.createHash("sha1").update(content, "utf-8").digest("hex");
}
