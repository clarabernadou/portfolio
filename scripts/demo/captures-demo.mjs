// Captures de base de l'administration de DÉMO (données fictives), en 1440 et 390 px.
// Usage (serveur lancé avec npm run demo:serveur) : npm run demo:captures [-- /admin/projets …]
// Les fichiers vont dans audit/demo-admin/ (dossier ignoré par Git).
// Les captures d'états (fenêtres, menus, IA…) se font à part : voir docs/demo/PROMPT-CAPTURES-ADMIN.md.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { connecterDemo, DEMO_BASE } from "./session-demo.mjs";

const ROUTES = [
  "/admin",
  "/admin/projets",
  "/admin/projets?a-completer=retour",
  "/admin/projets/carnet-de-rando",
  "/admin/projets/api-recettes",
  "/admin/projets/nouveau",
  "/admin/categories",
  "/admin/formations",
  "/admin/experiences",
  "/admin/competences",
  "/admin/profil",
  "/admin/page-ia",
  "/admin/synchronisation",
  "/projets/covoiturage-ecole",
];
const demandees = process.argv.slice(2).filter((a) => a.startsWith("/"));
const routes = demandees.length ? demandees : ROUTES;
const out = "audit/demo-admin";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const w of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  await connecterDemo(ctx);
  const page = await ctx.newPage();
  for (const r of routes) {
    await page.goto(DEMO_BASE + r, { waitUntil: "networkidle", timeout: 120_000 });
    await page.evaluate(() => document.fonts.ready);
    if (page.url().includes("/admin/connexion")) throw new Error("Session refusée : le serveur tourne-t-il en mode démo (npm run demo:serveur) ?");
    const file = `${out}/${r.replace(/^\//, "").replace(/[/?=&]/g, "_") || "accueil"}.${w}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${r} @${w} → ${file}`);
  }
  await ctx.close();
}
await browser.close();
