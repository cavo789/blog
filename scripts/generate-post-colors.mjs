#!/usr/bin/env node
/**
 * Generates src/data/postColors.generated.js, a per-banner-image accent color lookup used to
 * give each blog post's header a color that echoes its own banner — the automatic counterpart
 * to the hand-picked `color` field in src/data/series.js. Hand-picking isn't an option here:
 * static/img/v2/ holds 130+ banners and keeps growing with every new post.
 *
 * A plain pixel average washes out to gray on these mostly-pale illustrated banners, so this
 * instead finds the densest cluster of saturated pixels (weighted by saturation²), ignoring
 * near-black/near-white/low-saturation pixels — the accent color a human eye would actually
 * pick out, not a blend of the whole image.
 *
 * Run with `yarn colors:bundle` whenever a banner is added to/changed in static/img/v2/.
 */
import { readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const IMAGES_DIR = fileURLToPath(new URL("../static/img/v2", import.meta.url));
const OUTPUT_PATH = fileURLToPath(
  new URL("../src/data/postColors.generated.js", import.meta.url),
);

const THUMBNAIL_SIZE = 48;
const QUANTIZE_STEP = 20;
const MIN_SATURATION = 30;
const MIN_LIGHTNESS = 15;
const MAX_LIGHTNESS = 85;

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) {
    return [0, 0, l * 100];
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case rn:
      h = (gn - bn) / d + (gn < bn ? 6 : 0);
      break;
    case gn:
      h = (bn - rn) / d + 2;
      break;
    default:
      h = (rn - gn) / d + 4;
  }
  return [h * 60, s * 100, l * 100];
}

async function dominantVividColor(filePath) {
  const { data, info } = await sharp(filePath)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = new Map();
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const [, s, l] = rgbToHsl(r, g, b);
    if (s < MIN_SATURATION || l < MIN_LIGHTNESS || l > MAX_LIGHTNESS) continue;

    const qr = Math.round(r / QUANTIZE_STEP) * QUANTIZE_STEP;
    const qg = Math.round(g / QUANTIZE_STEP) * QUANTIZE_STEP;
    const qb = Math.round(b / QUANTIZE_STEP) * QUANTIZE_STEP;
    const key = `${qr},${qg},${qb}`;
    const entry = buckets.get(key) ?? { count: 0, r: qr, g: qg, b: qb };
    entry.count += (s / 100) ** 2;
    buckets.set(key, entry);
  }

  let best = null;
  for (const entry of buckets.values()) {
    if (!best || entry.count > best.count) best = entry;
  }
  return best ? rgbToHex(best.r, best.g, best.b) : null;
}

const files = (await readdir(IMAGES_DIR)).filter((f) => f.endsWith(".webp")).sort();

const colors = {};
const skipped = [];
for (const file of files) {
  try {
    const hex = await dominantVividColor(`${IMAGES_DIR}/${file}`);
    if (hex) colors[`/img/v2/${file}`] = hex;
  } catch (error) {
    skipped.push(file);
    console.warn(`Skipping ${file}: ${error.message}`);
  }
}

const lines = Object.entries(colors).map(([key, hex]) => `  "${key}": "${hex}",`);

const banner = `// GENERATED FILE — do not edit by hand.
// Regenerate with \`yarn colors:bundle\` after adding/changing a banner in static/img/v2/.
`;

await writeFile(
  OUTPUT_PATH,
  `${banner}\nconst POST_COLORS = {\n${lines.join("\n")}\n};\n\nexport default POST_COLORS;\n`,
);

console.log(
  `Wrote ${Object.keys(colors).length} colors (of ${files.length} banners) to ${OUTPUT_PATH}`,
);
if (skipped.length > 0) {
  console.warn(`Skipped ${skipped.length} unreadable file(s): ${skipped.join(", ")}`);
}
