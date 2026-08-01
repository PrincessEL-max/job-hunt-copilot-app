// Copies the pdf.js worker script into public/ so it's served same-origin.
// Runs automatically after `npm install` (see package.json "postinstall").
// This avoids CORS issues that happen when loading the worker from a CDN.
import { copyFileSync, mkdirSync, existsSync } from "fs";

const src = "node_modules/pdfjs-dist/build/pdf.worker.min.mjs";
const destDir = "public";
const dest = `${destDir}/pdf.worker.min.mjs`;

try {
  if (!existsSync(src)) {
    console.warn(`[copy-pdf-worker] Source not found at ${src}, skipping.`);
    process.exit(0);
  }
  mkdirSync(destDir, { recursive: true });
  copyFileSync(src, dest);
  console.log(`[copy-pdf-worker] Copied worker to ${dest}`);
} catch (err) {
  console.warn("[copy-pdf-worker] Failed to copy pdf.js worker:", err.message);
}
