// Troisième passage des relecteurs du CV (RH, manager, logiciel de tri) et précisions de Clara sur le back-end,
// 4 nov. 2026 : textes stockés en base.
// La base est partagée avec le site en ligne : par défaut, le script affiche seulement les changements
// (avant / après). Avec --appliquer, il les écrit, après une sauvegarde (npm run db:backup).
// Chaque valeur n'est remplacée que si elle est exactement celle attendue : sinon, rien n'est écrit.
// Avec --apercu-cv <dossier>, il génère les deux CV en PDF avec les nouvelles données, sans rien écrire.
// Usage : npx tsx scripts/maj-cv-relecteurs-3.ts [--appliquer | --apercu-cv <dossier>]
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

// ── Profil ────────────────────────────────────────────────────────────────────
type Profil = Record<string, unknown> & { profilEssentiel: string; noteIA: string; chiffreCle: { valeur: string; libelle: string } };
const rowProfil = await prisma.singleton.findUniqueOrThrow({ where: { key: "profil" } });
const profil = structuredClone(rowProfil.data) as unknown as Profil;
// Les 3 ans d'alternance visibles dès l'accroche (niveau de l'expérience).
profil.profilEssentiel = remplacer("Profil · résumé du CV", profil.profilEssentiel, "Bac+5 en développement logiciel, en alternance depuis décembre 2023 sur deux plateformes SaaS", "Bac+5 en développement logiciel, 3 ans d’alternance sur deux plateformes SaaS (depuis décembre 2023)");
// 75 (équipe Produit) + 23 (site WordPress) : le total exact plutôt que « plus de 95 ».
profil.chiffreCle = reecrire("Profil · chiffre clé de « En bref »", profil.chiffreCle, { valeur: "95+", libelle: "Plus de 95 pull requests fusionnées chez Fruggr" }, { valeur: "98", libelle: "pull requests fusionnées chez Fruggr" });
profil.noteIA = remplacer("Profil · profil pour l’IA", profil.noteIA, "Vue.js (Vuetify, Pinia) et TypeScript, back-end NestJS et PostgreSQL, tests unitaires ;", "Vue.js (Vuetify, Pinia) et TypeScript ; fonctionnalités entières développées du back-end (NestJS, PostgreSQL) au front-end : tableaux de bord, graphiques, calculs d'émissions, routes d'API, tests unitaires ;");
profil.noteIA = remplacer("Profil · profil pour l’IA", profil.noteIA, "évolutions back-end ponctuelles en NestJS et MongoDB (nouvelles routes d'API)", "fonctionnalités entières développées ponctuellement du back-end (NestJS, MongoDB, routes d'API) au front-end");

// ── Expériences : des fonctionnalités entières, du back-end au front-end (précision de Clara) ──
type Bloc = { name?: string; bulletsEssentiel: string[] };
const fruggr = await prisma.experience.findFirstOrThrow({ where: { entreprise: "Fruggr" } });
const contexteFruggr = remplacer("Fruggr · contexte", fruggr.contexteEssentiel, "Plus de 95 pull requests fusionnées.", "98 pull requests fusionnées.");
const blocsFruggr = structuredClone(fruggr.blocs) as unknown as Bloc[];
const produit = blocsFruggr.find((b) => b.name === "Équipe Produit");
const BACK_FRUGGR = "Réalisé des évolutions back-end ponctuelles en NestJS et MongoDB : routes d’API et gestion des données jusqu’au front-end ; relu du code, déployé de la préproduction à la production (Azure)";
const iF = produit ? produit.bulletsEssentiel.indexOf(BACK_FRUGGR) : -1;
if (!produit || iF < 0) erreurs.push("Fruggr · puce back-end introuvable");
else produit.bulletsEssentiel[iF] = reecrire("Fruggr · puce back-end", BACK_FRUGGR, BACK_FRUGGR, "Développé ponctuellement des fonctionnalités entières, du back-end (NestJS, MongoDB : routes d’API, données) au front-end ; relu du code, déployé de la préproduction à la production (Azure)");
const carbon = await prisma.experience.findFirstOrThrow({ where: { entreprise: "CarbonScore" } });
const blocsCarbon = structuredClone(carbon.blocs) as unknown as Bloc[];
const BACK_CARBON = "Fait évoluer le design de la plateforme sur Figma, puis intégré les maquettes en Vue.js (Vuetify, Pinia) et TypeScript ; réalisé des évolutions back-end en NestJS et PostgreSQL (routes d’API, gestion des données), avec des tests unitaires";
const iC = blocsCarbon[0] ? blocsCarbon[0].bulletsEssentiel.indexOf(BACK_CARBON) : -1;
if (iC < 0) erreurs.push("CarbonScore · puce design et back-end introuvable");
else
  blocsCarbon[0].bulletsEssentiel.splice(
    iC,
    1,
    ...reecrire("CarbonScore · puce design et back-end, séparée en deux", [BACK_CARBON], [BACK_CARBON], [
      "Fait évoluer le design de la plateforme sur Figma, puis intégré les maquettes en Vue.js (Vuetify, Pinia) et TypeScript",
      "Développé des fonctionnalités entières, du back-end au front-end (NestJS, PostgreSQL, Vue.js) : tableaux de bord, graphiques, calculs d’émissions, routes d’API et gestion des données ; écrit des tests unitaires",
    ]),
  );

// ── Compétences : celles de l'entreprise d'abord, Java et Angular à part (formation, sans niveau) ──
const groupe = (name: string) => prisma.skillGroup.findFirstOrThrow({ where: { version: "essentiel", name } });
const front = await groupe("Front-end");
const itemsFront = reecrire("Compétences · Front-end", front.items as string[], ["React", "TypeScript / JavaScript", "HTML / CSS", "Next.js", "Tailwind CSS", "Angular"], ["React", "TypeScript / JavaScript", "Intégration web (HTML / CSS)", "Next.js", "Vue.js", "Tailwind CSS"]);
const back = await groupe("Back-end et données");
const itemsBack = reecrire("Compétences · Back-end et données", back.items as string[], ["Node.js", "NestJS", "Java (Spring Boot)", "SQL (PostgreSQL, MySQL)", "Prisma", "MongoDB"], ["Node.js", "NestJS", "SQL (PostgreSQL, MySQL)", "Prisma", "MongoDB"]);
const GROUPE_FORMATION = "Pratiqué en formation (Bac+5)";
if (await prisma.skillGroup.findFirst({ where: { version: "essentiel", name: GROUPE_FORMATION } })) erreurs.push(`Compétences · groupe « ${GROUPE_FORMATION} » déjà présent`);
const dernier = await prisma.skillGroup.findFirst({ where: { version: "essentiel" }, orderBy: { position: "desc" } });
const nouveauGroupe = { version: "essentiel", name: GROUPE_FORMATION, items: ["Java (Spring Boot)", "Angular"], position: (dernier?.position ?? 0) + 1 };
changements.push({ ou: "Compétences · nouveau groupe", avant: null, apres: nouveauGroupe });

// ── Formation UX : « En alternance » est celle de Fruggr, pas un second emploi ──
const ux = await prisma.formation.findFirstOrThrow({ where: { intitule: "UX Design" } });
const mentionUx = reecrire("Formation UX Design · mention", ux.mentionComplementaire, "Formation complémentaire, suivie après le Bac+5 en développement logiciel", "Formation complémentaire, suivie après le Bac+5 en développement logiciel, en parallèle de l’alternance chez Fruggr");

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
    findMany: async (a: never) => (await lireExp(a)).map((e) => (e.id === fruggr.id ? { ...e, contexteEssentiel: contexteFruggr, blocs: blocsFruggr } : e.id === carbon.id ? { ...e, blocs: blocsCarbon } : e)),
  });
  const lireForm = prisma.formation.findMany.bind(prisma.formation);
  Object.assign(prisma.formation, { findMany: async (a: never) => (await lireForm(a)).map((f) => (f.id === ux.id ? { ...f, mentionComplementaire: mentionUx } : f)) });
  const lireSkills = prisma.skillGroup.findMany.bind(prisma.skillGroup);
  Object.assign(prisma.skillGroup, {
    findMany: async (a: never) => [...(await lireSkills(a)).map((s) => (s.id === front.id ? { ...s, items: itemsFront } : s.id === back.id ? { ...s, items: itemsBack } : s)), { id: 0, ...nouveauGroupe }],
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
  prisma.experience.update({ where: { id: fruggr.id }, data: { contexteEssentiel: contexteFruggr, blocs: blocsFruggr as never } }),
  prisma.experience.update({ where: { id: carbon.id }, data: { blocs: blocsCarbon as never } }),
  prisma.skillGroup.update({ where: { id: front.id }, data: { items: itemsFront } }),
  prisma.skillGroup.update({ where: { id: back.id }, data: { items: itemsBack } }),
  prisma.skillGroup.create({ data: nouveauGroupe }),
  prisma.formation.update({ where: { id: ux.id }, data: { mentionComplementaire: mentionUx } }),
]);
console.log("Changements écrits en base.");
await prisma.$disconnect();
