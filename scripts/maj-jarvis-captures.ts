// 20 nov. 2026 : captures de J.A.R.V.I.S refaites sur le compte de démo en ligne (données fictives).
// Les 14 images de captures-jarvis/selection-demo/ (dossier local, hors Git) et leurs textes alternatifs
// (textes-alternatifs.md, même dossier) remplacent les captures de la fiche, dans le même ordre et les mêmes groupes.
// Accord de Clara le 20 nov. 2026 (remplacement en ligne, pour tester sur le localhost).
// La base est partagée avec le site en ligne : par défaut, simulation. Avec --appliquer : sauvegarde des
// anciennes captures dans captures-jarvis/captures-avant-demo.json, envoi sur Vercel Blob, écriture.
// Retour arrière : npx tsx scripts/maj-jarvis-captures.ts --restaurer
// Usage : npx tsx scripts/maj-jarvis-captures.ts [--appliquer | --restaurer]
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const DOSSIER = "captures-jarvis/selection-demo";
const SAUVEGARDE = "captures-jarvis/captures-avant-demo.json";
type Capture = { url: string; alt: string; groupe?: string };

const p = await prisma.project.findUniqueOrThrow({ where: { id: "jarvis" }, select: { captures: true } });
const actuelles = (p.captures ?? []) as Capture[];

if (process.argv.includes("--restaurer")) {
  const anciennes = JSON.parse(await readFile(SAUVEGARDE, "utf8")) as Capture[];
  await prisma.project.update({ where: { id: "jarvis" }, data: { captures: anciennes as never } });
  console.log(`Restauré : ${anciennes.length} captures.`);
  process.exit(0);
}

// Tableau du fichier .md : | fichier | groupe | texte alternatif |
const md = await readFile(path.join(DOSSIER, "textes-alternatifs.md"), "utf8");
const lignes = md.split("\n").filter((l) => /^\| \d\d-.*\.png \|/.test(l));
const nouvelles = lignes.map((l) => {
  const [fichier, groupe, alt] = l.split("|").slice(1, 4).map((c) => c.trim());
  return { fichier, groupe, alt };
});
// Même ordre que la fiche actuelle : chaque ancienne adresse contient le nom du fichier (sans .png).
const rang = (fichier: string) => actuelles.findIndex((c) => c.url.includes(`/${fichier.replace(/\.png$/, "")}-`));
if (nouvelles.some((n) => rang(n.fichier) < 0)) {
  console.error("Capture sans équivalent dans la fiche actuelle : rien n'est écrit.", nouvelles.filter((n) => rang(n.fichier) < 0).map((n) => n.fichier));
  process.exit(1);
}
nouvelles.sort((a, b) => rang(a.fichier) - rang(b.fichier));
if (nouvelles.length !== 14 || nouvelles.some((n) => !n.alt || !n.groupe)) {
  console.error("Tableau des textes alternatifs incomplet : rien n'est écrit.", nouvelles.length);
  process.exit(1);
}
for (const n of nouvelles) console.log(`${n.fichier} [${n.groupe}] ${n.alt}`);
console.log(`\nAvant : ${actuelles.length} captures. Après : ${nouvelles.length} captures.`);
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer.");
  process.exit(0);
}

await writeFile(SAUVEGARDE, JSON.stringify(actuelles, null, 2));
const { put } = await import("@vercel/blob");
const captures: Capture[] = [];
for (const n of nouvelles) {
  const b = await put(`livrables/jarvis/${n.fichier}`, await readFile(path.join(DOSSIER, n.fichier)), { access: "public", contentType: "image/png", addRandomSuffix: true });
  captures.push({ url: b.url, alt: n.alt, groupe: n.groupe });
  console.log(`Envoyé : ${n.fichier}`);
}
await prisma.project.update({ where: { id: "jarvis" }, data: { captures: captures as never } });
console.log(`Écrit. Anciennes captures sauvegardées dans ${SAUVEGARDE}.`);
process.exit(0);
