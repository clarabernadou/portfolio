// 20 nov. 2026 : J.A.R.V.I.S a un compte de démo public (données fictives, rien n'est enregistré).
// Le champ « site » de la fiche reçoit la page de connexion : bouton « Essayer la démo ↗ ». Adresse donnée par Clara.
// Le contexte se termine par les identifiants de démo (publics, propres à la démo ; texte validé par Clara).
// La base est partagée avec le site en ligne : par défaut, simulation (avant / après). Avec --appliquer,
// écriture, après une sauvegarde (npm run db:backup). Rien n'est écrit si le site n'est pas vide
// ou si le contexte n'est pas celui attendu.
// Usage : npx tsx scripts/maj-jarvis-demo.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const SITE = "https://jarvis.clarabernadou.fr/connexion";
const CONTEXTE_AVANT = "Projet personnel, mené seule. J.A.R.V.I.S est une application web installable (PWA), conçue d'abord pour le téléphone : un portail qui réunit 5 mini-applications du quotidien, avec un design system commun. Je l'ai créée pour répondre à mes propres besoins et je l'utilise au quotidien. Développée avec Claude Code : j'écris les spécifications et les prompts, je pilote et je valide.";
const CONTEXTE_APRES = `${CONTEXTE_AVANT} Une démo est ouverte, avec des données fictives : identifiant demo@jarvis.example, mot de passe demo-jarvis-portfolio. Tout se parcourt, mais rien n'est enregistré et l'IA est coupée.`;

const p = await prisma.project.findUniqueOrThrow({ where: { id: "jarvis" }, select: { site: true, context: true } });
if (p.site === SITE && p.context === CONTEXTE_APRES) {
  console.log("Déjà à jour.");
  process.exit(0);
}
if (p.site || p.context !== CONTEXTE_AVANT) {
  console.error("Site ou contexte différent de celui attendu : rien n'est écrit.", p.site, p.context);
  process.exit(1);
}
console.log(`Site — avant : (vide)\nSite — après : ${SITE}\nContexte — avant : ${CONTEXTE_AVANT}\nContexte — après : ${CONTEXTE_APRES}`);
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.project.update({ where: { id: "jarvis" }, data: { site: SITE, context: CONTEXTE_APRES } });
console.log("Écrit.");
process.exit(0);
