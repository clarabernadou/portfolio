// Base de DÉMONSTRATION de l'administration, remplie de données FICTIVES, pour les captures du
// portfolio. Usage : npm run demo:donnees (puis npm run demo:serveur).
//
// - Écrit uniquement dans la base de démo (scripts/demo/env-demo.mjs) : son nom doit contenir
//   « demo » et différer de celle du site. La base du site n'est jamais lue ni modifiée.
// - Vide la base de démo puis la remplit : rejouable autant de fois que nécessaire.
// - Tout est inventé (projets, écoles, entreprises, personnes, liens en exemple.fr) : aucun projet
//   privé, aucune recommandation réelle, aucune coordonnée de Clara.
// - Chaque écran et chaque état de l'administration a de quoi s'afficher : 3 statuts de
//   publication, les 5 alertes « À compléter », un projet importé de GitHub, journal, page IA…
import { execFileSync } from "node:child_process";
import mariadb from "mariadb";
import { DEMO_GITHUB_LOGIN, DEMO_REPOS } from "../../lib/admin/github-demo";
import { moisAnnee, prettyName } from "../../lib/admin/github";
import { CV_PUBLIC } from "../../lib/pdf/fichiers";
import { demoDatabaseUrl, demoEnv } from "./env-demo.mjs";

const url: string = demoDatabaseUrl();
const u = new URL(url);
const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
const nomBase = u.pathname.slice(1);

// 1. Base et tables (mêmes migrations que le site).
const conn = await mariadb.createConnection({
  host: u.hostname,
  port: Number(u.port || 4000),
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  connectTimeout: 10_000,
  ...(local ? {} : { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } }),
});
await conn.query(`CREATE DATABASE IF NOT EXISTS \`${nomBase}\``);
await conn.end();
execFileSync("npx", ["prisma", "migrate", "deploy"], { stdio: "pipe", env: demoEnv() });
console.log(`Base de démo prête : ${nomBase} sur ${u.hostname}`);

const { PrismaClient } = await import("../../lib/generated/prisma/client");
const { adapterFromUrl } = await import("../../lib/db");
const prisma = new PrismaClient({ adapter: adapterFromUrl(url) });

// 2. On repart de zéro (base de démo uniquement).
for (const t of ["project", "category", "formation", "experience", "skillGroup", "recommendation", "singleton", "syncLog", "generatedFile", "asset"] as const) {
  await (prisma[t] as unknown as { deleteMany: () => Promise<unknown> }).deleteMany();
}

const ilYa = (jours: number, heures = 0) => new Date(Date.now() - (jours * 24 + heures) * 3_600_000);

// 3. Fichiers : photo (avatar dessiné), deux captures d'écran, un livrable et le CV, tous fictifs.
const svg = (s: string) => Buffer.from(s.trim(), "utf8");
const avatar = svg(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cc4"/><stop offset="1" stop-color="#2b1d4f"/></linearGradient></defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <circle cx="400" cy="320" r="140" fill="#e9e1fb"/>
  <path d="M150 760c30-170 140-250 250-250s220 80 250 250z" fill="#e9e1fb"/>
</svg>`);
// Écran de téléphone en portrait (taille d'une capture mobile), pour tester l'image entière et le zoom.
const maquetteMobile = (titre: string, accent: string) =>
  svg(`
<svg xmlns="http://www.w3.org/2000/svg" width="824" height="1830" viewBox="0 0 824 1830">
  <rect width="824" height="1830" fill="#f7f5fb"/>
  <rect width="824" height="120" fill="#ffffff"/><rect x="32" y="40" width="200" height="40" rx="20" fill="${accent}"/>
  <text x="32" y="250" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#1d1530">${titre}</text>
  <rect x="32" y="300" width="600" height="24" rx="12" fill="#d9d2ea"/>
  <rect x="32" y="400" width="760" height="440" rx="40" fill="${accent}"/>
  <rect x="32" y="900" width="760" height="300" rx="32" fill="#ffffff"/><rect x="32" y="1240" width="760" height="300" rx="32" fill="#ffffff"/>
  <rect x="0" y="1680" width="824" height="150" fill="#ffffff"/>
  <text x="792" y="1660" text-anchor="end" font-family="Arial, sans-serif" font-size="28" fill="#7a6e93">Maquette fictive · démo (bas de l’écran)</text>
</svg>`);
const maquette = (titre: string, accent: string) =>
  svg(`
<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
  <rect width="1440" height="900" fill="#f7f5fb"/>
  <rect width="1440" height="72" fill="#ffffff"/><rect x="48" y="24" width="160" height="24" rx="12" fill="${accent}"/>
  <rect x="1080" y="26" width="90" height="20" rx="10" fill="#d9d2ea"/><rect x="1190" y="26" width="90" height="20" rx="10" fill="#d9d2ea"/><rect x="1300" y="20" width="100" height="32" rx="16" fill="${accent}"/>
  <text x="48" y="190" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#1d1530">${titre}</text>
  <rect x="48" y="230" width="620" height="18" rx="9" fill="#d9d2ea"/><rect x="48" y="262" width="520" height="18" rx="9" fill="#d9d2ea"/>
  <rect x="48" y="320" width="180" height="48" rx="24" fill="${accent}"/>
  <rect x="48" y="430" width="430" height="400" rx="24" fill="#ffffff"/><rect x="505" y="430" width="430" height="400" rx="24" fill="#ffffff"/><rect x="962" y="430" width="430" height="400" rx="24" fill="#ffffff"/>
  <rect x="80" y="462" width="366" height="200" rx="16" fill="#ece6f8"/><rect x="537" y="462" width="366" height="200" rx="16" fill="#ece6f8"/><rect x="994" y="462" width="366" height="200" rx="16" fill="#ece6f8"/>
  <text x="1392" y="880" text-anchor="end" font-family="Arial, sans-serif" font-size="20" fill="#7a6e93">Maquette fictive · démo</text>
</svg>`);
// PDF minimal d'une page, écrit à la main (offsets de la table xref calculés).
function pdf(lignes: string[]) {
  const texte = lignes.map((l, i) => `BT /F1 ${i ? 14 : 22} Tf 60 ${760 - i * 34} Td (${l.replace(/[()\\]/g, "")}) Tj ET`).join("\n");
  const objets = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(texte, "latin1")} >>\nstream\n${texte}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objets.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out, "latin1"));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${objets.length + 1}\n0000000000 65535 f \n${offsets.map((n) => `${String(n).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objets.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}
await prisma.asset.createMany({
  data: [
    { key: "photo", mime: "image/svg+xml", data: avatar },
    { key: "demo-capture-1", mime: "image/svg+xml", data: maquette("Carnet de rando", "#7c5cc4") },
    { key: "demo-capture-2", mime: "image/svg+xml", data: maquette("Mes itinéraires", "#3d8a6e") },
    // Médiathèque : captures en sous-catégories, pour le test des filtres (scripts/test-captures-groupes.mjs).
    { key: "demo-capture-3", mime: "image/svg+xml", data: maquette("Recherche", "#7c5cc4") },
    { key: "demo-capture-4", mime: "image/svg+xml", data: maquette("Résultats", "#3d8a6e") },
    { key: "demo-capture-5", mime: "image/svg+xml", data: maquetteMobile("Compte lecteur", "#b5568a") },
    { key: "demo-livrable", mime: "application/pdf", data: pdf(["Livrable fictif", "Document de demonstration : donnees fictives.", "Aucun contenu reel."]) },
  ],
});
await prisma.generatedFile.create({
  data: { name: CV_PUBLIC, kind: "cv", lang: "fr", generatedAt: ilYa(5), data: pdf(["CV de demonstration", "Donnees fictives, pour les captures de l administration.", "Aucune information reelle."]) },
});

// 4. Catégories : les 3 types et 5 cadres (2 formations fictives, entreprise, perso, audit).
const TYPES = ["Développement", "UX / UI", "Conception et gestion"];
const CADRES: [string, string][] = [
  ["Bachelor Concepteur UX", "Formation"],
  ["Titre Développeur web", "Formation"],
  ["En entreprise", "Entreprise"],
  ["Projet personnel", "Projet perso"],
  ["Audit indépendant", "Audit"],
];
await prisma.category.createMany({
  data: [
    ...TYPES.map((name, position) => ({ kind: "type", name, position })),
    ...CADRES.map(([name, nature], position) => ({ kind: "cadre", name, nature, position })),
  ],
});

// 5. Projets. Publié = status published + visible ; Privé = published + visible false ; Brouillon = draft.
const depot = (name: string) => DEMO_REPOS.find((r) => r.name === name)!;
const langages: Record<string, string[]> = { "api-recettes": ["TypeScript", "Dockerfile"] };
const capture = (n: number, alt: string) => ({ url: `/media/demo-capture-${n}`, alt });
const livrable = (n: number, label: string) => ({ n, label, href: "/media/demo-livrable" });
const retour = (difficultes: string, appris: string, ameliorations: string) => ({ difficultes, appris, ameliorations });

type Projet = Parameters<typeof prisma.project.create>[0]["data"];
const projets: Projet[] = [
  {
    id: "carnet-de-rando",
    name: "Carnet de rando",
    date: "oct. 2026 · en cours",
    type: "Développement · UX / UI",
    types: ["Développement", "UX / UI"],
    parcours: "Projet personnel",
    line: "Une application de randonnée qui marche sans réseau : itinéraires, dénivelé et notes prises sur le sentier.",
    tags: ["React", "TypeScript", "PWA", "Leaflet"],
    docs: [],
    steps: [
      { label: "Entretiens avec 5 randonneurs", status: "Fait" },
      { label: "Parcours et maquettes mobiles", status: "Fait" },
      { label: "Mode hors ligne et cartes en cache", status: "En cours" },
      { label: "Tests utilisateurs sur le terrain", status: "À venir" },
    ],
    captures: [capture(1, "Accueil du Carnet de rando : titre, bouton « Nouvel itinéraire » et 3 cartes d’itinéraires."), capture(2, "Liste « Mes itinéraires » avec 3 cartes de randonnée.")],
    retour: retour(
      "Garder la carte lisible au soleil, avec des contrastes forts sans perdre le relief.",
      "Le fonctionnement hors ligne d’une application web (service worker, cache des tuiles).",
      "Ajouter l’export GPX et un mode « économie de batterie ».",
    ),
    github: depot("carnet-de-rando").html_url,
    site: `https://${DEMO_GITHUB_LOGIN}.github.io/carnet-de-rando/`,
    figma: "https://www.figma.com/design/exemple/carnet-de-rando",
    context: "Projet mené seule pour apprendre le mode hors ligne : de l’entretien avec des randonneurs jusqu’à l’application installable sur le téléphone.",
    skillsValidated: ["Concevoir une interface mobile", "Développer une application web progressive"],
    onHome: true,
    homeCard: { section: "Développement", eyebrow: "Application mobile", line: "Une appli de rando qui marche sans réseau.", tags: ["React", "PWA"], order: 0 },
    featured: true,
  },
  {
    id: "mediatheque-refonte",
    name: "Refonte d’une médiathèque en ligne",
    date: "mars 2025 – juin 2025",
    type: "UX / UI",
    types: ["UX / UI"],
    parcours: "Bachelor Concepteur UX",
    line: "Refonte du catalogue en ligne d’une médiathèque de quartier : recherche, réservation et compte lecteur.",
    tags: ["Figma", "Tests utilisateurs", "Design system"],
    pdf: "/media/demo-livrable",
    docs: [livrable(1, "Rapport de recherche utilisateur"), livrable(2, "Maquettes haute fidélité"), livrable(3, "Synthèse des tests")],
    steps: [],
    // Sous-catégories (2 groupes et une capture sans groupe, rangée dans « Autres »).
    captures: [
      { ...capture(3, "Page de recherche du catalogue : champ de recherche et filtres par genre."), groupe: "Recherche" },
      { ...capture(5, "Compte lecteur : prêts en cours et dates de retour."), groupe: "Compte lecteur" },
      { ...capture(4, "Résultats de recherche : 3 livres avec leur disponibilité."), groupe: "Recherche" },
      capture(1, "Accueil de la médiathèque : actualités et nouveautés."),
    ],
    retour: retour("Trier 40 retours de lecteurs sans perdre les besoins des plus âgés.", "Animer un atelier de tri de cartes.", "Tester plus tôt la réservation sur mobile."),
    // Retour de l'évaluateur (fictif) : plusieurs lignes → listes ; « Carnet de rando » n'en a pas (test Playwright).
    evaluationMois: "juin 2025",
    evaluationPointsForts: "Recherche utilisateur bien menée et restituée.\nMaquettes cohérentes avec le design system.",
    evaluationAxes: "Justifier davantage les choix de navigation.",
    evaluationRemarque: "Présentation claire, dans le temps imparti.",
    figma: "https://www.figma.com/design/exemple/mediatheque",
    context: "Projet de formation, mené en binôme sur 4 mois, avec une médiathèque fictive comme commanditaire.",
    skillsValidated: ["Mener une recherche utilisateur", "Concevoir un prototype"],
    onHome: true,
    homeCard: { section: "Design", eyebrow: "Refonte UX", line: "Trouver et réserver un livre en 3 clics.", tags: ["Figma", "Tests"], order: 0 },
    featured: true,
  },
  {
    id: "boutique-audit-rgaa",
    name: "Audit d’accessibilité d’une boutique en ligne",
    date: "janv. 2026",
    type: "UX / UI",
    types: ["UX / UI"],
    parcours: "Audit indépendant",
    line: "Audit RGAA d’une boutique de thé en ligne, avec un plan de corrections classé par priorité.",
    tags: ["RGAA", "Accessibilité", "Audit"],
    docs: [livrable(1, "Rapport d’audit")],
    steps: [],
    retour: retour("Expliquer les critères sans jargon au commerçant.", "Tester avec un lecteur d’écran, page par page.", "Proposer un suivi trois mois après."),
    context: "Audit bénévole pour un petit commerce fictif : 12 pages auditées, 30 corrections proposées.",
    skillsValidated: ["Auditer l’accessibilité d’un site"],
    onHome: true,
    homeCard: { section: "Design", eyebrow: "Audit RGAA", line: "30 corrections, classées par priorité.", tags: ["RGAA"], order: 1 },
    featured: true,
  },
  {
    id: "tableau-de-bord-energie",
    name: "Tableau de bord énergie",
    date: "sept. 2025 – oct. 2026",
    type: "Développement · Conception et gestion",
    types: ["Développement", "Conception et gestion"],
    parcours: "En entreprise",
    line: "Suivi de la consommation d’énergie des bâtiments d’une entreprise fictive, avec alertes et export.",
    tags: ["Next.js", "NestJS", "PostgreSQL", "Recharts"],
    docs: [],
    steps: [],
    github: null,
    context: "Projet d’alternance fictif : il reste privé en attendant la validation de l’entreprise, comme les vrais projets de Clara.",
    skillsValidated: [],
    visible: false,
    onHome: true,
    homeCard: { section: "En entreprise", eyebrow: "Alternance", line: "Repérer les bâtiments qui consomment trop.", tags: ["Next.js", "NestJS"], order: 0 },
  },
  {
    id: "covoiturage-ecole",
    name: "Covoiturage pour l’école",
    date: "nov. 2026 · en cours",
    type: "UX / UI · Conception et gestion",
    types: ["UX / UI", "Conception et gestion"],
    parcours: "Projet personnel",
    line: "Une application pour organiser les trajets vers l’école entre parents d’un même quartier.",
    tags: ["Figma", "Atelier", "Parcours utilisateur"],
    docs: [],
    steps: [
      { label: "Questionnaire aux parents", status: "Fait" },
      { label: "Parcours « proposer un trajet »", status: "En cours" },
      { label: "Prototype cliquable", status: "À venir" },
    ],
    context: "Projet en cours d’écriture, encore en brouillon : il n’apparaît nulle part sur le site.",
    skillsValidated: [],
    status: "draft",
  },
  {
    id: "memo-accessible",
    name: "Mémo accessible",
    date: "juin 2026",
    type: "Développement",
    types: ["Développement"],
    parcours: "Titre Développeur web",
    line: "Un jeu de mémoire jouable au clavier et au lecteur d’écran.",
    tags: ["JavaScript", "ARIA", "CSS"],
    docs: [livrable(1, "Dossier de projet")],
    steps: [],
    github: null,
    context: "Projet de formation : rendre un jeu visuel utilisable sans souris ni écran.",
    skillsValidated: ["Développer une interface accessible"],
  },
  {
    id: "stock-association",
    name: "Stock d’une épicerie solidaire",
    date: "sept. 2026 · en cours",
    type: "Conception et gestion",
    types: ["Conception et gestion", "Développement"],
    parcours: "Titre Développeur web",
    line: "Gestion des stocks et des dates limites pour une épicerie solidaire tenue par des bénévoles.",
    tags: ["Node.js", "MySQL", "Gestion de projet"],
    docs: [],
    steps: [],
    github: null,
    context: "Projet de formation en équipe de 3 : cahier des charges, planning et première version.",
    skillsValidated: [],
  },
  {
    // Importé de GitHub par la synchronisation, encore à compléter (types et contexte vides).
    id: "api-recettes",
    name: prettyName("api-recettes"),
    date: moisAnnee(depot("api-recettes").pushed_at),
    type: "Développement",
    types: [],
    parcours: "Projet personnel",
    line: depot("api-recettes").description!,
    tags: langages["api-recettes"],
    docs: [],
    steps: [],
    github: depot("api-recettes").html_url,
    context: "",
    skillsValidated: [],
    origin: "github",
    fieldMeta: Object.fromEntries(["name", "line", "tags", "github", "date"].map((k) => [k, { origin: "github", locked: false }])),
  },
  {
    id: "design-system-pastel",
    name: "Design system Pastel",
    date: "févr. 2026",
    type: "UX / UI",
    types: ["UX / UI"],
    parcours: "Bachelor Concepteur UX",
    line: "Un design system de 40 composants, documenté et testé pour les contrastes.",
    tags: ["Figma", "Design tokens", "Storybook"],
    docs: [livrable(1, "Documentation du design system")],
    steps: [],
    retour: retour("Nommer les tokens pour qu’une équipe s’y retrouve.", "Documenter chaque composant avec ses états.", ""),
    figma: "https://www.figma.com/design/exemple/pastel",
    context: "Projet de formation : partir de 3 maquettes hétérogènes et en tirer une bibliothèque cohérente.",
    skillsValidated: ["Construire un design system"],
    onHome: true,
    homeCard: { section: "Design", eyebrow: "Design system", line: "40 composants, des contrastes vérifiés.", tags: ["Figma", "Tokens"], order: 2 },
  },
];
const nb = projets.length;
for (const [i, p] of projets.entries()) {
  await prisma.project.create({ data: { pdf: null, figma: null, github: null, featured: false, onHome: false, ...p, position: i, createdAt: ilYa(nb - i + 10), updatedAt: ilYa(i) } as Projet });
}

// 6. Formations (2 obtenues, 1 en cours) et expériences (avec cartes d'accueil).
await prisma.formation.createMany({
  data: [
    { position: 0, intitule: "Bachelor Concepteur UX", url: "https://exemple.fr/bachelor-ux", annees: "2024 – 2025", diplome: "Bac+3", niveauComplet: "Titre RNCP de niveau 6 (Bac+3/4)", mode: "En alternance", statut: "Obtenu", projets: "", nomOfficiel: "Concepteur UX de l’École Exemple" },
    { position: 1, intitule: "Titre Développeur web", url: "https://exemple.fr/developpeur-web", annees: "2023 – 2024", diplome: "Bac+2", niveauComplet: "Titre RNCP de niveau 5 (Bac+2)", mode: "En autonomie", statut: "Obtenu", projets: "", nomOfficiel: "Développeur web de l’Institut Démo" },
    { position: 2, intitule: "Mastère Expert en développement", url: "https://exemple.fr/mastere", annees: "2025 – 2027", diplome: "Bac+5", niveauComplet: "Titre RNCP de niveau 7 (Bac+5)", mode: "En alternance", statut: "En cours", projets: "Fin prévue en 2027", mentionComplementaire: "Rythme : 3 semaines en entreprise, 1 semaine en formation." },
  ],
});
await prisma.experience.createMany({
  data: [
    {
      position: 0,
      poste: "Développeuse Full Stack & UI/UX",
      entreprise: "Société Exemple",
      entrepriseHref: "https://exemple.fr",
      periode: "Depuis sept. 2025",
      lieuMode: "Vannes · Hybride, en alternance",
      contexteEssentiel: "Éditeur fictif d’un logiciel de suivi énergétique pour les entreprises.",
      blocs: [
        { name: "Équipe produit", period: "Depuis janv. 2026", stack: "Next.js, NestJS, PostgreSQL", bulletsEssentiel: ["Développement du tableau de bord énergie, de la maquette à la mise en production.", "Mise en place de tests de bout en bout avec Playwright.", "Corrections d’accessibilité sur 12 écrans."] },
        { name: "Équipe design", period: "Sept. – déc. 2025", bulletsEssentiel: ["Refonte du parcours d’inscription.", "Création de 25 composants dans le design system."] },
      ],
      homeCard: { lieuMode: "Vannes · Hybride", technologies: ["Next.js", "NestJS", "Figma"], order: 0 },
    },
    {
      position: 1,
      poste: "Développeuse web",
      entreprise: "Studio Démo",
      entrepriseParent: "Groupe Fictif",
      entrepriseParentHref: "https://exemple.fr/groupe",
      periode: "Sept. 2023 – août 2025",
      lieuMode: "Lorient · Sur site, en alternance",
      contexteEssentiel: "Agence web fictive : sites vitrines et boutiques pour des commerces de la région.",
      blocs: [{ bulletsEssentiel: ["Intégration de 8 sites vitrines responsives.", "Création d’un thème WordPress accessible.", "Formation des clients à la mise à jour de leur site."] }],
      homeCard: { lieuMode: "Lorient · Sur site", technologies: ["WordPress", "JavaScript", "PHP"], order: 1 },
      note: "Exemple de note interne : non affichée sur le site.",
    },
  ],
});

// 7. Compétences, recommandations (fictives, dont une en brouillon).
await prisma.skillGroup.createMany({
  data: [
    { version: "essentiel", name: "Front-end", items: ["React", "TypeScript", "Next.js", "Tailwind CSS"], position: 0 },
    { version: "essentiel", name: "Back-end et données", items: ["Node.js", "NestJS", "PostgreSQL", "MySQL"], position: 1 },
    { version: "essentiel", name: "UI/UX", items: ["Figma", "Design system", "Tests utilisateurs", "Accessibilité (RGAA)"], position: 2 },
    { version: "essentiel", name: "Outils", items: ["Git", "Playwright", "Vitest", "Claude Code"], position: 3 },
  ],
});
await prisma.recommendation.createMany({
  data: [
    {
      position: 0,
      auteur: "Camille Exemple",
      initiales: "CE",
      poste: "Responsable produit chez Société Exemple",
      relation: "Responsable d’alternance",
      citationCourte: "Elle pose les bonnes questions avant d’écrire la première ligne de code.",
      texteIntegral: ["Recommandation fictive, écrite pour la démonstration de l’administration.", "Elle pose les bonnes questions avant d’écrire la première ligne de code, et ses écrans sont accessibles dès la première version."],
      entrepriseHref: "https://exemple.fr",
      lienTexte: "Société Exemple",
      voirLinkedin: false,
    },
    {
      position: 1,
      auteur: "Hugo Démo",
      initiales: "HD",
      poste: "Directeur technique du Studio Démo",
      relation: "Tuteur d’alternance",
      citationCourte: "Une développeuse qui pense toujours à la personne qui utilisera le site.",
      texteIntegral: ["Recommandation fictive, écrite pour la démonstration de l’administration."],
      lettrePdf: "/media/demo-livrable",
    },
    {
      position: 2,
      auteur: "Inès Fictive",
      initiales: "IF",
      poste: "Formatrice UX à l’École Exemple",
      relation: "Formatrice",
      citationCourte: "Recommandation en brouillon : elle n’apparaît pas sur le site.",
      texteIntegral: ["Brouillon fictif."],
      status: "draft",
    },
  ],
});

// 8. Contenus uniques : profil, page IA, projets phares, réglages de synchronisation.
const profil = {
  nom: "Clara Bernadou",
  intitule: "Développeuse full stack",
  accroche: "Profil de démonstration : toutes les données de cette administration sont fictives.",
  contrat: "CDI",
  disponibilite: "disponible en mars 2027",
  entretiens: "Entretiens possibles en visio, du lundi au vendredi.",
  lieu: "Full remote ou Bretagne sud",
  mobilite: "Permis B",
  email: "contact@exemple.fr",
  telephone: "06 00 00 00 00",
  linkedin: "https://www.linkedin.com/in/exemple",
  github: `https://github.com/${DEMO_GITHUB_LOGIN}`,
  profilEssentiel: "Profil fictif pour la démonstration : développeuse full stack qui conçoit des interfaces accessibles, de la maquette à la mise en production.",
  langues: [
    { nom: "Français", niveau: ["Langue maternelle"] },
    { nom: "Anglais", niveau: ["Lecture et écriture : C1", "Compréhension et expression orales : B1"] },
  ],
  photoAlt: "Avatar de démonstration",
  chiffreCle: { valeur: "40+", libelle: "pull requests fusionnées (fictif)" },
  formationDepuis: "sept. 2023",
  projetsCv: [{ titre: "Carnet de rando", lien: "https://exemple.fr/carnet", periode: "Depuis oct. 2026", stack: "React, TypeScript, PWA", puces: ["Application de randonnée hors ligne, installable sur le téléphone.", "Entretiens avec 5 randonneurs avant de dessiner le premier écran."] }],
  competencesIa: ["**Développement assisté :** Claude Code au quotidien, avec relecture de chaque modification.", "**Automatisation :** skills sur mesure pour les tâches répétitives."],
  noteIA: "Note privée fictive pour l’IA de relecture : viser un poste full stack, mettre l’accessibilité en avant.",
};
const ia = {
  intro: { title: "Ma façon de travailler avec l’IA", lead: "Contenu fictif de démonstration : l’IA m’aide à développer et à concevoir, et je vérifie toujours le résultat avant de le livrer." },
  stats: [
    { value: "3", label: "skills créés (fictif)", computed: "nombre de skills" },
    { value: "2", label: "outils Claude au quotidien", computed: "nombre d’outils Claude" },
    { value: "2", label: "autres outils", computed: "nombre d’outils hors Claude" },
    { value: "2", label: "routines au quotidien", computed: "nombre de routines" },
  ],
  toolsIntro: "Chaque outil a ses points forts : je choisis selon la tâche.",
  tools: [
    { name: "Claude", category: "Réflexion et rédaction", description: "Cadrer un projet, relire un texte, préparer un entretien utilisateur.", favorite: true },
    { name: "Claude Code", category: "Développement", description: "Développer dans l’éditeur, écrire des tests, relire une modification.", favorite: true },
    { name: "Figma", category: "Conception et visuels", description: "Maquettes et prototypes, avec les fonctions d’IA pour les variantes.", favorite: false },
    { name: "Perplexity", category: "Recherche sourcée", description: "Recherches avec sources, pour vérifier un chiffre ou une norme.", favorite: false },
  ],
  skillsIntro: "Des skills fictifs, pour montrer la mise en page de cette section.",
  skills: [
    { name: "Fiche projet", description: "Transforme des notes de projet en fiche prête à publier.", deliverables: ["Fiche projet", "Textes alternatifs"] },
    { name: "Relecture accessibilité", description: "Passe une page en revue avec les critères RGAA les plus courants.", deliverables: ["Liste de corrections"] },
    { name: "Compte rendu", description: "Résume une réunion en décisions et prochaines étapes.", deliverables: ["Compte rendu"] },
  ],
  routinesIntro: "Deux routines fictives, pour l’exemple.",
  routines: [
    { title: "Point du matin", when: "Chaque matin", description: "Une page qui rassemble l’agenda du jour et les tâches prioritaires.", note: "Exemple fictif." },
    { title: "Relecture du code", when: "Avant chaque fusion", description: "Une seconde lecture de chaque modification avant de la fusionner." },
  ],
  formations: [
    { name: "Les bases des agents IA", organisme: "Organisme Exemple", date: "septembre 2026", detail: "2 heures, quiz final réussi" },
    { name: "Sécurité et IA générative", organisme: "Institut Démo", date: "octobre 2026" },
  ],
  method: [
    { order: 1, title: "Repérer", description: "Une tâche répétitive qui se prête à l’automatisation." },
    { order: 2, title: "Cadrer", description: "Les sources, le format attendu et ce que l’IA ne doit pas toucher." },
    { order: 3, title: "Vérifier", description: "Je relis et je teste avant de livrer." },
  ],
  rulesIntro: "Ce que je m’impose (exemple).",
  rules: [
    { title: "Ne rien inventer", description: "L’IA part des textes et des données que je fournis." },
    { title: "Garder la main", description: "Chaque livrable est relu par une personne." },
  ],
  cases: [
    { title: "Carnet de rando", description: "Développé avec Claude Code, testé sur le terrain.", href: "/projets/carnet-de-rando" },
    { title: "Audit d’une boutique en ligne", description: "Rapport mis en forme avec un skill de relecture.", href: "/projets/boutique-audit-rgaa" },
  ],
};
const github = {
  createProjects: true,
  ignoreForks: true,
  ignoreArchivedEmpty: true,
  autoPublish: true,
  hideWithoutDescription: true,
  // Tous les dépôts fictifs servent de référence : rien n'est importé d'office, et ceux qui ne
  // sont liés à aucun projet apparaissent dans « Dépôts à importer » de l'écran Synchronisation.
  baseline: DEMO_REPOS.map((r) => r.id),
  lastRun: ilYa(0, 3).toISOString(),
};
await prisma.singleton.createMany({
  data: [
    { key: "profil", data: profil },
    { key: "ia", data: ia },
    { key: "phares", data: { ids: ["carnet-de-rando", "mediatheque-refonte", "boutique-audit-rgaa"] } },
    { key: "sync", data: { github } },
  ],
});

// 9. Journal : activité récente (tableau de bord) et imports GitHub (Synchronisation).
const journal: { source: string; entity: string; entityId: string; action: string; state: string; message: string; createdAt: Date }[] = [
  { source: "admin", entity: "project", entityId: "carnet-de-rando", action: "updated", state: "Publiée", message: "Projet « Carnet de rando » enregistré", createdAt: ilYa(0, 1) },
  { source: "admin", entity: "recommendation", entityId: "3", action: "created", state: "Brouillon", message: "Recommandation d’Inès Fictive ajoutée en brouillon", createdAt: ilYa(0, 5) },
  { source: "admin", entity: "project", entityId: "tableau-de-bord-energie", action: "updated", state: "Privé", message: "« Tableau de bord énergie » est passé en privé", createdAt: ilYa(1) },
  { source: "admin", entity: "profil", entityId: "profil", action: "updated", state: "Publiée", message: "Nouveau CV envoyé", createdAt: ilYa(5) },
  { source: "admin", entity: "formation", entityId: "3", action: "updated", state: "Publiée", message: "Formation « Mastère Expert en développement » modifiée", createdAt: ilYa(8) },
  { source: "github", entity: "*", entityId: "baseline", action: "baseline", state: "Référence", message: `Première synchronisation : ${DEMO_REPOS.length} dépôts existants pris comme référence (non importés d’office).`, createdAt: ilYa(30) },
  { source: "github", entity: "project", entityId: "api-recettes", action: "created", state: "Publié · À compléter", message: "Projet « Api Recettes » créé depuis GitHub", createdAt: ilYa(2) },
  { source: "github", entity: "project", entityId: "carnet-de-rando", action: "skipped", state: "Conservé", message: "Projet « Carnet de rando » : name, line non modifiés, car corrigés à la main", createdAt: ilYa(0, 3) },
];
await prisma.syncLog.createMany({ data: journal });

await prisma.$disconnect();
console.log(`Données fictives en place : ${projets.length} projets, 3 formations, 2 expériences, 3 recommandations, page IA, journal.`);
console.log("Étape suivante : npm run demo:serveur, puis npm run demo:captures.");
