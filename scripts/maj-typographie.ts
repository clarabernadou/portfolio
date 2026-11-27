// 27 nov. 2026 : demande de Clara. Migration typographique des données existantes (lib/typographie.ts) : tous les
// champs texte des projets, formations, expériences, compétences, catégories, recommandations et des réglages de
// contenu (profil, page IA, formations courtes). Les catégories sont incluses pour que le cadre d'un projet reste
// identique à sa catégorie (filtres de /projets). Seuls les champs qui changent sont écrits, une fiche à la fois (la
// base distante refuse une opération groupée de plus de 5 s). Avec --appliquer, sauvegarde complète de la base dans
// backups/ (npm run db:backup) avant toute écriture. Relancer le script ne change plus rien.
// Usage : npx tsx scripts/maj-typographie.ts [--appliquer]
export {};
import { execSync } from "node:child_process";
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const { normaliserTypoProfond } = await import("../lib/typographie");
const prisma = db();
const appliquer = process.argv.includes("--appliquer");

// Colonnes jamais réécrites (identifiants, dates, champs techniques ; les clés ignorées dans les JSON sont gérées par
// normaliserTypoProfond).
const TECHNIQUES = new Set(["id", "key", "position", "createdAt", "updatedAt", "deletedAt", "generatedAt", "visible", "status", "onHome", "featured", "fieldMeta", "origin", "i18n"]);

type Ligne = Record<string, unknown>;
function changements(ligne: Ligne): Ligne {
  const data: Ligne = {};
  for (const [k, v] of Object.entries(ligne)) {
    if (TECHNIQUES.has(k) || v === null || v === undefined) continue;
    const n = normaliserTypoProfond(v, k);
    if (JSON.stringify(n) !== JSON.stringify(v)) data[k] = n;
  }
  return data;
}

if (appliquer) {
  console.log("Sauvegarde de la base dans backups/…");
  execSync("npm run db:backup", { stdio: "inherit" });
}

type Table = { nom: string; lire: () => Promise<Ligne[]>; ecrire: (l: Ligne, data: Ligne) => Promise<unknown>; libelle: (l: Ligne) => string };
const p = prisma as unknown as Record<string, { findMany: (a?: unknown) => Promise<Ligne[]>; update: (a: unknown) => Promise<unknown> }>;
const parId = (modele: string, cle = "name"): Table => ({
  nom: modele,
  lire: () => p[modele].findMany(),
  ecrire: (l, data) => p[modele].update({ where: { id: l.id }, data }),
  libelle: (l) => String(l[cle] ?? l.id),
});
const tables: Table[] = [
  parId("project", "id"),
  parId("formation", "intitule"),
  parId("experience", "entreprise"),
  parId("skillGroup", "name"),
  parId("category", "name"),
  parId("recommendation", "auteur"),
  {
    nom: "singleton",
    lire: () => p.singleton.findMany({ where: { key: { in: ["profil", "ia", "formationsCourtes"] } } }),
    ecrire: (l, data) => p.singleton.update({ where: { key: l.key }, data }),
    libelle: (l) => String(l.key),
  },
];

let total = 0;
for (const t of tables) {
  const lignes = await t.lire();
  let n = 0;
  for (const l of lignes) {
    const data = changements(l);
    const champs = Object.keys(data);
    if (!champs.length) continue;
    n++;
    console.log(`${t.nom.padEnd(14)} ${t.libelle(l).slice(0, 34).padEnd(34)} ${champs.join(", ")}`);
    if (appliquer) await t.ecrire(l, data);
  }
  console.log(`→ ${t.nom} : ${n} ligne(s) sur ${lignes.length} ${appliquer ? "mise(s) à jour" : "à mettre à jour"}\n`);
  total += n;
}
console.log(appliquer ? `${total} ligne(s) mises à jour.` : `${total} ligne(s) à mettre à jour. Simulation : rien n'est écrit. Relancer avec --appliquer.`);
await prisma.$disconnect();
