// Test de bout en bout des sous-catégories de captures (17 nov. 2026), sur la base de DÉMONSTRATION
// (données fictives) : « Médiathèque » a 2 sous-catégories et une capture sans groupe,
// « Carnet de rando » n'en a pas (non-régression).
// Prérequis : npm run demo:donnees, puis un site de démo construit et lancé, par exemple :
//   DEMO_PORT=3200 node scripts/demo/build-demo.mjs   (build + next start avec l'environnement de démo)
// Usage : DEMO_PORT=3200 npm run test:captures
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { DEMO_BASE } from "./demo/env-demo.mjs";

const base = process.env.TEST_BASE || DEMO_BASE;
const AVEC = "/projets/mediatheque-refonte";
const SANS = "/projets/carnet-de-rando";
let echecs = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) echecs++;
};

const browser = await chromium.launch();
const vignettes = (page) => page.getByRole("button", { name: /^Agrandir la capture/ });
const filtre = (page, nom) => page.getByRole("group", { name: "Filtrer les captures par sous-catégorie" }).getByRole("button", { name: nom });
const ouvrir = async (page, chemin) => {
  await page.goto(base + chemin, { waitUntil: "networkidle" });
};

// 1. Filtrer, compter, adresse, annonce, visionneuse.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await ouvrir(page, AVEC);
  const groupe = page.getByRole("group", { name: "Filtrer les captures par sous-catégorie" });
  const libelles = await groupe.getByRole("button").allInnerTexts();
  ok(JSON.stringify(libelles) === JSON.stringify(["Tout (4)", "Recherche (2)", "Compte lecteur (1)", "Autres (1)"]), `filtres dans l'ordre d'apparition : ${libelles.join(", ")}`);
  ok((await filtre(page, "Tout (4)").getAttribute("aria-pressed")) === "true", "« Tout » sélectionné par défaut");
  ok((await vignettes(page).count()) === 4, "4 captures visibles au départ");

  await filtre(page, "Recherche (2)").click();
  ok((await filtre(page, "Recherche (2)").getAttribute("aria-pressed")) === "true", "« Recherche » pressé après le clic");
  ok((await filtre(page, "Tout (4)").getAttribute("aria-pressed")) === "false", "« Tout » relâché");
  ok((await vignettes(page).count()) === 2, "2 captures visibles avec « Recherche »");
  ok(new URL(page.url()).searchParams.get("captures") === "recherche", `adresse : ${page.url()}`);
  ok((await page.locator("p[aria-live=polite]").innerText()) === "2 captures affichées", "nombre annoncé dans la région aria-live");
  ok((await vignettes(page).first().getAttribute("aria-label")).startsWith("Agrandir la capture 1 sur 2"), "position comptée dans le filtre (1 sur 2)");

  // Visionneuse : ne parcourt que les captures du filtre.
  await vignettes(page).first().click();
  const titre = page.locator("#captures-fenetre-titre");
  const t1 = await titre.innerText();
  await page.keyboard.press("ArrowRight");
  const t2 = await titre.innerText();
  await page.keyboard.press("ArrowRight");
  const t3 = await titre.innerText();
  ok(t1.startsWith("Page de recherche") && t2.startsWith("Résultats de recherche") && t3 === t1, `visionneuse limitée au filtre : ${t1.slice(0, 20)}… → ${t2.slice(0, 20)}… → retour au début`);
  await page.keyboard.press("Escape");
  ok((await page.getByRole("dialog").count()) === 0, "visionneuse fermée avec Échap");

  // Clavier : Tab jusqu'aux filtres, Entrée et Espace.
  await filtre(page, "Tout (4)").focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  ok((await page.evaluate(() => document.activeElement?.textContent)) === "Compte lecteur (1)", "Tab passe d'un filtre au suivant");
  await page.keyboard.press("Enter");
  ok((await vignettes(page).count()) === 1, "Entrée applique « Compte lecteur » (1 capture)");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  ok((await filtre(page, "Autres (1)").getAttribute("aria-pressed")) === "true", "Espace applique « Autres »");
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    const s = getComputedStyle(el);
    return `${s.outlineStyle} ${s.outlineWidth}`;
  });
  ok(focus === "solid 3px", `focus visible sur le filtre (${focus})`);
  const hauteur = await filtre(page, "Autres (1)").evaluate((b) => b.getBoundingClientRect().height);
  ok(hauteur >= 44, `cible de ${hauteur} px`);

  const axe = await new AxeBuilder({ page }).analyze();
  ok(axe.violations.length === 0, `axe : ${axe.violations.map((v) => v.id).join(", ") || "0 erreur"}`);

  // Adresse partagée, puis valeur inconnue.
  await ouvrir(page, `${AVEC}?captures=compte-lecteur`);
  ok((await filtre(page, "Compte lecteur (1)").getAttribute("aria-pressed")) === "true" && (await vignettes(page).count()) === 1, "lien partagé ?captures=compte-lecteur : filtre appliqué");
  await ouvrir(page, `${AVEC}?captures=inconnu`);
  ok((await filtre(page, "Tout (4)").getAttribute("aria-pressed")) === "true" && (await vignettes(page).count()) === 4, "paramètre inconnu : retour à « Tout »");
  await ctx.close();
}

// 1 bis. Visionneuse : capture mobile en portrait affichée en entière, puis zoom (17 nov. 2026).
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await ouvrir(page, `${AVEC}?captures=compte-lecteur`);
  await vignettes(page).first().click();
  const cadre = page.getByRole("dialog").getByRole("region");
  const image = cadre.locator("img");
  await image.evaluate((img) => img.decode());
  await page.waitForTimeout(200);
  const mesure = () =>
    cadre.evaluate((c) => {
      const i = c.querySelector("img").getBoundingClientRect();
      const r = c.getBoundingClientRect();
      return { defile: c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1, entiere: i.top >= r.top - 1 && i.bottom <= r.bottom + 1 && i.left >= r.left - 1 && i.right <= r.right + 1, l: Math.round(i.width) };
    });
  const m0 = await mesure();
  ok(m0.entiere && !m0.defile, `capture portrait entière, sans défilement (${m0.l} px de large)`);
  const zoom = page.getByRole("group", { name: "Zoom" });
  ok((await zoom.getByRole("button", { name: "Dézoomer" }).getAttribute("aria-disabled")) === "true", "« Dézoomer » inactif à la taille ajustée");
  await zoom.getByRole("button", { name: "Zoomer", exact: true }).click();
  const m1 = await mesure();
  ok(m1.defile && m1.l > m0.l * 1.4, `« Zoomer » agrandit l'image (${m0.l} → ${m1.l} px) et le cadre défile`);
  ok(/%$/.test(await zoom.locator("[aria-live]").innerText()), `niveau affiché : ${await zoom.locator("[aria-live]").innerText()}`);
  await page.keyboard.press("+");
  ok((await mesure()).l > m1.l, "touche + : zoom supplémentaire");
  const zoomer = zoom.getByRole("button", { name: "Zoomer", exact: true });
  while ((await zoomer.getAttribute("aria-disabled")) !== "true") await zoomer.click();
  await page.keyboard.press("Enter");
  ok((await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))) === "Zoomer", "au zoom maximal, le focus reste sur « Zoomer »");
  await zoom.getByRole("button", { name: "Ajuster" }).click();
  const m2 = await mesure();
  ok(m2.entiere && !m2.defile && (await page.evaluate(() => document.activeElement?.textContent)) === "Ajuster", "« Ajuster » rend l'image entière et garde le focus");
  await image.click();
  ok((await mesure()).defile, "clic sur l'image : zoom");
  await page.keyboard.press("0");
  ok((await mesure()).entiere, "touche 0 : image entière");
  const axe = await new AxeBuilder({ page }).include("[role=dialog]").analyze();
  ok(axe.violations.length === 0, `axe dans la visionneuse : ${axe.violations.map((v) => v.id).join(", ") || "0 erreur"}`);
  await ctx.close();
}

// 2. Non-régression : projet sans sous-catégorie.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await ouvrir(page, `${SANS}?captures=recherche`);
  ok((await page.getByRole("group", { name: "Filtrer les captures par sous-catégorie" }).count()) === 0, "sans sous-catégorie : aucun filtre");
  ok((await vignettes(page).count()) === 2, "sans sous-catégorie : les 2 captures");
  ok((await vignettes(page).first().getAttribute("aria-label")).startsWith("Agrandir la capture 1 sur 2 : Accueil du Carnet de rando"), "textes alternatifs inchangés");
  ok((await page.locator(".captures-apparition").count()) === 0, "aucune classe ajoutée à la galerie");
  await ctx.close();
}

// 3. Mobile : défilement des filtres sans défilement de la page ; animation réduite.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await ouvrir(page, AVEC);
  const r = await page.locator(".captures-filtres").evaluate((el) => ({ defile: getComputedStyle(el).overflowX, page: document.documentElement.scrollWidth }));
  ok(r.defile === "auto" && r.page <= 390, `390 px : rangée qui défile (${r.defile}), page de ${r.page} px`);
  await filtre(page, "Recherche (2)").focus();
  await page.keyboard.press("Tab");
  await page.waitForTimeout(300);
  const vu = await filtre(page, "Compte lecteur (1)").evaluate((b) => {
    const a = b.getBoundingClientRect();
    const p = b.parentElement.getBoundingClientRect();
    return a.left - 6 >= p.left && a.right + 6 <= p.right;
  });
  ok(vu, "un filtre atteint au clavier est entièrement visible avec son anneau");
  const anim = await page.locator(".captures-apparition").first().evaluate((el) => getComputedStyle(el).animationName);
  ok(anim === "none", `prefers-reduced-motion : animation ${anim}`);
  await ctx.close();
}

// 4. Sans JavaScript : toutes les captures, même avec un filtre dans l'adresse.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(`${base}${AVEC}?captures=recherche`, { waitUntil: "load" });
  ok((await vignettes(page).count()) === 4, "sans JavaScript : les 4 captures restent visibles");
  await ctx.close();
}

await browser.close();
console.log(echecs ? `\n${echecs} échec(s).` : "\nTous les contrôles passent.");
process.exit(echecs ? 1 : 0);
