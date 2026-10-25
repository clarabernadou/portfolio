// Restaure une sauvegarde (npm run db:backup) dans une base VIDE.
// Usage : npm run db:restore -- backups/portfolio-….json [--url mysql://…/autre_base]
// Par défaut la cible est DATABASE_URL ; le script refuse d'écrire dans une base qui
// contient déjà des projets, pour ne jamais écraser des données par erreur.
import { readFile } from "node:fs/promises";

process.loadEnvFile(".env.local");
const args = process.argv.slice(2);
const file = args.find((a) => a.endsWith(".json"));
const urlArg = args.includes("--url") ? args[args.indexOf("--url") + 1] : null;
if (!file) {
  console.error("Indique le fichier de sauvegarde (backups/portfolio-….json).");
  process.exit(1);
}
const { PrismaClient } = await import("../lib/generated/prisma/client");
const { adapterFromUrl } = await import("../lib/db");
const { TABLES } = await import("./db-tables");
const prisma = new PrismaClient({ adapter: adapterFromUrl(urlArg ?? process.env.DATABASE_URL!) });

if ((await prisma.project.count()) > 0) {
  console.error("La base cible contient déjà des projets : restauration refusée (elle doit être vide).");
  process.exit(1);
}
const { tables } = JSON.parse(await readFile(file, "utf8")) as { tables: Record<string, Record<string, unknown>[]> };
for (const t of TABLES) {
  // null → champ absent : Prisma refuse null pour un champ JSON facultatif, absent vaut « vide en base ».
  const rows = (tables[t] ?? []).map((r) =>
    Object.fromEntries(
      Object.entries(r)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, typeof v === "object" && v && "$base64" in v ? Buffer.from(String((v as { $base64: string }).$base64), "base64") : v]),
    ),
  );
  for (const r of rows) await (prisma[t] as unknown as { create: (a: { data: unknown }) => Promise<unknown> }).create({ data: r });
  console.log(`  ${t} : ${rows.length} restauré(s)`);
}
await prisma.$disconnect();
console.log("Restauration terminée.");
