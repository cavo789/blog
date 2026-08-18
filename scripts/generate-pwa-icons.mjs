#!/usr/bin/env node
/**
 * Generates the PWA icon set in static/img/icons/ from the blog's mascot artwork
 * (static/img/meerkat/suricate_no_background.png). The generated files are committed —
 * this is a build-time-authoring tool, not a build step — so the icon set stays
 * reproducible if the mascot artwork ever changes. See TODO 0090.
 *
 * The source is 585×742 (portrait, not square) and, despite its filename, has an opaque
 * white background rather than a transparent one (verified with sharp's metadata:
 * channels: 3, hasAlpha: false). Every output below fills its canvas with that same white
 * so the padding sharp adds around the portrait artwork is invisible against it.
 *
 * Run with `yarn pwa:icons` whenever the source artwork changes.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SOURCE_PATH = fileURLToPath(
  new URL("../static/img/meerkat/suricate_no_background.png", import.meta.url),
);
const OUTPUT_DIR = fileURLToPath(new URL("../static/img/icons", import.meta.url));

// Matches the source artwork's own background — see the module comment above. No `alpha`
// key: sharp otherwise treats the background as RGBA and carries an alpha channel through
// to composite()'s output even when every pixel in it is fully opaque.
const BACKGROUND = { r: 255, g: 255, b: 255 };

// Maskable icons get masked into a circle, squircle, or rounded square depending on the
// launcher. To survive all of them, the artwork must sit inside the safe zone — the
// centered region that every mask shape shares. The common practice (matching tools like
// PWA Builder / maskable.app) is to scale content down to fit an 80%-of-canvas square
// before compositing onto the full canvas, which is what this ratio drives.
const MASKABLE_SAFE_ZONE_RATIO = 0.8;

async function writeSquareIcon(size, outputName) {
  const buffer = await sharp(SOURCE_PATH)
    .resize({ width: size, height: size, fit: "contain", background: BACKGROUND })
    .png()
    .toBuffer();
  await writeFile(`${OUTPUT_DIR}/${outputName}`, buffer);
  console.log(`Wrote ${outputName} (${size}x${size})`);
}

async function writeMaskableIcon(size, outputName) {
  const contentSize = Math.round(size * MASKABLE_SAFE_ZONE_RATIO);
  const content = await sharp(SOURCE_PATH)
    .resize({
      width: contentSize,
      height: contentSize,
      fit: "contain",
      background: BACKGROUND,
    })
    .toBuffer();
  const buffer = await sharp({
    create: { width: size, height: size, channels: 3, background: BACKGROUND },
  })
    .composite([{ input: content, gravity: "center" }])
    // Maskable icons should be fully opaque: masks apply inconsistently to
    // transparent pixels, and sharp's composite() adds an alpha channel by
    // default even when every pixel it produces is fully opaque.
    .removeAlpha()
    .png()
    .toBuffer();
  await writeFile(`${OUTPUT_DIR}/${outputName}`, buffer);
  console.log(
    `Wrote ${outputName} (${size}x${size}, content within ${contentSize}x${contentSize} safe zone)`,
  );
}

await mkdir(OUTPUT_DIR, { recursive: true });

await writeSquareIcon(192, "icon-192.png");
await writeSquareIcon(512, "icon-512.png");
await writeMaskableIcon(512, "icon-maskable-512.png");
// Apple never applies its own mask shrink, and requires an opaque background — both
// already satisfied by BACKGROUND and a plain contain resize.
await writeSquareIcon(180, "apple-touch-icon.png");

console.log(`Icon set written to ${OUTPUT_DIR}`);
