// 20 nov. 2026 : J.A.R.V.I.S a un compte de démo public (données fictives, rien n'est enregistré).
// Le champ « site » de la fiche reçoit la page de connexion : bouton « Essayer la démo ↗ ». Adresse donnée par Clara.
// La base est partagée avec le site en ligne : par défaut, simulation (avant / après). Avec --appliquer,
// écriture, après une sauvegarde (npm run db:backup). Rien n'est écrit si le champ n'est pas vide.
// Usage : npx tsx scripts/maj-jarvis-demo.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const APRES = "https://jarvis.clarabernadou.fr/connexion";

const p = await prisma.project.findUniqueOrThrow({ where: { id: "jarvis" }, select: { site: true } });
if (p.site === APRES) {
  console.log("Déjà à jour.");
  process.exit(0);
}
if (p.site) {
  console.error("Le champ « site » n'est pas vide : rien n'est écrit.", p.site);
  process.exit(1);
}
console.log(`Avant : (vide)\nAprès : ${APRES}`);
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.project.update({ where: { id: "jarvis" }, data: { site: APRES } });
console.log("Écrit.");
process.exit(0);
