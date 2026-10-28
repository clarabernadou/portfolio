// Génère les PDF du CV essentiel (français et anglais) dans public/ : npm run pdf.
// Même gabarit et mêmes données que le bouton « Générer » de l'administration
// (lib/pdf) : la base si DATABASE_URL est défini, sinon les fichiers du site.
import { writeFile } from "node:fs/promises";
import path from "node:path";
try {
  process.loadEnvFile(".env.local");
} catch {
  // Pas de .env.local : données des fichiers du site.
}

const { cvHtml } = await import("../lib/pdf/cv-html");
const { essentielFr } = await import("../lib/pdf/cv-data");
const { loadAssets, loadSources, renderPdf } = await import("../lib/pdf/server");

const [sources, assets] = await Promise.all([loadSources(), loadAssets()]);
const jobs = [{ out: "public/CV_Clara_Bernadou_FR.pdf", doc: essentielFr(sources) }];
for (const j of jobs) {
  const { pdf, pages } = await renderPdf(cvHtml(j.doc, assets));
  await writeFile(path.join(process.cwd(), j.out), pdf);
  console.log(`${j.out} généré (${pages} pages).`);
}
process.exit(0);
