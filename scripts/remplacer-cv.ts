// Remplace le CV en PDF servi par le site, comme le bouton « Remplacer le CV » de l'administration (envoyerCv) :
// même contrôle (PDF, 2,5 Mo au plus), même enregistrement en base, même ligne au journal. Le CV en ligne change
// aussitôt (/media/cv lit la base à chaque demande). Simulation par défaut ; --appliquer après npm run db:backup.
// 27 nov. 2026 : CV corrigé par Clara (J.A.R.V.I.S à 5 mini-applications, « près de 3 ans », Pontoise).
// Usage : npx tsx scripts/remplacer-cv.ts <fichier.pdf> [--appliquer]
export {};
import { readFileSync } from "node:fs";
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const { CV_PUBLIC, CV_TAILLE_MAX } = await import("../lib/pdf/fichiers");
const { logActivity } = await import("../lib/admin/activity");

const chemin = process.argv[2];
if (!chemin || chemin.startsWith("--")) {
  console.error("Usage : npx tsx scripts/remplacer-cv.ts <fichier.pdf> [--appliquer]");
  process.exit(1);
}
const data = new Uint8Array(readFileSync(chemin));
if (Buffer.from(data.subarray(0, 5)).toString("latin1") !== "%PDF-") {
  console.error("Ce fichier n’est pas un PDF : rien n’est écrit.");
  process.exit(1);
}
if (data.length > CV_TAILLE_MAX) {
  console.error(`Le PDF dépasse 2,5 Mo (${data.length} octets) : rien n’est écrit.`);
  process.exit(1);
}
const prisma = db();
const actuel = await prisma.generatedFile.findUnique({ where: { name: CV_PUBLIC }, select: { generatedAt: true, data: true } });
console.log(`En ligne : ${actuel ? `${actuel.data?.length} octets, du ${actuel.generatedAt.toISOString()}` : "aucun (fichier de public/)"}`);
console.log(`Nouveau : ${data.length} octets (${chemin})`);
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n’est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.generatedFile.upsert({
  where: { name: CV_PUBLIC },
  create: { name: CV_PUBLIC, kind: "cv", lang: "fr", data },
  update: { kind: "cv", lang: "fr", data, generatedAt: new Date() },
});
await logActivity("cv", CV_PUBLIC, "CV en PDF remplacé");
console.log("CV remplacé.");
await prisma.$disconnect();
