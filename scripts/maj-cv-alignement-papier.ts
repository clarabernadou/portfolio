// 20 nov. 2026 (décisions de Clara) : le CV du site aligné sur le CV papier.
// - Compétences IA : 6 skills (ceux présentés sur /ia), au lieu de 9.
// - Puce des 75 pull requests (bloc « Équipe produit ») : sans « sur Fruggr et CarbonScore ».
// - Chiffre clé de l'accueil : les 22 fonctionnalités sont « majeures » (les 75 PR, toutes livrées en autonomie).
// - Compétences : seulement celles du CV papier (ni MUI, ni SQL, ni GitHub, ni Azure Functions, ni revues de code,
//   ni critères d'acceptation, ni maquettes, ni tri de cartes) ; « Tests unitaires et de non-régression » en un
//   seul élément, comme sur le papier. Aucun groupe supprimé.
// Par défaut, simulation (avant / après). Avec --appliquer, écriture, après une sauvegarde (npm run db:backup).
// Rien n'est écrit si une valeur actuelle n'est pas celle attendue.
// Usage : npx tsx scripts/maj-cv-alignement-papier.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const erreurs: string[] = [];
const changements: string[] = [];
const remplacer = (ou: string, actuel: string, avant: string, apres: string) => {
  if (!actuel.includes(avant)) {
    erreurs.push(`${ou} : texte attendu introuvable (« ${avant} »)`);
    return actuel;
  }
  changements.push(`${ou}\n  avant : ${actuel}\n  après : ${actuel.replace(avant, apres)}`);
  return actuel.replace(avant, apres);
};

// Profil : compétences IA et chiffre clé
type Profil = { competencesIa: string[]; chiffreCle?: { valeur: string; libelle: string } };
const rowProfil = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(rowProfil.data) as unknown as Profil;
const iSkills = profil.competencesIa.findIndex((c) => c.includes("skills créés et maintenus"));
if (iSkills < 0) erreurs.push("Compétences IA : ligne des skills introuvable");
else profil.competencesIa[iSkills] = remplacer("Compétences IA · skills", profil.competencesIa[iSkills], "**9 skills créés", "**6 skills créés");
if (profil.chiffreCle) profil.chiffreCle.libelle = remplacer("Accueil · chiffre clé", profil.chiffreCle.libelle, "dont 22 fonctionnalités en autonomie", "dont 22 fonctionnalités majeures");
else erreurs.push("Chiffre clé introuvable");

// Expérience Fruggr : puce des pull requests
type Bloc = { name?: string; bulletsEssentiel: string[] };
const fruggr = await prisma.experience.findFirstOrThrow({ where: { entreprise: "Fruggr" } });
const blocs = structuredClone(fruggr.blocs) as unknown as Bloc[];
let trouve = false;
for (const b of blocs)
  b.bulletsEssentiel = b.bulletsEssentiel.map((p) => {
    if (!p.startsWith("**75 pull requests mergées**")) return p;
    trouve = true;
    return remplacer("Fruggr · puce des PR", p, " en 15 mois sur Fruggr et CarbonScore,", " en 15 mois,");
  });
if (!trouve) erreurs.push("Fruggr : puce des 75 pull requests introuvable");

// Compétences : alignées sur le CV papier
const CIBLE: Record<string, { avant: string[]; apres: string[] }> = {
  Technologies: {
    avant: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "NestJS", "Vue.js", "GraphQL", "MUI", "Tailwind CSS", "MongoDB", "PostgreSQL", "MySQL", "SQL", "Prisma"],
    apres: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "NestJS", "Vue.js", "GraphQL", "Tailwind CSS", "MongoDB", "PostgreSQL", "MySQL", "Prisma"],
  },
  "Tests et qualité": {
    avant: ["Jest", "Playwright", "Vitest", "Tests unitaires (TU)", "Tests de non-régression (TNR)", "Accessibilité RGAA", "Écoconception RGESN"],
    apres: ["Jest", "Playwright", "Vitest", "Tests unitaires et de non-régression", "Accessibilité RGAA", "Écoconception RGESN"],
  },
  Méthodes: { avant: ["Agile Scrum", "Revues de code", "Critères d’acceptation"], apres: ["Agile Scrum"] },
  "Outils et cloud": { avant: ["Git", "GitHub", "GitHub Actions", "Azure DevOps", "Azure Functions", "Docker"], apres: ["Git", "GitHub Actions", "Azure DevOps", "Docker"] },
  Design: { avant: ["Figma", "Maquettes", "Wireframes", "Prototypage", "Design system", "Tri de cartes", "Audits UX"], apres: ["Figma", "Wireframes", "Prototypage", "Design system", "Audits UX"] },
};
const groupes = await prisma.skillGroup.findMany();
const majGroupes: { id: number; items: string[]; name?: string }[] = [];
for (const [nom, { avant, apres }] of Object.entries(CIBLE)) {
  const g = groupes.find((x) => x.name === nom);
  if (!g) {
    erreurs.push(`Compétences : groupe « ${nom} » introuvable`);
    continue;
  }
  if (JSON.stringify(g.items) !== JSON.stringify(avant)) {
    erreurs.push(`Compétences « ${nom} » : contenu actuel différent de celui attendu`);
    continue;
  }
  // « Outils et cloud » n'a plus d'outil cloud : il devient « Outils ».
  const name = nom === "Outils et cloud" ? "Outils" : undefined;
  changements.push(`Compétences « ${nom} »${name ? ` → « ${name} »` : ""}\n  retirés : ${avant.filter((x) => !apres.includes(x)).join(", ") || "aucun"}\n  ajoutés : ${apres.filter((x) => !avant.includes(x)).join(", ") || "aucun"}`);
  majGroupes.push({ id: g.id, items: apres, ...(name ? { name } : {}) });
}

console.log(changements.join("\n\n"));
if (erreurs.length) {
  console.error(`\nRien n'est écrit :\n- ${erreurs.join("\n- ")}`);
  process.exit(1);
}
if (!process.argv.includes("--appliquer")) {
  console.log("\nSimulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.$transaction([
  prisma.singleton.update({ where: { key: "profil" }, data: { data: profil as never } }),
  prisma.experience.update({ where: { id: fruggr.id }, data: { blocs: blocs as never } }),
  ...majGroupes.map((g) => prisma.skillGroup.update({ where: { id: g.id }, data: { items: g.items as never, ...(g.name ? { name: g.name } : {}) } })),
]);
console.log("\nÉcrit.");
process.exit(0);
