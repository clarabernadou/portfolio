// 20 nov. 2026 : la capture « fiche d'une carte » de J.A.R.V.I.S montrait une carte Riftbound sans prix.
// Demande de Clara : une carte avec son vrai prix. Dracaufeu (Set de Base), cote Cardmarket, sur le compte de démo.
// Remplace seulement cette capture (même place, même groupe) ; l'ancienne est gardée dans
// captures-jarvis/capture-tcg-avant.json. La base est partagée avec le site en ligne : par défaut, simulation.
// Usage : npx tsx scripts/maj-jarvis-capture-tcg.ts [--appliquer]
import { readFile, writeFile } from "node:fs/promises";
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const FICHIER = "10-tcg-fiche-carte-desktop.png";
const SOURCE = `captures-jarvis/selection-demo/${FICHIER}`;
const ALT = "Fiche de la carte Dracaufeu du Set de Base : carte en grand, cote Cardmarket du jour à 441,79 € et baisse de 6,7 % sur 30 jours.";
type Capture = { url: string; alt: string; groupe?: string };

const p = await prisma.project.findUniqueOrThrow({ where: { id: "jarvis" }, select: { captures: true } });
const captures = (p.captures ?? []) as Capture[];
const i = captures.findIndex((c) => c.url.includes(`/${FICHIER.replace(/\.png$/, "")}-`));
if (i < 0) {
  console.error("Capture introuvable : rien n'est écrit.");
  process.exit(1);
}
if (captures[i].alt === ALT) {
  console.log("Déjà à jour.");
  process.exit(0);
}
console.log(`Capture ${i + 1} [${captures[i].groupe}]\nAvant : ${captures[i].alt}\nAprès : ${ALT}`);
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer.");
  process.exit(0);
}
await writeFile("captures-jarvis/capture-tcg-avant.json", JSON.stringify(captures[i], null, 2));
const { put } = await import("@vercel/blob");
const b = await put(`livrables/jarvis/${FICHIER}`, await readFile(SOURCE), { access: "public", contentType: "image/png", addRandomSuffix: true });
captures[i] = { ...captures[i], url: b.url, alt: ALT };
await prisma.project.update({ where: { id: "jarvis" }, data: { captures: captures as never } });
console.log("Écrit.");
process.exit(0);
