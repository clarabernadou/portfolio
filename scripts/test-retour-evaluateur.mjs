// Test de bout en bout du bloc « Retour de l'évaluateur » (23 nov. 2026), sur la base de DÉMONSTRATION
// (données fictives) : « Médiathèque » a une évaluation, « Carnet de rando » n'en a pas (aucun titre orphelin).
// Puis l'administration : saisie de l'évaluation d'un projet Privé (« Tableau de bord énergie ») ; une fiche
// Privé reste Privé avec « Publier » comme avec « Enregistrer le brouillon », et le message suit le statut réel.
// Prérequis : npm run demo:donnees, puis DEMO_PORT=3200 node scripts/demo/build-demo.mjs.
// Usage : DEMO_PORT=3200 node scripts/test-retour-evaluateur.mjs (relancer npm run demo:donnees ensuite).
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { DEMO_BASE, connecterDemo } from "./demo/session-demo.mjs";

const base = DEMO_BASE;
const AVEC = "/projets/mediatheque-refonte";
const SANS = "/projets/carnet-de-rando";
const PRIVE = "tableau-de-bord-energie";
const SOURCE = "Évaluation de soutenance OpenClassrooms, reproduite telle quelle.";
let echecs = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) echecs++;
};

const browser = await chromium.launch();

// 1. Fiche avec évaluation : titres, listes, source, accessibilité, à 1440 et 390 px.
for (const largeur of [1440, 390]) {
  const page = await (await browser.newContext({ viewport: { width: largeur, height: 900 } })).newPage();
  await page.goto(base + AVEC, { waitUntil: "networkidle" });
  const section = page.locator("section[aria-labelledby='retour-evaluateur']");
  ok(await page.getByRole("heading", { level: 2, name: "Retour de l’évaluateur" }).isVisible(), `[${largeur}] titre h2 « Retour de l’évaluateur »`);
  const h2 = await page.locator("main h2").allInnerTexts();
  const iExp = h2.indexOf("Retour d’expérience");
  ok(iExp >= 0 && h2[iExp + 1] === "Retour de l’évaluateur", `[${largeur}] juste sous le retour d’expérience (${h2.join(" › ")})`);
  const h3 = await section.locator("h3").allInnerTexts();
  ok(JSON.stringify(h3) === JSON.stringify(["Points forts", "Axes d’amélioration", "Remarque sur la soutenance"]), `[${largeur}] un h3 par champ rempli : ${h3.join(", ")}`);
  ok(await section.getByText("Soutenance réalisée en juin 2025").isVisible(), `[${largeur}] mois de soutenance`);
  const forts = section.locator("article", { has: page.getByRole("heading", { name: "Points forts" }) });
  ok((await forts.getByRole("listitem").count()) === 2, `[${largeur}] points forts sur 2 lignes → liste de 2 éléments`);
  const axes = section.locator("article", { has: page.getByRole("heading", { name: "Axes d’amélioration" }) });
  ok((await axes.locator("ul").count()) === 0 && (await axes.locator("p").count()) === 1, `[${largeur}] axe sur 1 ligne → paragraphe`);
  ok((await section.locator("> p").last().innerText()) === SOURCE, `[${largeur}] mention de source en dernier`);
  // Disposition (25 nov. 2026) : bureau, Points forts (≈ 60 %) et Axes côte à côte, à la même hauteur, Remarque en pleine
  // largeur dessous ; mobile, une colonne dans l'ordre, cartes à la hauteur de leur contenu.
  const boites = await section.locator("ul.eval-grille > li").evaluateAll((lis) => lis.map((li) => { const r = li.getBoundingClientRect(); const a = li.querySelector("article").getBoundingClientRect(); return { titre: li.querySelector("h3").textContent, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), etire: Math.round(r.height - a.height) }; }));
  const [f, a2, r2] = boites;
  if (largeur >= 1024) {
    const part = f.w / (f.w + a2.w);
    const hauteurs = await section.locator("ul.eval-grille > li > article").evaluateAll((as) => as.map((a) => Math.round(a.getBoundingClientRect().height)));
    ok(f.titre === "Points forts" && a2.x > f.x && a2.y === f.y && part > 0.55 && part < 0.65 && hauteurs[0] === hauteurs[1], `[${largeur}] Points forts (${Math.round(part * 100)} %) et Axes côte à côte, même hauteur`);
    ok(r2.x === f.x && r2.y > f.y && r2.w > f.w + a2.w, `[${largeur}] Remarque en pleine largeur dessous`);
  } else {
    ok(boites.every((b) => b.x === f.x) && f.y < a2.y && a2.y < r2.y, `[${largeur}] une colonne : Points forts, Axes, Remarque`);
    ok(boites.every((b) => b.etire <= 1), `[${largeur}] cartes à la hauteur de leur contenu`);
  }
  ok((await page.getByRole("button", { name: /Tout ouvrir/ }).count()) === 0 && (await page.getByRole("link", { name: /Tout ouvrir/ }).count()) === 0, `[${largeur}] pas de bouton « Tout ouvrir »`);
  const largeurPage = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(largeurPage <= largeur, `[${largeur}] pas de défilement horizontal (${largeurPage} px)`);
  const axe = await new AxeBuilder({ page }).include("section[aria-labelledby='retour-evaluateur']").analyze();
  ok(axe.violations.length === 0, `[${largeur}] axe : ${axe.violations.length} erreur(s)${axe.violations.map((v) => ` ${v.id}`).join("")}`);
  if (largeur === 1440) await section.screenshot({ path: "audit/retour-evaluateur-1440.png" }).catch(() => {});
  else await section.screenshot({ path: "audit/retour-evaluateur-390.png" }).catch(() => {});
  await page.context().close();
}

// 2. Fiche sans évaluation : ni titre, ni mention.
{
  const page = await browser.newPage();
  await page.goto(base + SANS, { waitUntil: "networkidle" });
  ok(await page.getByRole("heading", { name: "Retour d’expérience" }).isVisible(), "fiche sans évaluation : le retour d’expérience reste affiché");
  ok((await page.getByText("Retour de l’évaluateur").count()) === 0, "fiche sans évaluation : aucun titre « Retour de l’évaluateur »");
  ok((await page.getByText(SOURCE).count()) === 0, "fiche sans évaluation : aucune mention de source");
  await page.close();
}

// 3. Administration : un projet Privé garde-t-il son statut ?
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await connecterDemo(ctx);
  const page = await ctx.newPage();
  const statut = async () => (await page.getByText(/^Statut actuel :/).innerText()).replace(/ ·.*/, "").replace("Statut actuel : ", "");
  await page.goto(`${base}/admin/projets/${PRIVE}`);
  ok((await statut()) === "Privé", `admin : statut de départ « ${await statut()} »`);
  await page.getByRole("heading", { level: 2, name: "Retour de l’évaluateur" }).scrollIntoViewIfNeeded();
  await page.getByRole("textbox", { name: "Mois et année de soutenance", exact: true }).fill("mai 2025");
  await page.getByRole("textbox", { name: "Points forts", exact: true }).fill("Code lisible.\nTests complets.");
  await page.getByRole("textbox", { name: "Remarque sur la soutenance (facultatif)", exact: true }).fill("Démonstration fluide.");
  const compteurs = await page.locator(".adm-count").allInnerTexts();
  ok(compteurs.includes("29 / 600") && compteurs.includes("21 / 400"), `admin : compteurs de caractères (${compteurs.filter((t) => / \/ (600|400)$/.test(t)).join(", ")})`);
  // Dépassement : refusé à l'enregistrement, statut inchangé.
  await page.getByRole("textbox", { name: "Axes d’amélioration (facultatif)", exact: true }).fill("a".repeat(601));
  await page.getByRole("button", { name: "Publier" }).click();
  const refus = await page.getByText(/dépasse 600 caractères/).first().waitFor({ timeout: 15000 }).then(() => true, () => false);
  ok(refus && !(await page.getByText("Projet publié.").isVisible()), "admin : 601 caractères refusés avec un message, rien n’est enregistré");
  await page.getByRole("textbox", { name: "Axes d’amélioration (facultatif)", exact: true }).fill("");

  const PRIVE_MSG = "Fiche enregistrée, statut : Privé";
  await page.getByRole("button", { name: "Publier" }).click();
  const msgPublier = await page.getByText(PRIVE_MSG).waitFor({ timeout: 15000 }).then(() => true, () => false);
  ok(msgPublier && !(await page.getByText("Projet publié.").isVisible()), `admin : « Publier » sur une fiche Privé → message « ${PRIVE_MSG} »`);
  ok(!(await page.getByText("Modifications non enregistrées").isVisible()), "admin : plus de modifications en attente après l’enregistrement");
  await page.reload();
  ok((await statut()) === "Privé", `admin : « Publier » sur un projet Privé → « ${await statut()} »`);
  ok((await page.getByRole("textbox", { name: "Points forts", exact: true }).inputValue()) === "Code lisible.\nTests complets.", "admin : évaluation relue après enregistrement");
  const pub = await fetch(`${base}/projets/${PRIVE}`);
  // Projet non publié : page « en cours de validation » (noindex), jamais la fiche ni son évaluation.
  const html = await pub.text();
  ok(!html.includes("Retour de l’évaluateur") && !html.includes("Code lisible."), `site public : le projet privé ne montre pas la fiche (${pub.status}, page « en cours de validation »)`);

  // « Enregistrer le brouillon » ne fait plus passer une fiche Privé en Brouillon (23 nov. 2026).
  await page.getByRole("button", { name: "Enregistrer le brouillon" }).click();
  const msgBrouillon = await page.getByText(PRIVE_MSG).waitFor({ timeout: 15000 }).then(() => true, () => false);
  ok(msgBrouillon && !(await page.getByText("Brouillon enregistré.").isVisible()), `admin : « Enregistrer le brouillon » sur une fiche Privé → message « ${PRIVE_MSG} »`);
  await page.reload();
  ok((await statut()) === "Privé", `admin : « Enregistrer le brouillon » sur un projet Privé → « ${await statut()} »`);

  // Fiche publique : « Projet publié. » et statut Publié.
  await page.goto(`${base}/admin/projets/mediatheque-refonte`);
  ok((await statut()) === "Publié", `admin : fiche publique, statut de départ « ${await statut()} »`);
  await page.getByRole("button", { name: "Publier" }).click();
  const msgPublic = await page.getByText("Projet publié.").waitFor({ timeout: 15000 }).then(() => true, () => false);
  ok(msgPublic, "admin : « Publier » sur une fiche publique → « Projet publié. »");
  await page.reload();
  ok((await statut()) === "Publié", `admin : fiche publique après « Publier » → « ${await statut()} »`);
  await ctx.close();
}

await browser.close();
console.log(echecs ? `\n${echecs} échec(s)` : "\nTout est bon.");
process.exit(echecs ? 1 : 0);
