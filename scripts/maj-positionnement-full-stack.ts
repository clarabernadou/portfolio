// Positionnement « développeuse full-stack » (demande de Clara, 4 nov. 2026) : textes stockés en base.
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
else anglais.niveau = fixer("Profil · anglais", anglais.niveau, anglais.niveau.map((n) => n.replace("Lecture et écrit : C1", "Lecture et écriture : C1").replace("Expression orale : en progression", "Expression orale : B1")));
const portfolioCv = profil.projetsCv.find((p) => p.titre === "Portfolio");
if (!portfolioCv) erreurs.push("Profil · projet du CV « Portfolio » introuvable");
else portfolioCv.puces = portfolioCv.puces.map((p, i) => (p.startsWith("Accessibilité : Lighthouse") ? remplacer(`Profil · projet du CV, puce ${i + 1}`, p, p, "Accessibilité : {{audit-rgaa}}") : p));
profil.noteIA = remplacer("Profil · profil pour l’IA", profil.noteIA, "Clara Bernadou, développeuse front-end & UI/UX designer.", "Clara Bernadou, développeuse full-stack, avec l’UI/UX comme point fort.");

// ── Expériences ───────────────────────────────────────────────────────────────
type Bloc = { name?: string; bulletsEssentiel: string[] };
const experiences = await prisma.experience.findMany();
const expMaj = experiences.map((e) => {
  const blocs = structuredClone(e.blocs) as unknown as Bloc[];
  const poste = remplacer(`${e.entreprise} · poste`, e.poste, "Développeuse Full-Stack & UI Designer", "Développeuse full-stack & UI designer");
  let contexte = e.contexteEssentiel;
  if (e.entreprise === "Fruggr") {
    contexte = remplacer("Fruggr · contexte", contexte, "utilisée par de grands comptes.", "utilisée par de grands comptes. Plus de 95 pull requests fusionnées.");
    const marketing = blocs.find((b) => b.name?.startsWith("Équipe Marketing"));
    if (!marketing) erreurs.push("Fruggr · bloc Marketing introuvable");
    else
      marketing.bulletsEssentiel = marketing.bulletsEssentiel.map((b) =>
        b.startsWith("Participation au repositionnement de Fruggr") ? remplacer("Fruggr · Marketing, puce des films", b, b, "Saga de 3 films bilingues pour le repositionnement de Fruggr (Remotion en React)") : b,
      );
  }
  return { id: e.id, poste, contexteEssentiel: contexte, blocs };
});

// ── Formations : le nombre de projets est calculé (projets publiés), sauf mention ──
const formations = await prisma.formation.findMany();
const formMaj = formations.map((f) => ({
  id: f.id,
  projets: fixer(`Formation ${f.intitule} · projets`, f.projets, f.statut === "En cours" ? "En cours · fin prévue en 2027" : ""),
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
  ...expMaj.map((e) => prisma.experience.update({ where: { id: e.id }, data: { poste: e.poste, contexteEssentiel: e.contexteEssentiel, blocs: e.blocs as never } })),
  ...formMaj.map((f) => prisma.formation.update({ where: { id: f.id }, data: { projets: f.projets } })),
  prisma.project.update({ where: { id: "portfolio" }, data: { context: ctxPortfolio, steps: etapesPortfolio as never } }),
  prisma.project.update({ where: { id: "les-bambinets" }, data: { date: dateBambinets, context: ctxBambinets } }),
  prisma.project.update({ where: { id: "watchedthis" }, data: { docs: docsWatched as never } }),
  ...(carteMonde ? [prisma.project.update({ where: { id: "monde-de-dev" }, data: { homeCard: carteMonde as never } })] : []),
  ...(delphine && relationDelphine ? [prisma.recommendation.update({ where: { id: delphine.id }, data: { relation: relationDelphine } })] : []),
]);
console.log("Changements écrits en base.");
await prisma.$disconnect();
