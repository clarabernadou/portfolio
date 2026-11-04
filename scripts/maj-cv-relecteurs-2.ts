// Second passage des relecteurs du CV (RH, manager, logiciel de tri), 4 nov. 2026 : textes stockés en base.
// La base est partagée avec le site en ligne : par défaut, le script affiche seulement les changements
// (avant / après). Avec --appliquer, il les écrit, après une sauvegarde (npm run db:backup).
// Chaque valeur n'est remplacée que si elle est exactement celle attendue : sinon, rien n'est écrit.
// Avec --apercu-cv <dossier>, il génère les deux CV en PDF avec les nouvelles données, sans rien écrire.
// Usage : npx tsx scripts/maj-cv-relecteurs-2.ts [--appliquer | --apercu-cv <dossier>]
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

// ── Profil ────────────────────────────────────────────────────────────────────
type Profil = Record<string, unknown> & { disponibilite: string; lieu: string; profilEssentiel: string };
const rowProfil = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(rowProfil.data) as unknown as Profil;
// Disponibilité réelle (fin d'alternance) dite comme une recherche, pas comme un délai.
profil.disponibilite = reecrire("Profil · disponibilité", profil.disponibilite, "disponible en mars 2027 (fin d’alternance)", "à partir de mars 2027 (fin d’alternance)");
// « Télétravail » d'abord : le mot cherché par les logiciels de tri français.
profil.lieu = reecrire("Profil · lieu", profil.lieu, "Full remote (télétravail) ou Vannes / Auray", "Télétravail (full remote) ou Vannes / Auray");
// Un exemple concret à la place de « l'IA fait partie de mon quotidien » ; « intégration » pour les offres d'intégrateur web.
profil.profilEssentiel = reecrire(
  "Profil · résumé du CV",
  profil.profilEssentiel,
  "Développeuse full-stack (React, TypeScript, Node.js), je conçois et développe des applications web accessibles, de la maquette Figma à la mise en production. Bac+5, en alternance depuis décembre 2023 sur deux plateformes SaaS ; l’IA fait partie de mon quotidien.",
  "Développeuse full-stack (React, TypeScript, Node.js), je conçois et développe des applications web accessibles, de la maquette Figma à l’intégration et à la mise en production. Bac+5 en développement logiciel, en alternance depuis décembre 2023 sur deux plateformes SaaS ; j’automatise mes tâches récurrentes avec l’IA (6 skills Claude proposés à l’équipe).",
);

// ── Expériences ───────────────────────────────────────────────────────────────
type Bloc = { name?: string; bulletsEssentiel: string[] };
const fruggr = await prisma.experience.findFirstOrThrow({ where: { entreprise: "Fruggr" } });
const blocsFruggr = structuredClone(fruggr.blocs) as unknown as Bloc[];
const marketing = blocsFruggr.find((b) => b.name?.startsWith("Équipe Marketing"));
if (!marketing) erreurs.push("Fruggr · bloc Marketing introuvable");
else {
  // « depuis juillet 2026 » à côté de « depuis juin 2026 » se lisait comme une incohérence de dates.
  const i = marketing.bulletsEssentiel.findIndex((b) => b.startsWith("Développé le thème WordPress"));
  const avant = marketing.bulletsEssentiel[i];
  if (i < 0 || !avant?.endsWith(" ; 23 pull requests depuis juillet 2026")) erreurs.push("Fruggr · puce WordPress différente de celle attendue");
  else marketing.bulletsEssentiel[i] = reecrire("Fruggr · puce WordPress", avant, avant, avant.replace(" ; 23 pull requests depuis juillet 2026", " ; 23 pull requests fusionnées"));
}
const carbon = await prisma.experience.findFirstOrThrow({ where: { entreprise: "CarbonScore" } });
// Le mois de mars 2025 comble l'écart apparent entre février (fin CarbonScore) et mars (début Fruggr).
const noteCarbon = reecrire(
  "CarbonScore · note",
  carbon.note,
  "Rachat de TechUpClimate par Digital4Better en 2025, mission poursuivie chez Fruggr sans interruption.",
  "Rachat de TechUpClimate par Digital4Better en 2025 : alternance poursuivie chez Fruggr dès mars 2025, sans interruption.",
);

// ── Compétences : technologies citées dans les expériences et absentes de la liste ──
const groupe = (name: string) => prisma.skillGroup.findFirstOrThrow({ where: { version: "essentiel", name } });
const back = await groupe("Back-end et données");
const itemsBack = reecrire("Compétences · Back-end et données", back.items as string[], ["Node.js", "NestJS", "Java (Spring Boot)", "SQL (PostgreSQL, MySQL)", "MongoDB"], ["Node.js", "NestJS", "Java (Spring Boot)", "SQL (PostgreSQL, MySQL)", "Prisma", "MongoDB"]);
const outils = await groupe("Outils et IA");
const itemsOutils = reecrire("Compétences · Outils et IA", outils.items as string[], ["Git", "Tests (Jest, Playwright)", "Claude Code", "Skills Claude sur mesure"], ["Git", "Azure", "WordPress", "Remotion", "Tests (Jest, Playwright)", "Claude Code", "Skills Claude sur mesure"]);

// ── Formation UX : suivie après le Bac+5, pas une régression de niveau ─────────────
const ux = await prisma.formation.findFirstOrThrow({ where: { intitule: "UX Design" } });
const mentionUx = reecrire("Formation UX Design · mention", ux.mentionComplementaire, null, "Formation complémentaire, suivie après le Bac+5 en développement logiciel");

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
    findMany: async (a: never) => (await lireExp(a)).map((e) => (e.id === fruggr.id ? { ...e, blocs: blocsFruggr } : e.id === carbon.id ? { ...e, note: noteCarbon } : e)),
  });
  const lireForm = prisma.formation.findMany.bind(prisma.formation);
  Object.assign(prisma.formation, { findMany: async (a: never) => (await lireForm(a)).map((f) => (f.id === ux.id ? { ...f, mentionComplementaire: mentionUx } : f)) });
  const lireSkills = prisma.skillGroup.findMany.bind(prisma.skillGroup);
  Object.assign(prisma.skillGroup, { findMany: async (a: never) => (await lireSkills(a)).map((s) => (s.id === back.id ? { ...s, items: itemsBack } : s.id === outils.id ? { ...s, items: itemsOutils } : s)) });
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
  prisma.experience.update({ where: { id: carbon.id }, data: { note: noteCarbon } }),
  prisma.skillGroup.update({ where: { id: back.id }, data: { items: itemsBack } }),
  prisma.skillGroup.update({ where: { id: outils.id }, data: { items: itemsOutils } }),
  prisma.formation.update({ where: { id: ux.id }, data: { mentionComplementaire: mentionUx } }),
]);
console.log("Changements écrits en base.");
await prisma.$disconnect();
