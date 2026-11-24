// Test de bout en bout du bandeau « en bref » de la fiche projet (24 nov. 2026), sur la base de DÉMONSTRATION :
// « Médiathèque » a un rôle, une équipe et une durée (fictifs), « Carnet de rando » n'en a pas (pas de bandeau). Puis
// l'administration : saisie des 3 champs, limite refusée, valeurs relues après enregistrement.
// Prérequis : npm run demo:donnees, puis DEMO_PORT=3200 node scripts/demo/build-demo.mjs.
// Usage : DEMO_PORT=3200 node scripts/test-en-bref.mjs (relancer npm run demo:donnees ensuite).
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { DEMO_BASE, connecterDemo } from "./demo/session-demo.mjs";

let echecs = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) echecs++;
};
const browser = await chromium.launch();
const faits = async (page) =>
  page.locator("dl.en-bref > div").evaluateAll((ds) => ds.map((d) => `${d.querySelector("dt").textContent} : ${d.querySelector("dd").textContent}`));

for (const largeur of [1440, 390]) {
  const page = await (await browser.newContext({ viewport: { width: largeur, height: 900 } })).newPage();
  await page.goto(`${DEMO_BASE}/projets/mediatheque-refonte`, { waitUntil: "networkidle" });
  const f = await faits(page);
  ok(f.length === 3 && f[0] === "Rôle : UX designer" && f[1] === "Équipe : En binôme" && f[2] === "Durée : 4 mois", `[${largeur}] médiathèque : ${f.join(" · ")}`);
  const entete = await page.locator("main header").first().innerText();
  ok(/\|[\s,]*Bachelor Concepteur UX/.test(entete), `[${largeur}] cadre dans l'en-tête, après la date`);
  ok((await page.getByRole("heading", { level: 2, name: "Le projet en bref" }).count()) === 1, `[${largeur}] titre de section (masqué visuellement)`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= largeur, `[${largeur}] pas de défilement horizontal (${sw} px)`);
  const axe = await new AxeBuilder({ page }).include("dl.en-bref").analyze();
  ok(axe.violations.length === 0, `[${largeur}] axe : ${axe.violations.length} erreur(s)${axe.violations.map((v) => ` ${v.id}`).join("")}`);
  await page.locator("dl.en-bref").screenshot({ path: `audit/en-bref-${largeur}.png` }).catch(() => {});
  await page.goto(`${DEMO_BASE}/projets/carnet-de-rando`, { waitUntil: "networkidle" });
  ok((await page.locator("dl.en-bref").count()) === 0 && (await page.getByRole("heading", { name: "Le projet en bref" }).count()) === 0, `[${largeur}] carnet de rando : aucun champ, pas de bandeau`);
  await page.context().close();
}

// Administration.
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await connecterDemo(ctx);
const page = await ctx.newPage();
await page.goto(`${DEMO_BASE}/admin/projets/carnet-de-rando`);
const champ = (n) => page.getByRole("textbox", { name: n, exact: true });
await champ("Rôle (facultatif)").fill("x".repeat(81));
await page.getByRole("button", { name: "Publier" }).click();
ok(await page.getByText("« Rôle » dépasse 80 caractères").first().waitFor({ timeout: 15000 }).then(() => true, () => false), "admin : 81 caractères refusés avec un message");
await champ("Rôle (facultatif)").fill("Développeuse front-end");
await champ("Équipe (facultatif)").fill("En solo");
await champ("Durée (facultatif)").fill("6 semaines");
await page.getByRole("button", { name: "Publier" }).click();
ok(await page.getByText("Projet publié.").waitFor({ timeout: 15000 }).then(() => true, () => false), "admin : enregistrement");
await page.reload();
ok((await champ("Rôle (facultatif)").inputValue()) === "Développeuse front-end" && (await champ("Durée (facultatif)").inputValue()) === "6 semaines", "admin : valeurs relues après enregistrement");
await ctx.close();

await browser.close();
console.log(echecs ? `\n${echecs} échec(s)` : "\nTout est bon.");
process.exit(echecs ? 1 : 0);
