// 20 nov. 2026 (demande de Clara) : « Claude » n'est plus mis en avant sur /ia (il passe dans « Aussi, selon la
// tâche ») ; les outils mis en avant sont dans l'ordre Claude Code, Claude Design, Claude Cowork.
// Par défaut, simulation (ordre avant / après). Avec --appliquer, écriture, après une sauvegarde (npm run db:backup).
// Usage : npx tsx scripts/maj-outils-ia.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

type Outil = { name: string; vedette?: boolean };
const row = await prisma.singleton.findUniqueOrThrow({ where: { key: "ia" } });
const ia = structuredClone(row.data) as unknown as { tools: Outil[] };
const ligne = (l: Outil[]) => l.map((t) => `${t.name}${t.vedette ? " (mis en avant)" : ""}`).join(", ");
console.log(`Avant : ${ligne(ia.tools)}`);

const ORDRE = ["Claude Code", "Claude Design", "Claude Cowork"];
const manquants = ["Claude", ...ORDRE].filter((n) => !ia.tools.some((t) => t.name === n));
if (manquants.length) {
  console.error(`Outils introuvables : ${manquants.join(", ")}. Rien n'est écrit.`);
  process.exit(1);
}
const claude = ia.tools.find((t) => t.name === "Claude")!;
delete claude.vedette;
const enTete = ORDRE.map((n) => ia.tools.find((t) => t.name === n)!);
ia.tools = [...enTete, ...ia.tools.filter((t) => !ORDRE.includes(t.name))];
console.log(`Après : ${ligne(ia.tools)}`);

if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.singleton.update({ where: { key: "ia" }, data: { data: ia as never } });
console.log("Écrit.");
process.exit(0);
