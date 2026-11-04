// Quatrième passage des relecteurs du CV (RH, manager, logiciel de tri), sur le CV d'origine remis en place
// le 4 nov. 2026 au soir, avec les réponses de Clara : textes stockés en base.
// La base est partagée avec le site en ligne : par défaut, le script affiche seulement les changements
// (avant / après). Avec --appliquer, il les écrit, après une sauvegarde (npm run db:backup).
// Chaque valeur n'est remplacée que si elle est exactement celle attendue : sinon, rien n'est écrit.
// Avec --apercu-cv <dossier>, il génère les deux CV en PDF avec les nouvelles données, sans rien écrire.
// Usage : npx tsx scripts/maj-cv-relecteurs-4.ts [--appliquer | --apercu-cv <dossier>]
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

// ── Profil : titre full-stack (choix de Clara), accroche de 2 à 3 lignes, lieu en français, anglais B1 à l'oral ──
type Profil = Record<string, unknown> & { intitule: string; lieu: string; profilEssentiel: string; noteIA: string; langues: { nom: string; niveau: string[] }[] };
const rowProfil = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(rowProfil.data) as unknown as Profil;
profil.intitule = reecrire("Profil · intitulé", profil.intitule, "Développeuse front-end & UI/UX designer", "Développeuse full-stack");
profil.lieu = reecrire("Profil · lieu", profil.lieu, "Full remote ou Vannes / Auray", "Télétravail ou sur site à Vannes / Auray");
// L'IA n'est plus dans l'accroche : elle est démontrée dans l'expérience Fruggr.
profil.profilEssentiel = reecrire(
  "Profil · résumé du CV",
  profil.profilEssentiel,
  "Développeuse front-end et UI/UX designer, je conçois et développe des applications web : architecture de l'information, maquettes et prototypes accessibles, puis développement en JavaScript et TypeScript, côté front-end avec React et côté back-end quand le projet le demande. Diplômée d'un Bac+5 en développement logiciel, actuellement en formation UX Design, avec 2 expériences en alternance sur des plateformes SaaS depuis décembre 2023. J'intègre l'IA à mon travail quotidien pour développer, concevoir et automatiser les tâches récurrentes.",
  "Développeuse full-stack, je conçois et développe des applications web accessibles, de la maquette Figma à la mise en production : front-end en React, Next.js et TypeScript, évolutions back-end en NestJS. Bac+5 en développement logiciel, 3 ans d’alternance sur deux plateformes SaaS, formation UX Design en cours.",
);
const anglais = profil.langues.find((l) => l.nom === "Anglais");
if (!anglais) erreurs.push("Profil · langue Anglais introuvable");
else anglais.niveau = reecrire("Profil · anglais", anglais.niveau, ["Lecture et écrit : C1", "Compréhension orale : bonne", "Expression orale : en progression"], ["Lecture et écriture : C1", "Compréhension et expression orales : B1"]);
// Profil pour l'IA de l'administration : mêmes faits que le CV (tests unitaires chez CarbonScore seulement).
profil.noteIA = remplacer("Profil · profil pour l’IA", profil.noteIA, "Clara Bernadou, développeuse front-end & UI/UX designer. Cherche un CDI à partir de mars 2027, en full remote ou à Vannes / Auray.", "Clara Bernadou, développeuse full-stack (l'UI/UX est un point fort, pas le titre). Cherche un CDI à partir de mars 2027, en télétravail ou sur site à Vannes / Auray.");
profil.noteIA = remplacer("Profil · profil pour l’IA", profil.noteIA, "back-end NestJS et PostgreSQL ;", "back-end NestJS et PostgreSQL, tests unitaires ;");
profil.noteIA = remplacer("Profil · profil pour l’IA", profil.noteIA, "évolutions back-end ponctuelles en NestJS et MongoDB, tests unitaires, relecture de code", "évolutions back-end ponctuelles en NestJS et MongoDB (routes d'API, gestion des données), relecture de code");

// ── Expériences : verbes d'action, puces plus courtes, mois en toutes lettres ──
type Bloc = { name?: string; period?: string; bulletsEssentiel: string[] };
const fruggr = await prisma.experience.findFirstOrThrow({ where: { entreprise: "Fruggr" } });
const blocsFruggr = structuredClone(fruggr.blocs) as unknown as Bloc[];
const bloc = (blocs: Bloc[], name: string | undefined) => blocs.find((b) => b.name === name);
const puces = (ou: string, b: Bloc | undefined, attendu: string[], apres: string[]) => {
  if (!b) erreurs.push(`${ou} : bloc introuvable`);
  else b.bulletsEssentiel = reecrire(ou, b.bulletsEssentiel, attendu, apres);
};
puces(
  "Fruggr · équipe Produit",
  bloc(blocsFruggr, "Équipe Produit"),
  [
    "Développement front-end en React et TypeScript de la plateforme : 75 pull requests fusionnées en 15 mois (fonctionnalités, refontes, corrections)",
    "Refontes transverses, de la maquette Figma jusqu'au code : barre de navigation, page d'accueil par offre et tableaux de bord",
    "Évolutions sur les modules de la plateforme : gouvernance de l’IA (crédits IA, audit SGQRI 008), accessibilité (déclaration d’accessibilité, critères RGAA), ESG-IT, Parc IT (matériel reconditionné, inventaire), Services et Infra (passage à la nouvelle charte UI)",
    "Reprise du design UI/UX de la plateforme, seule designer de l’équipe Produit sous la supervision du PO : maquettes et évolutions sur Figma, ateliers de conception",
    "Évolutions back-end ponctuelles en NestJS et MongoDB ; tests unitaires, relecture de code, déploiements de la préproduction à la production (Azure)",
  ],
  [
    "Développé en React et TypeScript des fonctionnalités, des refontes et des corrections de la plateforme : 75 pull requests fusionnées en 15 mois",
    "Conçu et développé les refontes transverses, de la maquette Figma au code : barre de navigation, page d’accueil par offre et tableaux de bord",
    "Fait évoluer les modules de la plateforme : gouvernance de l’IA, accessibilité (déclaration d’accessibilité, critères RGAA), ESG-IT, Parc IT, Services et Infra",
    "Repris le design UI/UX de la plateforme, seule designer de l’équipe Produit sous la supervision du PO : maquettes et évolutions sur Figma, ateliers de conception",
    "Réalisé des évolutions back-end ponctuelles en NestJS et MongoDB (routes d’API, gestion des données jusqu’au front-end) ; relu du code, déployé de la préproduction à la production (Azure)",
  ],
);
puces(
  "Fruggr · équipe Marketing",
  bloc(blocsFruggr, "Équipe Marketing : développement web et contenus"),
  [
    "Développement du thème WordPress du site Fruggr : 9 nouveaux blocs sur mesure (frise, cartes, bannières, FAQ, cas clients), pied de page et type de contenu « ressource » ; 23 pull requests depuis juillet 2026",
    "Nouveau site WordPress de Digital4Better : maquettes Figma et mise en page complète",
    "Audits UI/UX, accessibilité (WCAG, RGAA) et SEO technique de sites, avec recommandations priorisées ; correction des erreurs et avertissements relevés par Semrush",
    "Participation au repositionnement de Fruggr : saga de 3 films bilingues réalisée de A à Z, du script validé au rendu (Remotion en React, voix off ElevenLabs)",
  ],
  [
    "Développé le thème WordPress du site Fruggr : 9 nouveaux blocs sur mesure, pied de page et type de contenu « ressource » ; 23 pull requests depuis juillet 2026",
    "Conçu le nouveau site WordPress de Digital4Better : maquettes Figma et mise en page complète",
    "Audité l’UI/UX, l’accessibilité (WCAG, RGAA) et le SEO technique de sites, avec des recommandations priorisées ; corrigé les erreurs et avertissements relevés par Semrush",
    "Réalisé de A à Z une saga de 3 films bilingues pour le repositionnement de Fruggr, du script validé au rendu (Remotion en React, voix off ElevenLabs)",
  ],
);
// Le gain de temps n'est pas mesuré : « estimé » (accord de Clara, avec prudence).
puces(
  "Fruggr · transverse",
  bloc(blocsFruggr, "Transverse : automatisation par l’IA"),
  ["Création de 6 skills Claude pour automatiser des tâches récurrentes de mon poste (visuels LinkedIn, intégration d’articles WordPress, audits de sites), proposés à l’équipe"],
  ["Créé 6 skills Claude qui automatisent des tâches récurrentes de mon poste (visuels LinkedIn, intégration d’articles WordPress, audits de sites), proposés à l’équipe ; gain de temps estimé à plusieurs heures par jour"],
);
const carbon = await prisma.experience.findFirstOrThrow({ where: { entreprise: "CarbonScore" } });
const periodeCarbon = reecrire("CarbonScore · période", carbon.periode, "déc. 2023 – fév. 2025", "décembre 2023 – février 2025");
const blocsCarbon = structuredClone(carbon.blocs) as unknown as Bloc[];
puces(
  "CarbonScore",
  blocsCarbon[0],
  [
    "Au sein d’une équipe produit de 4 personnes, interventions sur l’ensemble de la plateforme : page d’accueil, tableau de bord, gamification, FAQ et page profil",
    "Modules de quiz et de formations : intégration de nouveaux quiz et de nouvelles formations, mise en page des contenus",
    "Évolution continue du design de la plateforme sur Figma, puis intégration en Vue.js (Vuetify, Pinia) et TypeScript ; back-end NestJS et PostgreSQL",
    "Méthode agile (dailies, tickets Jira, documentation Confluence), sur des environnements personnels, de préproduction et de production",
    "Présentation de CarbonScore au salon VivaTech, en représentant TechUpClimate",
  ],
  [
    "Au sein d’une équipe produit de 4 personnes, développé des évolutions sur l’ensemble de la plateforme (page d’accueil, tableau de bord, gamification, FAQ, page profil) et intégré de nouveaux quiz et de nouvelles formations",
    "Fait évoluer le design de la plateforme sur Figma, puis intégré les maquettes en Vue.js (Vuetify, Pinia) et TypeScript",
    "Réalisé des évolutions back-end en NestJS et PostgreSQL (routes d’API, gestion des données) ; écrit des tests unitaires",
    "Travaillé en méthode agile (dailies, tickets Jira, documentation Confluence), des environnements personnels à la production",
    "Présenté CarbonScore au salon VivaTech, en représentant TechUpClimate",
  ],
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
  Object.assign(prisma.experience, {
    findMany: async (a: never) => (await lireExp(a)).map((e) => (e.id === fruggr.id ? { ...e, blocs: blocsFruggr } : e.id === carbon.id ? { ...e, periode: periodeCarbon, blocs: blocsCarbon } : e)),
  });
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
  prisma.experience.update({ where: { id: carbon.id }, data: { periode: periodeCarbon, blocs: blocsCarbon as never } }),
]);
console.log("Changements écrits en base.");
await prisma.$disconnect();
