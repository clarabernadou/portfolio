// 20 nov. 2026 (validé par Clara) : description de la skill « Miniatures YouTube » sur /ia, réécrite comme les
// autres skills (ce que fait la skill d'abord), sans « personnes détourées » (détail de fabrication).
// Par défaut, simulation (avant / après). Avec --appliquer, écriture, après une sauvegarde (npm run db:backup).
// Rien n'est écrit si la description actuelle n'est pas celle attendue.
// Usage : npx tsx scripts/maj-skill-youtube.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const AVANT = "Miniatures 1280×720 à la charte, avec personnes détourées, variantes A/B et contrôle de lisibilité.";
const APRES = "Produit des miniatures YouTube 1280×720 prêtes à publier, dans la charte de l’entreprise, avec des variantes A/B et un contrôle de lisibilité.";

type Skill = { name: string; description: string };
const row = await prisma.singleton.findUniqueOrThrow({ where: { key: "ia" } });
const ia = structuredClone(row.data) as unknown as { skills: Skill[] };
const skill = ia.skills.find((s) => s.name === "Miniatures YouTube");
if (!skill || skill.description !== AVANT) {
  console.error("Description actuelle différente de celle attendue : rien n'est écrit.", skill?.description);
  process.exit(1);
}
console.log(`Avant : ${AVANT}\nAprès : ${APRES}`);
skill.description = APRES;
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.singleton.update({ where: { key: "ia" }, data: { data: ia as never } });
console.log("Écrit.");
process.exit(0);
