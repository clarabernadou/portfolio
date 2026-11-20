// 20 nov. 2026 (validé par Clara) : « dont 3 ans en entreprise » devient « dont près de 3 ans en entreprise »
// dans le profil du CV (expérience commencée en décembre 2023 : vrai avant comme après décembre 2026).
// Par défaut, simulation (avant / après). Avec --appliquer, écriture, après une sauvegarde (npm run db:backup).
// Usage : npx tsx scripts/maj-cv-pres-de-3-ans.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const AVANT = "dont 3 ans en entreprise";
const APRES = "dont près de 3 ans en entreprise";
const row = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(row.data) as unknown as { profilEssentiel: string };
if (!profil.profilEssentiel.includes(AVANT)) {
  console.error("Texte attendu introuvable : rien n'est écrit.", profil.profilEssentiel);
  process.exit(1);
}
const apres = profil.profilEssentiel.replace(AVANT, APRES);
console.log(`Avant : ${profil.profilEssentiel}\nAprès : ${apres}`);
profil.profilEssentiel = apres;
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.singleton.update({ where: { key: "profil" }, data: { data: profil as never } });
console.log("Écrit.");
process.exit(0);
