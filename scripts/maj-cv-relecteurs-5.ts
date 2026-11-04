// Cinquième passage des relecteurs du CV (RH, manager, logiciel de tri), 4 nov. 2026, avec les réponses de
// Clara : « Développeuse Full-Stack » (majuscules, comme les intitulés de poste), puces Fruggr regroupées,
// accroche sans redite, mention du diplôme américain raccourcie. Textes stockés en base.
// La base est partagée avec le site en ligne : par défaut, le script affiche seulement les changements
// (avant / après). Avec --appliquer, il les écrit, après une sauvegarde (npm run db:backup).
// Chaque valeur n'est remplacée que si elle est exactement celle attendue : sinon, rien n'est écrit.
// Avec --apercu-cv <dossier>, il génère les deux CV en PDF avec les nouvelles données, sans rien écrire.
// Usage : npx tsx scripts/maj-cv-relecteurs-5.ts [--appliquer | --apercu-cv <dossier>]
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

function remplacer(ou: string, texte: string, avant: string, apres: string): string {
  if (!texte.includes(avant)) {
    erreurs.push(`${ou} : texte attendu introuvable « ${avant.slice(0, 80)} »`);
    return texte;
  }
  changements.push({ ou, avant, apres });
  return texte.replace(avant, apres);
}

// ── Profil : même casse que les intitulés de poste, accroche sans redite (Figma est dans l'expérience) ──
type Profil = Record<string, unknown> & { intitule: string; profilEssentiel: string; noteIA: string };
const rowProfil = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(rowProfil.data) as unknown as Profil;
profil.intitule = reecrire("Profil · intitulé", profil.intitule, "Développeuse full-stack", "Développeuse Full-Stack");
profil.profilEssentiel = reecrire(
  "Profil · résumé du CV",
  profil.profilEssentiel,
  "Développeuse full-stack, je conçois et développe des applications web accessibles, de la maquette Figma à la mise en production : front-end en React, Next.js et TypeScript, évolutions back-end en NestJS. Bac+5 en développement logiciel, 3 ans d’alternance sur deux plateformes SaaS, formation UX Design en cours.",
  "Développeuse Full-Stack, je conçois et développe des applications web accessibles jusqu’à la mise en production : front-end en React, Next.js et TypeScript, évolutions back-end en NestJS. 3 ans d’alternance sur deux plateformes SaaS, Bac+5 en développement logiciel.",
);
profil.noteIA = remplacer("Profil · profil pour l’IA", profil.noteIA, "Clara Bernadou, développeuse full-stack (l'UI/UX", "Clara Bernadou, développeuse Full-Stack (l'UI/UX");

// ── Fruggr : 3 à 4 puces par équipe, sans détail superflu ──
type Bloc = { name?: string; period?: string; bulletsEssentiel: string[] };
const fruggr = await prisma.experience.findFirstOrThrow({ where: { entreprise: "Fruggr" } });
const blocsFruggr = structuredClone(fruggr.blocs) as unknown as Bloc[];
const puces = (ou: string, b: Bloc | undefined, attendu: string[], apres: string[]) => {
  if (!b) erreurs.push(`${ou} : bloc introuvable`);
  else b.bulletsEssentiel = reecrire(ou, b.bulletsEssentiel, attendu, apres);
};
const BACK_FRUGGR = "Réalisé des évolutions back-end ponctuelles en NestJS et MongoDB (routes d’API, gestion des données jusqu’au front-end) ; relu du code, déployé de la préproduction à la production (Azure)";
const DESIGN_FRUGGR = "Repris le design UI/UX de la plateforme, seule designer de l’équipe Produit sous la supervision du PO : maquettes et évolutions sur Figma, ateliers de conception";
puces(
  "Fruggr · équipe Produit",
  blocsFruggr.find((b) => b.name === "Équipe Produit"),
  [
    "Développé en React et TypeScript des fonctionnalités, des refontes et des corrections de la plateforme : 75 pull requests fusionnées en 15 mois",
    "Conçu et développé les refontes transverses, de la maquette Figma au code : barre de navigation, page d’accueil par offre et tableaux de bord",
    "Fait évoluer les modules de la plateforme : gouvernance de l’IA, accessibilité (déclaration d’accessibilité, critères RGAA), ESG-IT, Parc IT, Services et Infra",
    DESIGN_FRUGGR,
    BACK_FRUGGR,
  ],
  [
    "Développé en React et TypeScript des fonctionnalités, des refontes et des corrections sur les modules de la plateforme (gouvernance de l’IA, accessibilité, ESG-IT, Parc IT, Services et Infra) : 75 pull requests fusionnées en 15 mois",
    "Conçu et développé les refontes transverses, de la maquette Figma au code : navigation, accueil par offre, tableaux de bord",
    DESIGN_FRUGGR,
    BACK_FRUGGR,
  ],
);
const AUDITS = "Audité l’UI/UX, l’accessibilité (WCAG, RGAA) et le SEO technique de sites, avec des recommandations priorisées ; corrigé les erreurs et avertissements relevés par Semrush";
puces(
  "Fruggr · équipe Marketing",
  blocsFruggr.find((b) => b.name === "Équipe Marketing : développement web et contenus"),
  [
    "Développé le thème WordPress du site Fruggr : 9 nouveaux blocs sur mesure, pied de page et type de contenu « ressource » ; 23 pull requests depuis juillet 2026",
    "Conçu le nouveau site WordPress de Digital4Better : maquettes Figma et mise en page complète",
    AUDITS,
    "Réalisé de A à Z une saga de 3 films bilingues pour le repositionnement de Fruggr, du script validé au rendu (Remotion en React, voix off ElevenLabs)",
  ],
  [
    "Développé le thème WordPress du site Fruggr (9 blocs sur mesure, pied de page, type de contenu « ressource », 23 pull requests depuis juillet 2026) et conçu le nouveau site WordPress de Digital4Better (maquettes Figma, mise en page)",
    AUDITS,
    "Réalisé de A à Z une saga de 3 films bilingues pour le repositionnement de Fruggr, du script validé au rendu (Remotion en React)",
  ],
);

// ── Formation Full Stack : mention du diplôme américain plus courte (site et CV) ──
const fullStack = await prisma.formation.findFirstOrThrow({ where: { intitule: "Full Stack - Java & Angular" } });
const mentionFullStack = reecrire(
  "Formation Full Stack · mention",
  fullStack.mentionComplementaire,
  "Diplôme américain également délivré par OpenClassrooms : Master’s degree in Computer Software Development",
  "Master’s degree in Computer Software Development (diplôme américain)",
);

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
  const lireForm = prisma.formation.findMany.bind(prisma.formation);
  Object.assign(prisma.formation, { findMany: async (a: never) => (await lireForm(a)).map((f) => (f.id === fullStack.id ? { ...f, mentionComplementaire: mentionFullStack } : f)) });
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
  prisma.formation.update({ where: { id: fullStack.id }, data: { mentionComplementaire: mentionFullStack } }),
]);
console.log("Changements écrits en base.");
await prisma.$disconnect();
