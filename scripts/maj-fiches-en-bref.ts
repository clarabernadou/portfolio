// 24 nov. 2026 : bandeau « en bref » (lib/en-bref.ts), valeurs proposées par Claude et transmises par Clara, qui a
// demandé de les enregistrer. Seules les cases remplies sont écrites (les « — » restent vides) ; une valeur déjà saisie
// n'est jamais écrasée ; rien d'autre ne change (ni statut, ni compétences, ni textes).
// La base est partagée avec le site en ligne : par défaut, simulation. Avec --appliquer (après npm run db:backup), écriture.
// Usage : npx tsx scripts/maj-fiches-en-bref.ts [--appliquer]
import { colonnesEnBref, type EnBref } from "../lib/en-bref";
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const VALEURS: Record<string, Partial<EnBref>> = {
  carbonscore: { role: "Développeuse full stack", equipe: "Dans une équipe de développeurs full stack" },
  "accessibilite-a11y": { role: "Développeuse full stack", equipe: "Équipe produit" },
  watchedthis: { role: "Développeuse full stack", equipe: "En solo", duree: "3 mois" },
  portfolio: { role: "UX designer et développeuse full stack", equipe: "En solo" },
  jarvis: { role: "Développeuse full stack", equipe: "En solo" },
  "les-bambinets": { role: "UX designer", equipe: "Avec un UI designer" },
};

const ecritures: { id: string; data: Partial<Record<keyof EnBref, string>> }[] = [];
let erreurs = 0;
for (const [id, v] of Object.entries(VALEURS)) {
  const p = await prisma.project.findFirst({ where: { id, deletedAt: null }, select: { id: true, name: true, role: true, equipe: true, duree: true } });
  if (!p) {
    console.error(`✗ ${id} : projet introuvable`);
    erreurs++;
    continue;
  }
  const verif = colonnesEnBref({ role: v.role ?? "", equipe: v.equipe ?? "", duree: v.duree ?? "" });
  if (!verif.ok) {
    console.error(`✗ ${id} : ${verif.error}`);
    erreurs++;
    continue;
  }
  const data: Partial<Record<keyof EnBref, string>> = {};
  for (const cle of ["role", "equipe", "duree"] as const) {
    const nouvelle = verif.data[cle];
    if (!nouvelle) continue;
    if (p[cle]) console.log(`  ${id} · ${cle} déjà rempli (« ${p[cle]} ») : inchangé`);
    else data[cle] = nouvelle;
  }
  if (Object.keys(data).length) ecritures.push({ id, data });
  console.log(`${p.name} : ${Object.entries(data).map(([k, x]) => `${k} = « ${x} »`).join(" · ") || "rien à écrire"}`);
}
if (erreurs) {
  console.error("\nRien n'est écrit : corriger d'abord les erreurs.");
  process.exit(1);
}
if (!process.argv.includes("--appliquer")) {
  console.log("\nSimulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup).");
  process.exit(0);
}
await prisma.$transaction(ecritures.map((e) => prisma.project.update({ where: { id: e.id }, data: e.data })));
console.log(`\n${ecritures.length} fiches mises à jour.`);
await prisma.$disconnect();
