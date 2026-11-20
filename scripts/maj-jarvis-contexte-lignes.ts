// 20 nov. 2026 : le contexte des fiches garde ses retours à la ligne (white-space: pre-line). Demande de Clara :
// les identifiants de la démo de J.A.R.V.I.S passent sur des lignes à part, avec un tiret.
// La base est partagée avec le site en ligne : par défaut, simulation (avant / après). Avec --appliquer,
// écriture, après une sauvegarde (npm run db:backup). Rien n'est écrit si le texte actuel n'est pas celui attendu.
// Usage : npx tsx scripts/maj-jarvis-contexte-lignes.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const DEBUT = "Projet personnel, mené seule. J.A.R.V.I.S est une application web installable (PWA), conçue d'abord pour le téléphone : un portail qui réunit 5 mini-applications du quotidien, avec un design system commun. Je l'ai créée pour répondre à mes propres besoins et je l'utilise au quotidien. Développée avec Claude Code : j'écris les spécifications et les prompts, je pilote et je valide.";
const AVANT = `${DEBUT} Une démo est ouverte, avec des données fictives : identifiant demo@jarvis.example, mot de passe demo-jarvis-portfolio. Tout se parcourt, mais rien n'est enregistré et l'IA est coupée.`;
const APRES = `${DEBUT}

Une démo est ouverte, avec des données fictives :
- Identifiant : demo@jarvis.example
- Mot de passe : demo-jarvis-portfolio
Tout se parcourt, mais rien n'est enregistré et l'IA est coupée.`;

const p = await prisma.project.findUniqueOrThrow({ where: { id: "jarvis" }, select: { context: true } });
if (p.context === APRES) {
  console.log("Déjà à jour.");
  process.exit(0);
}
if (p.context !== AVANT) {
  console.error("Texte actuel différent de celui attendu : rien n'est écrit.", p.context);
  process.exit(1);
}
console.log(`Avant :\n${AVANT}\n\nAprès :\n${APRES}`);
if (!process.argv.includes("--appliquer")) {
  console.log("\nSimulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.project.update({ where: { id: "jarvis" }, data: { context: APRES } });
console.log("Écrit.");
process.exit(0);
