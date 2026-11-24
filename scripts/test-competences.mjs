// Test de bout en bout de l'ajout d'une compétence mise en pratique (24 nov. 2026), sur la base de DÉMONSTRATION :
// sur « Carnet de rando » (projet personnel), ajout d'une compétence, enregistrement, rechargement (toujours cochée),
// aperçu public, doublon refusé (casse et accents), puis proposée sur une autre fiche du même cadre.
// Prérequis : npm run demo:donnees, puis DEMO_PORT=3200 node scripts/demo/build-demo.mjs.
// Usage : DEMO_PORT=3200 node scripts/test-competences.mjs (relancer npm run demo:donnees ensuite).
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { DEMO_BASE, connecterDemo } from "./demo/session-demo.mjs";

let echecs = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) echecs++;
};
const NOUVELLE = "Concevoir une architecture hors ligne";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await connecterDemo(ctx);
const page = await ctx.newPage();
const champ = () => page.getByRole("textbox", { name: "Ajouter une compétence", exact: true });
const case_ = (n) => page.getByRole("group", { name: "Compétences mises en pratique" }).getByRole("checkbox", { name: n, exact: true });

await page.goto(`${DEMO_BASE}/admin/projets/carnet-de-rando`);
const existantes = await page.getByRole("group", { name: "Compétences mises en pratique" }).getByRole("checkbox").evaluateAll((cs) => cs.filter((c) => c.checked).length);
await champ().fill(NOUVELLE);
await champ().press("Enter");
ok(await case_(NOUVELLE).isChecked(), "ajoutée et cochée tout de suite");
ok((await champ().inputValue()) === "", "champ vidé après l'ajout");

// Doublon : même compétence, autre casse, sans accents.
await champ().fill("concevoir une INTERFACE mobile");
await champ().press("Enter");
ok(await page.getByText("« Concevoir une interface mobile » est déjà cochée.").isVisible(), "doublon refusé (casse et accents ignorés)");
ok((await page.getByRole("group", { name: "Compétences mises en pratique" }).getByRole("checkbox", { name: /interface mobile/i }).count()) === 1, "pas de seconde case pour le doublon");
await champ().fill("");

// Limite de 80 caractères dans le champ.
await champ().fill("x".repeat(90));
ok((await champ().inputValue()).length === 80, "80 caractères au plus dans le champ");
await champ().fill("");

const axe = await new AxeBuilder({ page }).include("main").analyze();
ok(axe.violations.length === 0, `axe (page de la fiche) : ${axe.violations.length} erreur(s)${axe.violations.map((v) => ` ${v.id}`).join("")}`);

await page.getByRole("button", { name: "Publier" }).click();
ok(await page.getByText("Projet publié.").waitFor({ timeout: 15000 }).then(() => true, () => false), "enregistrement");
await page.reload();
ok(await case_(NOUVELLE).isChecked(), "toujours cochée après rechargement");
const apres = await page.getByRole("group", { name: "Compétences mises en pratique" }).getByRole("checkbox").evaluateAll((cs) => cs.filter((c) => c.checked).length);
ok(apres === existantes + 1, `compétences existantes gardées (${existantes} + 1 = ${apres})`);

// Aperçu public.
await page.goto(`${DEMO_BASE}/apercu/projets/carnet-de-rando`, { waitUntil: "networkidle" });
const publiques = await page.locator("section:has(h2:text-is('Compétences mises en pratique')) li").allInnerTexts();
ok(publiques.some((t) => t.includes(NOUVELLE)), `visible dans l'aperçu public (${publiques.length} compétences)`);

// Proposée sur une autre fiche du même cadre (« Covoiturage », projet personnel), non cochée.
await page.goto(`${DEMO_BASE}/admin/projets/covoiturage-ecole`);
ok((await case_(NOUVELLE).count()) === 1 && !(await case_(NOUVELLE).isChecked()), "proposée, non cochée, sur une autre fiche du même cadre");

await browser.close();
console.log(echecs ? `\n${echecs} échec(s)` : "\nTout est bon.");
process.exit(echecs ? 1 : 0);
