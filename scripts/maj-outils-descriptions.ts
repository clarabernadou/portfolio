// 20 nov. 2026 (textes rédigés avec Clara) : descriptions de Claude Code, Claude Design et Claude Cowork sur /ia ;
// « Remotion et ElevenLabs » retiré de « Aussi, selon la tâche » (cités dans Claude Code).
// Par défaut, simulation (avant / après). Avec --appliquer, écriture, après une sauvegarde (npm run db:backup).
// Usage : npx tsx scripts/maj-outils-descriptions.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const TEXTES: Record<string, string> = {
  "Claude Code":
    "Développement d’applications de A à Z : front-end, back-end, bases de données et gestion des données, tests, mise en ligne et intégration continue. Vidéos en motion design aussi, codées avec Remotion et doublées avec ElevenLabs.",
  "Claude Design":
    "Conception d’interfaces, des wireframes aux prototypes : maquettes, déclinaisons d’écrans, chartes graphiques, design systems et présentations. Visuels de communication : posts pour les réseaux sociaux, bannières LinkedIn, miniatures YouTube.",
  "Claude Cowork":
    "Prend la main sur mon ordinateur pour mener des tâches en plusieurs étapes, dans le navigateur et mes outils de travail : messagerie, agenda, gestion des tâches. Produit des artefacts et des e-mails actualisés chaque jour, comme mon brief IA. Partenaire de réflexion et de rédaction.",
};
const RETIRE = "Remotion et ElevenLabs";

type Outil = { name: string; description: string };
const row = await prisma.singleton.findUniqueOrThrow({ where: { key: "ia" } });
const ia = structuredClone(row.data) as unknown as { tools: Outil[] };
const manquants = [...Object.keys(TEXTES), RETIRE].filter((n) => !ia.tools.some((t) => t.name === n));
if (manquants.length) {
  console.error(`Outils introuvables : ${manquants.join(", ")}. Rien n'est écrit.`);
  process.exit(1);
}
for (const t of ia.tools) {
  if (!TEXTES[t.name]) continue;
  console.log(`${t.name}\n  avant : ${t.description}\n  après : ${TEXTES[t.name]}`);
  t.description = TEXTES[t.name];
}
ia.tools = ia.tools.filter((t) => t.name !== RETIRE);
console.log(`Retiré : ${RETIRE}`);

if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.singleton.update({ where: { key: "ia" }, data: { data: ia as never } });
console.log("Écrit.");
process.exit(0);
