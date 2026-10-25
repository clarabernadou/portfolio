// Sauvegarde complète de la base dans un fichier JSON (dossier backups/, ignoré par Git).
// Usage : npm run db:backup
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const { TABLES } = await import("./db-tables");

const prisma = db();
const dump: Record<string, unknown[]> = {};
for (const t of TABLES) {
  const rows = await (prisma[t] as unknown as { findMany: () => Promise<Record<string, unknown>[]> }).findMany();
  // Les fichiers (Bytes) sont écrits en base64 pour tenir dans le JSON.
  dump[t] = rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v instanceof Uint8Array ? { $base64: Buffer.from(v).toString("base64") } : v])));
}
const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
const file = path.join("backups", `portfolio-${stamp}.json`);
await mkdir("backups", { recursive: true });
await writeFile(file, JSON.stringify({ createdAt: new Date().toISOString(), tables: dump }));
console.log(`Sauvegarde écrite : ${file}`);
for (const t of TABLES) console.log(`  ${t} : ${dump[t].length}`);
await prisma.$disconnect();
