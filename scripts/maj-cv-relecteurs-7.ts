// Septième passage du CV, 5 nov. 2026 : nouvelles informations de Clara. Chiffre Semrush de l'équipe
// Marketing (sites français et anglais), année du salon VivaTech, outils d'audit d'accessibilité dans les
// compétences seulement (pas d'axe ni de WAVE dans les expériences, à sa demande), projet Portfolio sans
// score Lighthouse. Textes stockés en base.
// La base est partagée avec le site en ligne : par défaut, le script affiche seulement les changements
// (avant / après). Avec --appliquer, il les écrit, après une sauvegarde (npm run db:backup).
// Chaque valeur n'est remplacée que si elle est exactement celle attendue : sinon, rien n'est écrit.
// Avec --apercu-cv <dossier>, il génère les deux CV en PDF avec les nouvelles données, sans rien écrire.
// Usage : npx tsx scripts/maj-cv-relecteurs-7.ts [--appliquer | --apercu-cv <dossier>]
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

type Bloc = { name?: string; period?: string; bulletsEssentiel: string[] };
const remplacerPuce = (ou: string, b: Bloc | undefined, avant: string, apres: string) => {
  const i = b ? b.bulletsEssentiel.indexOf(avant) : -1;
  if (!b || i < 0) erreurs.push(`${ou} : puce attendue introuvable`);
  else b.bulletsEssentiel[i] = reecrire(ou, b.bulletsEssentiel[i], avant, apres);
};

// ── Fruggr, équipe Marketing : le chiffre Semrush ──
const fruggr = await prisma.experience.findFirstOrThrow({ where: { entreprise: "Fruggr" } });
const blocsFruggr = structuredClone(fruggr.blocs) as unknown as Bloc[];
remplacerPuce(
  "Fruggr · équipe Marketing · audits",
  blocsFruggr.find((b) => b.name === "Équipe Marketing : développement web et contenus"),
  "Audité l’UI/UX, l’accessibilité (WCAG, RGAA) et le SEO technique de sites, avec des recommandations priorisées ; corrigé les erreurs et avertissements relevés par Semrush",
  "Audité l’UI/UX, l’accessibilité (WCAG, RGAA) et le SEO technique de sites, avec des recommandations priorisées ; corrigé 281 erreurs critiques relevées par Semrush, avertissements ramenés à 0 sur la version française et à 1 sur la version anglaise",
);

// ── CarbonScore : l'année du salon (seule édition de VivaTech pendant l'alternance, déc. 2023 – fév. 2025) ──
const carbon = await prisma.experience.findFirstOrThrow({ where: { entreprise: "CarbonScore" } });
const blocsCarbon = structuredClone(carbon.blocs) as unknown as Bloc[];
remplacerPuce("CarbonScore · VivaTech", blocsCarbon[0], "Présenté CarbonScore au salon VivaTech, en représentant TechUpClimate", "Présenté CarbonScore au salon VivaTech 2024, en représentant TechUpClimate");

// ── Projet Portfolio : sans score Lighthouse (jamais de chiffre Lighthouse dans le CV) ──
type Profil = Record<string, unknown> & { projetsCv: { titre: string; puces: string[] }[] };
const rowProfil = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(rowProfil.data) as unknown as Profil;
const portfolio = profil.projetsCv.find((p) => p.titre === "Portfolio");
const ACCES = "Accessibilité : Lighthouse 100 et 0 erreur axe sur les pages principales, audit RGAA des 106 critères";
const iAcces = portfolio ? portfolio.puces.indexOf(ACCES) : -1;
if (!portfolio || iAcces < 0) erreurs.push("Projet Portfolio · accessibilité : puce attendue introuvable");
else portfolio.puces[iAcces] = reecrire("Projet Portfolio · accessibilité", ACCES, ACCES, "Accessibilité : audit RGAA des 106 critères, 0 erreur axe sur les pages principales");

// ── Compétences : les outils d'audit d'accessibilité ──
const uiux = await prisma.skillGroup.findFirstOrThrow({ where: { version: "essentiel", name: "UI/UX" } });
const itemsUiux = reecrire(
  "Compétences · UI/UX",
  uiux.items as unknown as string[],
  ["Figma", "Design system", "Prototypage", "Architecture de l’information", "Accessibilité (WCAG, RGAA)"],
  ["Figma", "Design system", "Prototypage", "Architecture de l’information", "Accessibilité (WCAG, RGAA)", "Audits (Lighthouse, axe, WAVE)"],
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
    findMany: async (a: never) => (await lireExp(a)).map((e) => (e.id === fruggr.id ? { ...e, blocs: blocsFruggr } : e.id === carbon.id ? { ...e, blocs: blocsCarbon } : e)),
  });
  const lireSkills = prisma.skillGroup.findMany.bind(prisma.skillGroup);
  Object.assign(prisma.skillGroup, { findMany: async (a: never) => (await lireSkills(a)).map((s) => (s.id === uiux.id ? { ...s, items: itemsUiux } : s)) });
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
  prisma.experience.update({ where: { id: carbon.id }, data: { blocs: blocsCarbon as never } }),
  prisma.skillGroup.update({ where: { id: uiux.id }, data: { items: itemsUiux as never } }),
]);
console.log("Changements écrits en base.");
await prisma.$disconnect();
