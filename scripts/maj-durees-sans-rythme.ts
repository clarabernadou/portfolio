// 27 nov. 2026 : demande de Clara. Durée des fiches de formation : « · 35 h/semaine » et « · 35 h/mois » retirés
// (« ≈ 3 semaines · 35 h/semaine » → « ≈ 3 semaines »), puisque l'aide sous la durée donne désormais le rythme selon
// le mode de la formation (lib/en-bref.ts, aideDuree). Seuls ces deux suffixes exacts sont retirés, et seulement sur
// les fiches dont le cadre est une formation ; rien d'autre ne change. Toutes les fiches, publiées, privées ou en
// brouillon. Simulation par défaut ; --appliquer après npm run db:backup (sauvegarde des anciennes valeurs dans backups/).
// Usage : npx tsx scripts/maj-durees-sans-rythme.ts [--appliquer]
export {};
import { mkdirSync, writeFileSync } from "node:fs";
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const SUFFIXE = /\s*·\s*35 h\/(semaine|mois)\s*$/;
const formations = (await prisma.formation.findMany({ select: { intitule: true } })).map((f) => f.intitule.trim());
const rows = await prisma.project.findMany({ where: { deletedAt: null, duree: { not: null } }, select: { id: true, parcours: true, duree: true } });
const changements = rows
  .filter((r) => formations.includes(r.parcours.trim()) && SUFFIXE.test(r.duree ?? ""))
  .map((r) => ({ id: r.id, avant: r.duree!, apres: r.duree!.replace(SUFFIXE, "").trim() }))
  .filter((c) => c.apres);
for (const c of changements) console.log(`${c.id.padEnd(24)} « ${c.avant} » → « ${c.apres} »`);
console.log(`${changements.length} fiches à modifier.`);
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
mkdirSync("backups", { recursive: true });
writeFileSync(`backups/durees-avant-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`, JSON.stringify(changements, null, 1));
// Une mise à jour par fiche (la base distante refuse une transaction de plus de 5 s) ; relancer le script ne traite
// que les durées qui ont encore le suffixe.
for (const c of changements) await prisma.project.update({ where: { id: c.id }, data: { duree: c.apres } });
console.log("Durées mises à jour.");
await prisma.$disconnect();
