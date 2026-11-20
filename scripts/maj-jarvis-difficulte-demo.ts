// 20 nov. 2026 : la difficulté sur le compte de démo de J.A.R.V.I.S, réécrite à la demande de Clara (même fond,
// même ton que le reste du bloc, à la première personne, sans paragraphe à part, sans rien retirer d'important).
// La base est partagée avec le site en ligne : par défaut, simulation. Avec --appliquer : écriture, après une
// sauvegarde (npm run db:backup) ; puis régénérer les pages (commit poussé sur main).
// Usage : npx tsx scripts/maj-jarvis-difficulte-demo.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const AVANT = "\n\nOuvrir un compte de démo public sans risque : tout se parcourt, mais rien ne se modifie, même en contournant l'interface (écritures ignorées côté serveur, IA et banque coupées).";
const APRES = " J'ai aussi voulu ouvrir une démo publique sans risque : on peut tout y parcourir, mais rien ne se modifie, même en contournant l'interface, car les écritures sont ignorées côté serveur. L'IA et la banque y sont coupées, les données fictives sont recréées chaque nuit, et ce compte ne touche jamais aux autres : il ne prend aucune part des crédits IA et les tâches de nuit l'ignorent.";

type Retour = { difficultes: string; appris: string; ameliorations: string };
const p = await prisma.project.findUniqueOrThrow({ where: { id: "jarvis" }, select: { retour: true } });
const retour = structuredClone(p.retour) as Retour;
if (retour.difficultes.endsWith(APRES)) {
  console.log("Déjà à jour.");
  process.exit(0);
}
if (!retour.difficultes.endsWith(AVANT)) {
  console.error("Texte actuel différent de celui attendu : rien n'est écrit.");
  process.exit(1);
}
retour.difficultes = retour.difficultes.slice(0, -AVANT.length) + APRES;
console.log(`Après (${retour.difficultes.length} caractères) :\n${retour.difficultes}`);
if (!process.argv.includes("--appliquer")) {
  console.log("\nSimulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.project.update({ where: { id: "jarvis" }, data: { retour: retour as never } });
console.log("\nÉcrit.");
process.exit(0);
