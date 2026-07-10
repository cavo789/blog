// Shared content-hashing helper for .eli5.json freshness tracking.
// Used by generate-eli5.mjs, bulk-eli5.mjs (to stamp a hash at generation time)
// and check-eli5-freshness.mjs (to detect drift between source and annotations).

import crypto from "crypto";

export function hashSource(content) {
  return crypto.createHash("sha1").update(content, "utf-8").digest("hex");
}
