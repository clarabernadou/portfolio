// Sixième passage des relecteurs du CV (RH, manager, logiciel de tri), 4 nov. 2026 : l'UI/UX et l'IA
// reviennent dans l'accroche avec le nombre de pull requests, puces Fruggr plus courtes, puce des skills
// Claude sans sous-titre. Textes stockés en base.
// La base est partagée avec le site en ligne : par défaut, le script affiche seulement les changements
// (avant / après). Avec --appliquer, il les écrit, après une sauvegarde (npm run db:backup).
// Chaque valeur n'est remplacée que si elle est exactement celle attendue : sinon, rien n'est écrit.
// Avec --apercu-cv <dossier>, il génère les deux CV en PDF avec les nouvelles données, sans rien écrire.
// Usage : npx tsx scripts/maj-cv-relecteurs-6.ts [--appliquer | --apercu-cv <dossier>]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

type Changement = { ou: string; avant: unknown; apres: unknown };
const changements: Changement[] = [];
const erreurs: string[] = [];
const stable = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${k}:${stable((v as Record<string, unknown>)[k])}`).join(",")}}` : JSON.stringify(v);
function reecrire<T>(ou: string, actuel: T, attendu: T, apres: T): T {
  if (stable(actuel) !== stable(attendu)) {
    erreurs.push(`${ou} : valeur actuelle différente de celle attendue`);
    return actuel;
  }
  changements.push({ ou, avant: actuel, apres });
  return apres;
}

// ── Profil : l'UI/UX, l'accessibilité et l'IA dans l'accroche (adéquation au poste « Développeur Designer »),
// le back-end calibré comme dans les expériences (ponctuel), un chiffre dès le début ──
type Profil = Record<string, unknown> & { profilEssentiel: string };
const rowProfil = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(rowProfil.data) as unknown as Profil;
profil.profilEssentiel = reecrire(
  "Profil · résumé du CV",
  profil.profilEssentiel,
  "Développeuse Full-Stack, je conçois et développe des applications web accessibles jusqu’à la mise en production : front-end en React, Next.js et TypeScript, évolutions back-end en NestJS. 3 ans d’alternance sur deux plateformes SaaS, Bac+5 en développement logiciel.",
  "Développeuse Full-Stack, je conçois et développe des applications web accessibles (WCAG, RGAA), du design UI/UX au front-end en React, Next.js et TypeScript, avec des évolutions back-end ponctuelles en NestJS. 3 ans d’alternance sur deux plateformes SaaS, plus de 95 pull requests fusionnées chez Fruggr, et l’IA au quotidien (6 skills Claude).",
);

// ── Fruggr : puces plus courtes, skills Claude sans sous-titre « Transverse » ──
type Bloc = { name?: string; period?: string; bulletsEssentiel: string[] };
const fruggr = await prisma.experience.findFirstOrThrow({ where: { entreprise: "Fruggr" } });
const blocsFruggr = structuredClone(fruggr.blocs) as unknown as Bloc[];
const puce = (ou: string, b: Bloc | undefined, avant: string, apres: string) => {
  const i = b ? b.bulletsEssentiel.indexOf(avant) : -1;
  if (!b || i < 0) erreurs.push(`${ou} : puce introuvable`);
  else b.bulletsEssentiel[i] = reecrire(ou, avant, avant, apres);
};
const produit = blocsFruggr.find((b) => b.name === "Équipe Produit");
puce(
  "Fruggr · puce des modules",
  produit,
  "Développé en React et TypeScript des fonctionnalités, des refontes et des corrections sur les modules de la plateforme (gouvernance de l’IA, accessibilité, ESG-IT, Parc IT, Services et Infra) : 75 pull requests fusionnées en 15 mois",
  "Développé en React et TypeScript des fonctionnalités, des refontes et des corrections sur les modules cœur de la plateforme (gouvernance de l’IA, accessibilité, ESG-IT) : 75 pull requests fusionnées en 15 mois",
);
puce(
  "Fruggr · puce des refontes",
  produit,
  "Conçu et développé les refontes transverses, de la maquette Figma au code : navigation, accueil par offre, tableaux de bord",
  "Conçu et développé, de la maquette Figma au code, la refonte de l’expérience utilisateur de la plateforme : navigation, accueil par offre, tableaux de bord",
);
puce(
  "Fruggr · puce WordPress",
  blocsFruggr.find((b) => b.name === "Équipe Marketing : développement web et contenus"),
  "Développé le thème WordPress du site Fruggr (9 blocs sur mesure, pied de page, type de contenu «\u00a0ressource\u00a0», 23 pull requests depuis juillet 2026) et conçu le nouveau site WordPress de Digital4Better (maquettes Figma, mise en page)",
  "Construit le thème WordPress du site Fruggr (9 blocs sur mesure, 23 pull requests) et conçu le nouveau site de Digital4Better (maquettes Figma, mise en page)",
);
const transverse = blocsFruggr.find((b) => b.name === "Transverse : automatisation par l’IA");
if (!transverse) erreurs.push("Fruggr · bloc Transverse introuvable");
else {
  changements.push({ ou: "Fruggr · sous-titre du bloc des skills Claude", avant: transverse.name, apres: "(aucun)" });
  delete transverse.name;
}

// ── Rapport et écriture ───────────────────────────────────────────────────────
const court = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v));
for (const c of changements) console.log(`\n■ ${c.ou}\n  avant : ${court(c.avant)}\n  après : ${court(c.apres)}`);
console.log(`\n${changements.length} changements.`);
if (erreurs.length) {
  console.log(`\n${erreurs.length} erreur(s) : rien n'est écrit.\n${erreurs.join("\n")}`);
  process.exit(1);
}
if (process.argv.includes("--apercu-cv")) {
  const dossier = process.argv[process.argv.indexOf("--apercu-cv") + 1];
  const { writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  // Mêmes lectures que le site, avec les valeurs modifiées (aucune écriture).
  const lireSingleton = prisma.singleton.findUnique.bind(prisma.singleton);
  Object.assign(prisma.singleton, { findUnique: async (a: { where: { key: string } }) => (a.where.key === "profil" ? { ...rowProfil, data: profil } : lireSingleton(a as never)) });
  const lireExp = prisma.experience.findMany.bind(prisma.experience);
  Object.assign(prisma.experience, { findMany: async (a: never) => (await lireExp(a)).map((e) => (e.id === fruggr.id ? { ...e, blocs: blocsFruggr } : e)) });
  const { cvHtml, cvTexteHtml } = await import("../lib/pdf/cv-html");
  const { essentielFr } = await import("../lib/pdf/cv-data");
  const { loadAssets, loadSources, renderPdf } = await import("../lib/pdf/server");
  const [sources, assets] = await Promise.all([loadSources(), loadAssets()]);
  const doc = essentielFr(sources);
  for (const [nom, html] of [["CV_Clara_Bernadou_FR.pdf", cvHtml(doc, assets)], ["CV_Clara_Bernadou_FR_texte.pdf", cvTexteHtml(doc, assets)]]) {
    const { pdf, pages } = await renderPdf(html);
    await writeFile(path.join(dossier, nom), pdf);
    console.log(`Aperçu : ${path.join(dossier, nom)} (${pages} pages)`);
  }
  process.exit(0);
}
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.$transaction([
  prisma.singleton.update({ where: { key: "profil" }, data: { data: profil as never } }),
  prisma.experience.update({ where: { id: fruggr.id }, data: { blocs: blocsFruggr as never } }),
]);
console.log("Changements écrits en base.");
await prisma.$disconnect();
