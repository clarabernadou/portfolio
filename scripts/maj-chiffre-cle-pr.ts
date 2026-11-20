// 20 nov. 2026 : le chiffre clé de l'accueil reprend la phrase exacte du CV final en PDF (demande de Clara) :
// « 75 pull requests mergées en 15 mois, dont 22 fonctionnalités en autonomie ».
// Par défaut, simulation (avant / après). Avec --appliquer, écriture, après une sauvegarde (npm run db:backup).
// Rien n'est écrit si le libellé actuel n'est pas celui attendu.
// Usage : npx tsx scripts/maj-chiffre-cle-pr.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const AVANT = "pull requests mergées en 15 mois sur Fruggr et CarbonScore";
const APRES = "pull requests mergées en 15 mois, dont 22 fonctionnalités en autonomie";

type Profil = { chiffreCle?: { valeur: string; libelle: string } };
const row = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(row.data) as unknown as Profil;
if (profil.chiffreCle?.libelle !== AVANT) {
  console.error("Libellé actuel différent de celui attendu : rien n'est écrit.", profil.chiffreCle);
  process.exit(1);
}
console.log(`Avant : ${profil.chiffreCle.valeur} ${AVANT}\nAprès : ${profil.chiffreCle.valeur} ${APRES}`);
profil.chiffreCle.libelle = APRES;
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.singleton.update({ where: { key: "profil" }, data: { data: profil as never } });
console.log("Écrit.");
process.exit(0);
