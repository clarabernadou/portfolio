// 24 nov. 2026 : demande de Clara. Carte d'expérience CarbonScore de l'accueil : « Alternance · full remote » devient
// « Alternance · Pontoise, full remote », comme la carte Fruggr (« Alternance · Nantes, full remote ») et comme le CV
// (lieu « Pontoise, full remote »). Rien d'autre ne change. Simulation par défaut ; --appliquer après npm run db:backup.
// Usage : npx tsx scripts/maj-carbonscore-lieu.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();
const AVANT = "Alternance · full remote";
const APRES = "Alternance · Pontoise, full remote";
const e = await prisma.experience.findFirstOrThrow({ where: { entreprise: "CarbonScore" } });
const carte = (e.homeCard ?? {}) as Record<string, unknown>;
console.log(`Lieu du CV : « ${e.lieuMode} » · carte d'accueil : « ${carte.lieuMode} »`);
if (carte.lieuMode !== AVANT) {
  console.error(`Rien n'est écrit : la carte d'accueil ne dit pas « ${AVANT} ».`);
  process.exit(1);
}
if (!process.argv.includes("--appliquer")) {
  console.log(`Simulation : « ${AVANT} » → « ${APRES} ». Relancer avec --appliquer (après npm run db:backup).`);
  process.exit(0);
}
await prisma.experience.update({ where: { id: e.id }, data: { homeCard: { ...carte, lieuMode: APRES } as never } });
console.log(`Écrit : « ${APRES} ».`);
await prisma.$disconnect();
