// 25 nov. 2026 : Rôle du bandeau « en bref » pour les 9 fiches qui n'en ont pas, déduit de la formation de chaque projet
// (aucun texte de fiche ne le nomme). Validé par Clara le 25 nov. 2026. Équipe et Durée restent vides : aucune fiche
// ne les mentionne. N'écrit que dans un Rôle vide, jamais par-dessus une valeur saisie.
// La base est partagée avec le site en ligne : par défaut, simulation. Avec --appliquer : sauvegarde des valeurs
// d'avant dans backups/roles-avant-en-bref.json, puis écriture. Retour arrière : --restaurer.
// Usage : npx tsx scripts/maj-roles-en-bref.ts [--appliquer | --restaurer]
import { readFile, writeFile } from "node:fs/promises";
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const SAUVEGARDE = "backups/roles-avant-en-bref.json";
const ROLES: Record<string, string> = {
  avenirs: "UX designer",
  cafeo: "UX designer",
  "camping-luxe": "UX designer",
  "equi-libre": "UX designer",
  foodles: "UX designer",
  "hero-lines": "UX designer",
  bobapp: "Développeuse full stack",
  "your-car-your-way": "Développeuse full stack",
  intuitlearn: "Auditrice UX/UI",
};

if (process.argv.includes("--restaurer")) {
  const avant = JSON.parse(await readFile(SAUVEGARDE, "utf8")) as Record<string, string | null>;
  for (const [id, role] of Object.entries(avant)) await prisma.project.update({ where: { id }, data: { role } });
  console.log(`Restauré : ${Object.keys(avant).length} fiches.`);
  process.exit(0);
}

const fiches = await prisma.project.findMany({ where: { id: { in: Object.keys(ROLES) } }, select: { id: true, role: true } });
const manquantes = Object.keys(ROLES).filter((id) => !fiches.some((f) => f.id === id));
if (manquantes.length) {
  console.error("Fiche introuvable : rien n'est écrit.", manquantes);
  process.exit(1);
}
const a_ecrire = fiches.filter((f) => !f.role?.trim());
for (const f of fiches) console.log(`${f.id} : ${f.role?.trim() ? `déjà « ${f.role} », inchangé` : `→ « ${ROLES[f.id]} »`}`);
if (!process.argv.includes("--appliquer")) {
  console.log(`\nSimulation : ${a_ecrire.length} fiche(s) à écrire, rien n'est écrit. Relancer avec --appliquer.`);
  process.exit(0);
}
await writeFile(SAUVEGARDE, JSON.stringify(Object.fromEntries(a_ecrire.map((f) => [f.id, f.role ?? null])), null, 2));
for (const f of a_ecrire) await prisma.project.update({ where: { id: f.id }, data: { role: ROLES[f.id] } });
console.log(`\nÉcrit : ${a_ecrire.length} fiche(s). Sauvegarde : ${SAUVEGARDE}.`);
process.exit(0);
