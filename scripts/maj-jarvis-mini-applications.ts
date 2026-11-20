// 20 nov. 2026 : le projet personnel du CV (J.A.R.V.I.S) annonçait 4 mini-applications ; il y en a 5
// (budget, courses, candidatures, TCG, wishlist : groupes de captures de la fiche). Texte validé par Clara.
// La base est partagée avec le site en ligne : par défaut, simulation (avant / après). Avec --appliquer,
// écriture, après une sauvegarde (npm run db:backup). Rien n'est écrit si le texte actuel n'est pas celui attendu.
// Usage : npx tsx scripts/maj-jarvis-mini-applications.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const AVANT = "Portail personnel installable (PWA) regroupant 4 mini-applications : budget, courses, suivi de candidatures et collection de cartes. Conçu et piloté seule avec Claude Code.";
const APRES = "Portail personnel installable (PWA) regroupant 5 mini-applications : budget, courses, suivi de candidatures, collection de cartes et wishlist. Conçu et piloté seule avec Claude Code.";

type Profil = { projetsCv: { titre: string; description?: string }[] };
const row = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(row.data) as unknown as Profil;
const jarvis = profil.projetsCv.find((p) => p.titre === "J.A.R.V.I.S");
if (!jarvis || jarvis.description !== AVANT) {
  console.error("Texte actuel différent de celui attendu : rien n'est écrit.", jarvis?.description);
  process.exit(1);
}
console.log(`Avant : ${AVANT}\nAprès : ${APRES}`);
jarvis.description = APRES;
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.singleton.update({ where: { key: "profil" }, data: { data: profil as never } });
console.log("Écrit.");
process.exit(0);
