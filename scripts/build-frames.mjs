// One-off asset pipeline: the source hero sequence is 300 PNGs at 1600x900
// (~471 MB total) — far too heavy to ship. This resizes + re-encodes them to
// WebP into public/frames/ so the cinematic hero can stream them in the browser.
//
//   node scripts/build-frames.mjs
//
// Idempotent: skips frames that already exist unless FORCE=1.
import sharp from "sharp";
import { mkdir, readdir, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve("app/assets/frames");
const OUT = path.resolve("public/frames");
const WIDTH = 1280; // 720p-class; plenty for a full-bleed hero, a third of the pixels
const QUALITY = 72;
const FORCE = process.env.FORCE === "1";

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(SRC))
    .filter((f) => /^frame_\d+\.png$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error(`No frames found in ${SRC}`);
    process.exit(1);
  }

  console.log(`Encoding ${files.length} frames → ${OUT} (${WIDTH}px, q${QUALITY})`);
  let done = 0;
  const CONCURRENCY = 8;

  async function worker(queue) {
    while (queue.length) {
      const file = queue.pop();
      const outName = file.replace(/\.png$/i, ".webp");
      const outPath = path.join(OUT, outName);
      if (!FORCE && existsSync(outPath)) {
        done++;
        continue;
      }
      await sharp(path.join(SRC, file))
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 5 })
        .toFile(outPath);
      done++;
      if (done % 25 === 0 || done === files.length) {
        process.stdout.write(`\r  ${done}/${files.length}`);
      }
    }
  }

  const queue = [...files].reverse();
  await Promise.all(
    Array.from({ length: CONCURRENCY }, () => worker(queue))
  );

  // Reduced-motion posters (first + last frame) at higher quality.
  const first = files[0];
  const last = files[files.length - 1];
  await sharp(path.join(SRC, first))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.resolve("public/poster-start.webp"));
  await sharp(path.join(SRC, last))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.resolve("public/poster-end.webp"));

  console.log(`\nDone. ${files.length} frames + 2 posters written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
