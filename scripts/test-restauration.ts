// Test de la restauration (étape 12) : sauvegarde → base temporaire vide → restauration →
// comparaison, table par table, avec la base d'origine → suppression de la base temporaire.
// La base de production n'est jamais modifiée.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import mariadb from "mariadb";

process.loadEnvFile(".env.local");
const src = new URL(process.env.DATABASE_URL!);
const TEMP = "portfolio_test_restauration";
const temp = new URL(src.toString());
temp.pathname = `/${TEMP}`;
const conn = () => mariadb.createConnection({ host: src.hostname, port: Number(src.port || 4000), user: decodeURIComponent(src.username), password: decodeURIComponent(src.password), ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true }, connectTimeout: 10000 });
let failures = 0;
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${label}`);
  if (!ok) failures++;
};

const c = await conn();
try {
  execFileSync("npx", ["tsx", "scripts/db-backup.ts"], { stdio: "pipe" });
  const file = readdirSync("backups").filter((f) => f.endsWith(".json")).sort().at(-1)!;
  check(true, `Sauvegarde : backups/${file}`);
  await c.query(`DROP DATABASE IF EXISTS ${TEMP}`);
  await c.query(`CREATE DATABASE ${TEMP}`);
  execFileSync("npx", ["prisma", "migrate", "deploy"], { stdio: "pipe", env: { ...process.env, DATABASE_URL: temp.toString() } });
  check(true, "Base temporaire créée et tables en place");
  execFileSync("npx", ["tsx", "scripts/db-restore.ts", `backups/${file}`, "--url", temp.toString()], { stdio: "pipe" });
  check(true, "Restauration dans la base temporaire");
  const tables = (await c.query(`SELECT table_name AS t FROM information_schema.tables WHERE table_schema = ? AND table_name <> '_prisma_migrations'`, [src.pathname.slice(1)])) as { t: string }[];
  for (const { t } of tables) {
    const [a] = (await c.query(`SELECT COUNT(*) AS n FROM \`${src.pathname.slice(1)}\`.\`${t}\``)) as { n: bigint }[];
    const [b] = (await c.query(`SELECT COUNT(*) AS n FROM \`${TEMP}\`.\`${t}\``)) as { n: bigint }[];
    check(a.n === b.n, `${t} : ${a.n} ligne(s) d’origine, ${b.n} restaurée(s)`);
  }
  const [p1] = (await c.query(`SELECT name, line, CAST(docs AS CHAR) AS docs FROM \`${src.pathname.slice(1)}\`.Project WHERE id = 'equi-libre'`)) as Record<string, string>[];
  const [p2] = (await c.query(`SELECT name, line, CAST(docs AS CHAR) AS docs FROM \`${TEMP}\`.Project WHERE id = 'equi-libre'`)) as Record<string, string>[];
  check(JSON.stringify(p1) === JSON.stringify(p2), "Contenu identique (projet Équi-libre, livrables compris)");
} catch (e) {
  check(false, `Erreur : ${(e as Error).message.split("\n")[0]}`);
} finally {
  await c.query(`DROP DATABASE IF EXISTS ${TEMP}`);
  await c.end();
  console.log("Base temporaire supprimée.");
}
console.log(failures ? `\n${failures} échec(s)` : "\nTous les contrôles passent.");
process.exit(failures ? 1 : 0);
