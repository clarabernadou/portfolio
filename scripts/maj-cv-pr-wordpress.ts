// 24 nov. 2026 : demande de Clara. Fruggr, bloc « Équipe marketing » (depuis juin 2026) : une puce ajoutée après la
// dernière, sur les pull requests du site WordPress. Le chiffre de l'équipe produit (75 pull requests mergées en
// 15 mois, dont 22 fonctionnalités majeures), vérifié sur Azure DevOps, ne change pas. Pas de chiffre d'audience.
// La base est partagée avec le site en ligne : par défaut, le script affiche seulement le changement.
// Avec --appliquer, il l'écrit (après npm run db:backup). Rien n'est écrit si le bloc n'est pas exactement celui attendu.
// Usage : npx tsx scripts/maj-cv-pr-wordpress.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const NOUVELLE =
  "**27 pull requests mergées** sur le site WordPress de Digital4Better et de Fruggr (blocs Gutenberg, composants, correctifs), dont plusieurs mises en production en continu";
const DERNIERE_ATTENDUE = "**Audits UX et accessibilité** des sites, avec rapports PDF et recommandations priorisées";
const PRODUIT = "**75 pull requests mergées** en 15 mois, dont 22 fonctionnalités majeures, toutes livrées en autonomie (dashboard de service, dashboards RGESN, gestion des crédits IA)";

type Bloc = { name?: string; period?: string; bulletsEssentiel: string[] };
const fruggr = await prisma.experience.findFirstOrThrow({ where: { entreprise: "Fruggr" } });
const blocs = structuredClone(fruggr.blocs) as unknown as Bloc[];
const marketing = blocs.find((b) => b.name === "Équipe marketing" && b.period === "depuis juin 2026");
const produit = blocs.find((b) => b.name === "Équipe produit");

const erreurs: string[] = [];
if (!marketing) erreurs.push("bloc « Équipe marketing · depuis juin 2026 » introuvable");
else if (marketing.bulletsEssentiel.includes(NOUVELLE)) erreurs.push("la puce est déjà présente");
else if (marketing.bulletsEssentiel.at(-1) !== DERNIERE_ATTENDUE) erreurs.push("dernière puce différente de celle attendue");
if (!produit?.bulletsEssentiel.includes(PRODUIT)) erreurs.push("chiffre de l'équipe produit différent de celui attendu");
if (erreurs.length) {
  console.error(`Rien n'est écrit :\n- ${erreurs.join("\n- ")}`);
  process.exit(1);
}

marketing!.bulletsEssentiel.push(NOUVELLE);
console.log("Équipe marketing, après :");
for (const p of marketing!.bulletsEssentiel) console.log(`  • ${p}`);
console.log(`Équipe produit, inchangée : ${PRODUIT}`);

if (!process.argv.includes("--appliquer")) {
  console.log("\nSimulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.experience.update({ where: { id: fruggr.id }, data: { blocs: blocs as never } });
console.log("\nChangement écrit en base.");
await prisma.$disconnect();
