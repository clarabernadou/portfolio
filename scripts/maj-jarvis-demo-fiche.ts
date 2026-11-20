// 20 nov. 2026 : le compte de démo de J.A.R.V.I.S dans sa fiche (validé par Clara) : une difficulté (version
// courte, en paragraphe à part), une compétence validée, les étiquettes Better Auth et Vitest (citées dans le
// document du compte de démo). Et une faute corrigée dans le contexte de FishEye (« particuliere »).
// La base est partagée avec le site en ligne : par défaut, simulation. Avec --appliquer : écriture, après une
// sauvegarde (npm run db:backup) ; puis régénérer les pages (commit vide poussé sur main).
// Usage : npx tsx scripts/maj-jarvis-demo-fiche.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const DIFFICULTE = "Ouvrir un compte de démo public sans risque : tout se parcourt, mais rien ne se modifie, même en contournant l'interface (écritures ignorées côté serveur, IA et banque coupées).";
const COMPETENCE = "Sécurisation d'un compte de démo public";
const TAGS = ["Better Auth", "Vitest"];

type Retour = { difficultes: string; appris: string; ameliorations: string };
const j = await prisma.project.findUniqueOrThrow({ where: { id: "jarvis" }, select: { retour: true, skillsValidated: true, tags: true } });
const retour = structuredClone(j.retour) as Retour;
const skills = j.skillsValidated as string[];
const tags = j.tags as string[];

const f = await prisma.project.findUniqueOrThrow({ where: { id: "fisheye" }, select: { context: true } });
const FAUTE = "sans dépendance particuliere";
const contexteFisheye = f.context.replace(FAUTE, "sans dépendance particulière");

const changements: string[] = [];
if (!retour.difficultes.includes(DIFFICULTE)) {
  retour.difficultes = `${retour.difficultes.trim()}\n\n${DIFFICULTE}`;
  changements.push(`Difficultés (${retour.difficultes.length} caractères) :\n${retour.difficultes}`);
}
const skillsApres = skills.includes(COMPETENCE) ? skills : [...skills, COMPETENCE];
if (skillsApres !== skills) changements.push(`Compétence ajoutée : ${COMPETENCE}`);
const tagsApres = [...tags, ...TAGS.filter((t) => !tags.includes(t))];
if (tagsApres.length !== tags.length) changements.push(`Étiquettes : ${tagsApres.join(", ")}`);
if (contexteFisheye !== f.context) changements.push(`FishEye : « ${FAUTE} » → « sans dépendance particulière »`);

if (!changements.length) {
  console.log("Déjà à jour.");
  process.exit(0);
}
console.log(changements.join("\n\n"));
if (!process.argv.includes("--appliquer")) {
  console.log("\nSimulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.project.update({ where: { id: "jarvis" }, data: { retour: retour as never, skillsValidated: skillsApres as never, tags: tagsApres as never } });
if (contexteFisheye !== f.context) await prisma.project.update({ where: { id: "fisheye" }, data: { context: contexteFisheye } });
console.log("\nÉcrit.");
process.exit(0);
