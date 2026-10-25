// Critères de réception 2 et 4 (ADMIN-et-SYNCHRONISATION.md §7) avec deux dépôts simulés,
// pour ne pas créer de vrai dépôt public sur le compte de Clara.
// Usage (site lancé avec npm run start, base configurée) : npx tsx scripts/test-sync-github.ts
import { chromium } from "playwright";
import { encode } from "next-auth/jwt";

process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const { syncGithub, getSyncSettings, setSyncSettings } = await import("../lib/admin/sync");
const { listPublicRepos } = await import("../lib/admin/github");
const { A_COMPLETER } = await import("../lib/admin/projects");

const base = "http://localhost:3000";
const prisma = db();
let failures = 0;
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${label}`);
  if (!ok) failures++;
};

const now = new Date().toISOString();
const faux = [
  { id: 999_000_001, name: "depot-de-test-a-supprimer", full_name: "clarabernadou/depot-de-test-a-supprimer", description: "Dépôt de test (à supprimer)", html_url: "https://github.com/clarabernadou/depot-de-test-a-supprimer", pushed_at: now, fork: false, archived: false, size: 12 },
  { id: 999_000_002, name: "depot-sans-description-a-supprimer", full_name: "clarabernadou/depot-sans-description-a-supprimer", description: null, html_url: "https://github.com/clarabernadou/depot-sans-description-a-supprimer", pushed_at: now, fork: false, archived: false, size: 12 },
];
const repos = [...(await listPublicRepos("clarabernadou")), ...faux];
const source = { repos, languages: async () => ["TypeScript", "CSS"] };
const ids = ["depot-de-test-a-supprimer", "depot-sans-description-a-supprimer"];

try {
  // Critère 2 : un nouveau dépôt public apparaît dans « À compléter » en moins d'une minute.
  const t0 = Date.now();
  const r1 = await syncGithub({ source });
  const duree = (Date.now() - t0) / 1000;
  check(r1.created.length === 2, `Les 2 nouveaux dépôts créent un projet (${r1.created.join(", ")})`);
  check(duree < 60, `Synchronisation en ${duree.toFixed(1)} s (moins d’une minute)`);
  const p = await prisma.project.findUnique({ where: { id: ids[0] } });
  const q = await prisma.project.findUnique({ where: { id: ids[1] } });
  check(!!p && p.origin === "github" && p.visible && p.status === "published", "Projet avec description : publié et visible");
  check(!!q && !q.visible, "Projet sans description : créé mais masqué");
  check(!!p && A_COMPLETER.imports.test(p), "Le projet importé est compté dans « À compléter » du tableau de bord");
  const site = await (await fetch(`${base}/projets/${ids[0]}`)).text();
  check(site.includes("Dépôt de test (à supprimer)"), "Le projet apparaît sur le site public");

  // Critère 4 : une modification à la main survit à la synchronisation suivante.
  const token = await encode({ token: { githubId: process.env.ADMIN_GITHUB_ID }, secret: process.env.NEXTAUTH_SECRET!, maxAge: 600 });
  const b = await chromium.launch();
  const ctx = await b.newContext();
  await ctx.addCookies([{ name: "next-auth.session-token", value: token, url: base }]);
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);
  await page.goto(`${base}/admin/projets/${ids[0]}`);
  await page.getByLabel("Nom du projet").fill("Nom corrigé à la main (à supprimer)");
  await page.getByRole("button", { name: "Publier" }).click();
  await page.getByText("Projet publié.").waitFor();
  await b.close();
  const avant = await prisma.project.findUnique({ where: { id: ids[0] } });
  check((avant?.fieldMeta as Record<string, { locked: boolean }>)?.name?.locked === true, "Le nom modifié à la main est verrouillé");

  // Le dépôt change de nom et de description sur GitHub : seule la description suit.
  faux[0].name = "nouveau-nom-sur-github";
  faux[0].description = "Description changée sur GitHub (à supprimer)";
  const r2 = await syncGithub({ source });
  const apres = await prisma.project.findUnique({ where: { id: ids[0] } });
  check(apres?.name === "Nom corrigé à la main (à supprimer)", "La synchronisation conserve le nom corrigé à la main");
  check(apres?.line === "Description changée sur GitHub (à supprimer)", "Le champ non verrouillé (description) est mis à jour");
  check(r2.skipped.length === 1, "Le journal note que le nom a été conservé");
  const journal = await prisma.syncLog.findFirst({ where: { source: "github", action: "skipped", entityId: ids[0] } });
  check(!!journal?.message?.includes("corrigés à la main"), "Ligne du journal : « non modifiés, car corrigés à la main »");
} catch (e) {
  check(false, `Erreur : ${(e as Error).message}`);
} finally {
  // Nettoyage : projets et lignes de journal de test, dépôts simulés retirés de la référence.
  await prisma.project.deleteMany({ where: { id: { in: ids } } });
  await prisma.syncLog.deleteMany({ where: { entityId: { in: ids } } });
  await prisma.syncLog.deleteMany({ where: { message: { contains: "(à supprimer)" } } });
  const s = await getSyncSettings();
  s.github.baseline = (s.github.baseline ?? []).filter((x) => !faux.some((f) => f.id === x));
  await setSyncSettings(s);
}

console.log(failures ? `\n${failures} échec(s)` : "\nTous les contrôles passent.");
process.exit(failures ? 1 : 0);
