// Extracts plain text from a PDF file, entirely client-side.
// pdfjs-dist is loaded with a dynamic import (not a top-level import) so its
// code never runs during server-side rendering — only when a user actually
// selects a file in the browser. The worker script is served from /public
// (copied there by scripts/copy-pdf-worker.mjs on postinstall) rather than
// a CDN, since cross-origin module workers commonly hit CORS errors.
export async function extractPdfText(file) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str || "").join(" ");
    fullText += `${pageText}\n\n`;
  }
  return fullText.trim();
}
