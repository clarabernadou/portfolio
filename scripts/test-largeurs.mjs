// Largeur de contenu fluide (20 nov. 2026) : aucune page ne défile horizontalement, de 320 à 2560 px,
// ni à 1280 px zoomé à 200 %. Affiche la largeur de contenu mesurée (pied de page et contenu principal).
// Usage : npm run test:largeurs [-- http://localhost:3300]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3300";
const pages = ["/", "/projets", "/ia", "/cv"];
const largeurs = [320, 375, 768, 1024, 1440, 1920, 2560];
const b = await chromium.launch();
let echecs = 0;
const lignes = [];

async function mesurer(ctxOpts, libelle) {
  const ctx = await b.newContext(ctxOpts);
  const p = await ctx.newPage();
  const res = {};
  for (const route of pages) {
    await p.goto(base + route, { waitUntil: "networkidle" });
    const m = await p.evaluate(() => {
      const w = (el) => (el ? Math.round(parseFloat(getComputedStyle(el).width)) : null);
      return {
        scroll: document.documentElement.scrollWidth,
        inner: window.innerWidth,
        contenu: w(document.querySelector(".ft-in")),
      };
    });
    const ok = m.scroll <= m.inner;
    if (!ok) echecs++;
    res[route] = m;
    if (!ok) console.log(`ÉCHEC ${libelle} ${route} : scrollWidth ${m.scroll} > innerWidth ${m.inner}`);
  }
  await ctx.close();
  const c = res["/"].contenu;
  lignes.push(`| ${libelle} | ${c} px | ${pages.map((r) => (res[r].scroll <= res[r].inner ? "ok" : "défile")).join(" | ")} |`);
}

for (const w of largeurs) await mesurer({ viewport: { width: w, height: 900 } }, `${w} px`);
// Zoom 200 % à 1280 px : équivaut à une fenêtre de 640 px CSS avec un facteur d'échelle de 2.
await mesurer({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 }, "1280 px zoom 200 %");
await b.close();

console.log(`| Largeur | Contenu | ${pages.join(" | ")} |`);
console.log(`|---|---|${pages.map(() => "---").join("|")}|`);
console.log(lignes.join("\n"));
if (echecs) {
  console.log(`${echecs} page(s) avec défilement horizontal.`);
  process.exit(1);
}
console.log("Aucun défilement horizontal.");
