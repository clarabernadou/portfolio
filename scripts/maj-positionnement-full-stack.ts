// Positionnement « développeuse full-stack » (demande de Clara, 4 nov. 2026), puis retours des relecteurs du CV
// (RH, manager, logiciel de tri, même jour) : textes stockés en base.
// La base est partagée avec le site en ligne : par défaut, le script affiche seulement les changements
// (avant / après). Avec --appliquer, il les écrit, après une sauvegarde (npm run db:backup).
// Chaque remplacement part du texte exact attendu : si la base a changé entre-temps, rien n'est écrit.
// Avec --apercu-cv <dossier>, il génère aussi les deux CV en PDF avec les nouvelles données, sans rien écrire
// en base (les lectures de la base sont remplacées en mémoire par les valeurs modifiées).
// Usage : npx tsx scripts/maj-positionnement-full-stack.ts [--appliquer | --apercu-cv <dossier>]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();
const appliquer = process.argv.includes("--appliquer");

type Changement = { ou: string; avant: unknown; apres: unknown };
const changements: Changement[] = [];
const erreurs: string[] = [];
function remplacer(ou: string, texte: string, avant: string, apres: string): string {
  if (!texte.includes(avant)) {
    erreurs.push(`${ou} : texte attendu introuvable « ${avant.slice(0, 80)} »`);
    return texte;
  }
  changements.push({ ou, avant, apres });
  return texte.replace(avant, apres);
}
function fixer<T>(ou: string, avant: T, apres: T): T {
  if (JSON.stringify(avant) !== JSON.stringify(apres)) changements.push({ ou, avant, apres });
  return apres;
}
// Remplace une valeur entière (liste de puces…) seulement si elle est exactement celle attendue.
// Comparaison indépendante de l'ordre des clés (la base les range à sa façon).
const stable = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${k}:${stable((v as Record<string, unknown>)[k])}`).join(",")}}` : JSON.stringify(v);
function reecrire<T>(ou: string, actuel: T, attendu: T, apres: T): T {
  if (stable(actuel) !== stable(attendu)) {
    erreurs.push(`${ou} : valeur actuelle différente de celle attendue`);
    return actuel;
  }
  return fixer(ou, actuel, apres);
}

// ── Profil et CV ──────────────────────────────────────────────────────────────
type Profil = Record<string, unknown> & {
  intitule: string;
  accroche: string;
  profilEssentiel: string;
  noteIA: string;
  chiffreCle: { valeur: string; libelle: string };
  langues: { nom: string; niveau: string[] }[];
  projetsCv: { titre: string; puces: string[] }[];
};
const rowProfil = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(rowProfil.data) as unknown as Profil;
profil.intitule = fixer("Profil · intitulé", profil.intitule, "Développeuse full-stack");
profil.accroche = fixer("Profil · accroche de l’accueil", profil.accroche, "Je conçois et développe des applications web accessibles (React, TypeScript, Node.js), de la maquette Figma à la mise en production.");
profil.profilEssentiel = fixer(
  "Profil · résumé du CV",
  profil.profilEssentiel,
  "Développeuse full-stack (React, TypeScript, Node.js), je conçois et développe des applications web accessibles, de la maquette Figma à la mise en production. Bac+5, en alternance depuis décembre 2023 sur deux plateformes SaaS ; l’IA fait partie de mon quotidien.",
);
profil.chiffreCle = fixer("Profil · chiffre clé de « En bref »", profil.chiffreCle, { valeur: "95+", libelle: "Plus de 95 pull requests fusionnées chez Fruggr" });
const anglais = profil.langues.find((l) => l.nom === "Anglais");
if (!anglais) erreurs.push("Profil · langue « Anglais » introuvable");
else anglais.niveau = reecrire("Profil · anglais", anglais.niveau, ["Lecture et écrit : C1", "Compréhension orale : bonne", "Expression orale : en progression"], ["Lecture et écriture : C1", "Compréhension et expression orales : B1"]);
// Retours des relecteurs du CV (RH, manager, logiciel de tri), 4 nov. 2026 : puces commençant par un verbe.
profil.disponibilite = fixer("Profil · disponibilité", profil.disponibilite as string, "disponible en mars 2027 (fin d’alternance)");
profil.lieu = fixer("Profil · lieu", profil.lieu, "Full remote (télétravail) ou Vannes / Auray");
const portfolioCv = profil.projetsCv.find((p) => p.titre === "Portfolio");
if (!portfolioCv) erreurs.push("Profil · projet du CV « Portfolio » introuvable");
else
  portfolioCv.puces = reecrire(
    "Profil · projet du CV « Portfolio », puces",
    portfolioCv.puces,
    [
      "Projet personnel mené seule de A à Z : charte graphique, architecture de l’information, wireframes, maquettes et prototype, puis développement et mise en ligne",
      "Next.js, TypeScript et Tailwind CSS ; base MySQL avec Prisma ; administration sur mesure réservée à mon compte GitHub (Auth.js)",
      "Synchronisation automatique des dépôts GitHub, CV en PDF généré depuis l’administration (Playwright), hébergement sur Vercel",
      "Accessibilité : Lighthouse 100 et 0 erreur axe sur les pages principales, audit RGAA des 106 critères",
    ],
    [
      "Conçu et développé seule, de A à Z : charte graphique, architecture de l’information, wireframes, maquettes et prototype, puis développement et mise en ligne",
      "Développé en Next.js, TypeScript et Tailwind CSS, avec une base MySQL (Prisma) et une administration sur mesure réservée à mon compte GitHub (Auth.js)",
      "Automatisé la synchronisation des dépôts GitHub et la génération du CV en PDF depuis l’administration (Playwright) ; hébergement sur Vercel",
      "Accessibilité : {{audit-rgaa}}",
    ],
  );
profil.noteIA = remplacer("Profil · profil pour l’IA", profil.noteIA, "Clara Bernadou, développeuse front-end & UI/UX designer.", "Clara Bernadou, développeuse full-stack, avec l’UI/UX comme point fort.");
profil.noteIA = remplacer("Profil · profil pour l’IA", profil.noteIA, "évolutions back-end ponctuelles en NestJS et MongoDB, tests unitaires, relecture de code", "évolutions back-end ponctuelles en NestJS et MongoDB (nouvelles routes d'API), relecture de code");
profil.noteIA = remplacer("Profil · profil pour l’IA", profil.noteIA, "back-end NestJS et PostgreSQL ;", "back-end NestJS et PostgreSQL, tests unitaires ;");

// ── Expériences ───────────────────────────────────────────────────────────────
type Bloc = { name?: string; period?: string; bulletsEssentiel: string[] };
const experiences = await prisma.experience.findMany();
// Puces du CV : un verbe en tête, le détail des modules condensé, les missions éloignées du
// développement regroupées dans « Autres missions » (retours des relecteurs, 4 nov. 2026).
const PUCES_FRUGGR: { avant: Bloc; apres: Bloc }[] = [
  {
    avant: {
      name: "Équipe Produit",
      period: "mars 2025 – juin 2026",
      bulletsEssentiel: [
        "Développement front-end en React et TypeScript de la plateforme : 75 pull requests fusionnées en 15 mois (fonctionnalités, refontes, corrections)",
        "Refontes transverses, de la maquette Figma jusqu'au code : barre de navigation, page d'accueil par offre et tableaux de bord",
        "Évolutions sur les modules de la plateforme : gouvernance de l’IA (crédits IA, audit SGQRI 008), accessibilité (déclaration d’accessibilité, critères RGAA), ESG-IT, Parc IT (matériel reconditionné, inventaire), Services et Infra (passage à la nouvelle charte UI)",
        "Reprise du design UI/UX de la plateforme, seule designer de l’équipe Produit sous la supervision du PO : maquettes et évolutions sur Figma, ateliers de conception",
        "Évolutions back-end ponctuelles en NestJS et MongoDB ; tests unitaires, relecture de code, déploiements de la préproduction à la production (Azure)",
      ],
    },
    apres: {
      name: "Équipe Produit",
      period: "mars 2025 – juin 2026",
      bulletsEssentiel: [
        "Développé en React et TypeScript des fonctionnalités, refontes et corrections de la plateforme : 75 pull requests fusionnées en 15 mois",
        "Refondu, de la maquette Figma jusqu’au code, la barre de navigation, la page d’accueil par offre et les tableaux de bord",
        "Fait évoluer les modules gouvernance de l’IA, accessibilité (déclaration d’accessibilité, critères RGAA), ESG-IT et Parc IT ; appliqué la nouvelle charte UI aux modules Services et Infra",
        "Repris le design UI/UX de la plateforme, seule designer de l’équipe Produit sous la supervision du PO : maquettes et évolutions sur Figma, ateliers de conception",
        "Réalisé des évolutions back-end ponctuelles en NestJS et MongoDB : routes d’API et gestion des données jusqu’au front-end ; relu du code, déployé de la préproduction à la production (Azure)",
      ],
    },
  },
  {
    avant: {
      name: "Équipe Marketing : développement web et contenus",
      period: "depuis juin 2026",
      bulletsEssentiel: [
        "Développement du thème WordPress du site Fruggr : 9 nouveaux blocs sur mesure (frise, cartes, bannières, FAQ, cas clients), pied de page et type de contenu « ressource » ; 23 pull requests depuis juillet 2026",
        "Nouveau site WordPress de Digital4Better : maquettes Figma et mise en page complète",
        "Audits UI/UX, accessibilité (WCAG, RGAA) et SEO technique de sites, avec recommandations priorisées ; correction des erreurs et avertissements relevés par Semrush",
        "Participation au repositionnement de Fruggr : saga de 3 films bilingues réalisée de A à Z, du script validé au rendu (Remotion en React, voix off ElevenLabs)",
      ],
    },
    apres: {
      name: "Équipe Marketing : développement web et contenus",
      period: "depuis juin 2026",
      bulletsEssentiel: [
        "Développé le thème WordPress du site Fruggr : 9 nouveaux blocs sur mesure (frise, cartes, bannières, FAQ, cas clients), pied de page et type de contenu « ressource » ; 23 pull requests depuis juillet 2026",
        "Conçu sur Figma et mis en page le nouveau site WordPress de Digital4Better",
        "Réalisé en React (Remotion) une saga de 3 films bilingues pour le repositionnement de Fruggr",
      ],
    },
  },
  {
    avant: {
      name: "Transverse : automatisation par l’IA",
      bulletsEssentiel: ["Création de 6 skills Claude pour automatiser des tâches récurrentes de mon poste (visuels LinkedIn, intégration d’articles WordPress, audits de sites), proposés à l’équipe"],
    },
    apres: {
      name: "Autres missions",
      bulletsEssentiel: [
        "Réalisé des audits UI/UX, d’accessibilité (WCAG, RGAA) et de SEO technique de sites, avec des recommandations priorisées ; corrigé les erreurs et avertissements relevés par Semrush",
        "Créé 6 skills Claude pour automatiser des tâches récurrentes de mon poste (visuels LinkedIn, intégration d’articles WordPress, audits de sites), proposés à l’équipe",
      ],
    },
  },
];
const PUCES_CARBONSCORE = {
  avant: [
    "Au sein d’une équipe produit de 4 personnes, interventions sur l’ensemble de la plateforme : page d’accueil, tableau de bord, gamification, FAQ et page profil",
    "Modules de quiz et de formations : intégration de nouveaux quiz et de nouvelles formations, mise en page des contenus",
    "Évolution continue du design de la plateforme sur Figma, puis intégration en Vue.js (Vuetify, Pinia) et TypeScript ; back-end NestJS et PostgreSQL",
    "Méthode agile (dailies, tickets Jira, documentation Confluence), sur des environnements personnels, de préproduction et de production",
    "Présentation de CarbonScore au salon VivaTech, en représentant TechUpClimate",
  ],
  apres: [
    "Fait évoluer l’ensemble de la plateforme au sein d’une équipe produit de 4 personnes : page d’accueil, tableau de bord, gamification, FAQ et page profil",
    "Intégré de nouveaux quiz et de nouvelles formations, et mis en page leurs contenus",
    "Fait évoluer le design de la plateforme sur Figma, puis intégré les maquettes en Vue.js (Vuetify, Pinia) et TypeScript ; réalisé des évolutions back-end en NestJS et PostgreSQL (routes d’API, gestion des données), avec des tests unitaires",
    "Travaillé en méthode agile (dailies, tickets Jira, documentation Confluence), sur des environnements personnels, de préproduction et de production",
    "Présenté CarbonScore au salon VivaTech, en représentant TechUpClimate",
  ],
};
const expMaj = experiences.map((e) => {
  let blocs = structuredClone(e.blocs) as unknown as Bloc[];
  const poste = remplacer(`${e.entreprise} · poste`, e.poste, "Développeuse Full-Stack & UI Designer", "Développeuse full-stack & UI designer");
  let contexte = e.contexteEssentiel;
  let note = e.note;
  if (e.entreprise === "Fruggr") {
    contexte = remplacer("Fruggr · contexte", contexte, "utilisée par de grands comptes.", "utilisée par de grands comptes. Plus de 95 pull requests fusionnées.");
    blocs = reecrire(
      "Fruggr · blocs et puces",
      blocs,
      PUCES_FRUGGR.map((b) => b.avant),
      PUCES_FRUGGR.map((b) => b.apres),
    );
  } else if (e.entreprise === "CarbonScore") {
    // Seules les puces du CV changent : les autres champs du bloc (technologies…) restent.
    const bloc = blocs[0];
    if (!bloc) erreurs.push("CarbonScore · bloc introuvable");
    else bloc.bulletsEssentiel = reecrire("CarbonScore · puces", bloc.bulletsEssentiel, PUCES_CARBONSCORE.avant, PUCES_CARBONSCORE.apres);
    if (note) note = remplacer("CarbonScore · note", note, "Rachat de TechUpClimate par Digital4Better en 2025 : mission poursuivie chez Fruggr, sans interruption.", "Rachat de TechUpClimate par Digital4Better en 2025, mission poursuivie chez Fruggr sans interruption.");
  }
  return { id: e.id, poste, contexteEssentiel: contexte, blocs, note };
});

// ── Compétences : HTML et CSS, cités par les offres ; Java et Angular, du Bac+5 (accord de Clara, 4 nov. 2026) ──
const frontEnd = await prisma.skillGroup.findFirst({ where: { version: "essentiel", name: "Front-end" } });
const itemsFront = frontEnd && reecrire("Compétences · Front-end", frontEnd.items as string[], ["React", "TypeScript / JavaScript", "Next.js", "Tailwind CSS"], ["React", "TypeScript / JavaScript", "HTML / CSS", "Next.js", "Tailwind CSS", "Angular"]);
if (!frontEnd) erreurs.push("Compétences · groupe Front-end introuvable");
const backEnd = await prisma.skillGroup.findFirst({ where: { version: "essentiel", name: "Back-end et données" } });
const itemsBack = backEnd && reecrire("Compétences · Back-end et données", backEnd.items as string[], ["Node.js", "NestJS", "SQL (PostgreSQL, MySQL)", "MongoDB"], ["Node.js", "NestJS", "Java (Spring Boot)", "SQL (PostgreSQL, MySQL)", "MongoDB"]);
if (!backEnd) erreurs.push("Compétences · groupe Back-end et données introuvable");

// ── Formations : le nombre de projets est calculé (projets publiés), sauf mention ──
const formations = await prisma.formation.findMany();
const formMaj = formations.map((f) => ({
  id: f.id,
  projets: fixer(`Formation ${f.intitule} · projets`, f.projets, f.statut === "En cours" ? "Fin prévue en 2027" : ""),
}));

// ── Projets ───────────────────────────────────────────────────────────────────
type Etape = { label: string; status: string };
type Doc = { label: string; href: string };
const projet = async (id: string) => prisma.project.findUniqueOrThrow({ where: { id } });
const portfolio = await projet("portfolio");
let ctxPortfolio = remplacer("Ce portfolio · contexte", portfolio.context, "Site public (accueil, 39 projets, CV, page IA)", "Site public (accueil, projets, CV, page IA)");
ctxPortfolio = remplacer("Ce portfolio · contexte", ctxPortfolio, "Accessibilité : Lighthouse 100 et 0 erreur axe sur les pages principales.", "Accessibilité : {{audit-rgaa}}.");
const etapesPortfolio = (portfolio.steps as unknown as Etape[]).map((s) =>
  s.label === "Génération des CV en PDF, dont des CV orientés d’une page" ? { ...s, label: remplacer("Ce portfolio · étape", s.label, s.label, "Génération du CV en PDF, mis en page et en texte simple") } : s,
);
const bambinets = await projet("les-bambinets");
const dateBambinets = fixer("Les Bambinets · date", bambinets.date, "oct. 2026");
const ctxBambinets = remplacer("Les Bambinets · contexte", bambinets.context, "Le projet est un exercice de formation et sera présenté en soutenance en octobre 2026.", "Le projet est un exercice de formation.");
const watched = await projet("watchedthis");
const docsWatched = (watched.docs as unknown as Doc[]).map((d) => (d.label === "Documentation API" ? { ...d, label: remplacer("WatchedThis · livrable", d.label, d.label, "Documentation de l’API") } : d));
const monde = await projet("monde-de-dev");
const carteMonde = structuredClone(monde.homeCard) as { eyebrow: string } | null;
if (carteMonde) carteMonde.eyebrow = remplacer("Monde de Dév · carte de l’accueil", carteMonde.eyebrow, "Full-Stack · OpenClassrooms", "Full-stack · OpenClassrooms");

// ── Recommandation : la relation (rédigée sur le site), jamais la citation ─────
const delphine = await prisma.recommendation.findFirst({ where: { relation: { contains: "Full-Stack" } } });
const relationDelphine = delphine && remplacer(`Recommandation ${delphine.auteur} · relation`, delphine.relation, "Full-Stack", "full-stack");

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
  Object.assign(prisma.experience, { findMany: async (a: never) => (await lireExp(a)).map((e) => ({ ...e, ...expMaj.find((m) => m.id === e.id) })) });
  const lireForm = prisma.formation.findMany.bind(prisma.formation);
  Object.assign(prisma.formation, { findMany: async (a: never) => (await lireForm(a)).map((f) => ({ ...f, ...formMaj.find((m) => m.id === f.id) })) });
  const lireSkills = prisma.skillGroup.findMany.bind(prisma.skillGroup);
  Object.assign(prisma.skillGroup, { findMany: async (a: never) => (await lireSkills(a)).map((s) => (s.id === frontEnd?.id ? { ...s, items: itemsFront } : s.id === backEnd?.id ? { ...s, items: itemsBack } : s)) });
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
if (!appliquer) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.$transaction([
  prisma.singleton.update({ where: { key: "profil" }, data: { data: profil as never } }),
  ...expMaj.map((e) => prisma.experience.update({ where: { id: e.id }, data: { poste: e.poste, contexteEssentiel: e.contexteEssentiel, blocs: e.blocs as never, note: e.note } })),
  ...(frontEnd && itemsFront ? [prisma.skillGroup.update({ where: { id: frontEnd.id }, data: { items: itemsFront } })] : []),
  ...(backEnd && itemsBack ? [prisma.skillGroup.update({ where: { id: backEnd.id }, data: { items: itemsBack } })] : []),
  ...formMaj.map((f) => prisma.formation.update({ where: { id: f.id }, data: { projets: f.projets } })),
  prisma.project.update({ where: { id: "portfolio" }, data: { context: ctxPortfolio, steps: etapesPortfolio as never } }),
  prisma.project.update({ where: { id: "les-bambinets" }, data: { date: dateBambinets, context: ctxBambinets } }),
  prisma.project.update({ where: { id: "watchedthis" }, data: { docs: docsWatched as never } }),
  ...(carteMonde ? [prisma.project.update({ where: { id: "monde-de-dev" }, data: { homeCard: carteMonde as never } })] : []),
  ...(delphine && relationDelphine ? [prisma.recommendation.update({ where: { id: delphine.id }, data: { relation: relationDelphine } })] : []),
]);
console.log("Changements écrits en base.");
await prisma.$disconnect();
