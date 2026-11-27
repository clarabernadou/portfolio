// Typographie du site public (27 nov. 2026) : parcourt les pages du sitemap et échoue s'il trouve, dans le texte
// rendu (hors script, style, pre, code), dans le <title>, la meta description, og:title, og:description ou un
// attribut alt ou aria-label : une apostrophe droite entre deux lettres, un guillemet droit, « ... », ou une espace
// ordinaire avant « : ; ? ! % » (28 nov. 2026). Le texte est lu nœud par nœud et aussi bloc par bloc (paragraphe,
// élément de liste, titre…), pour voir une apostrophe coupée par une balise (« d'<strong>auditer</strong> »).
// Vérifie aussi que le <title> fait au plus 60 caractères. Avec --compter, affiche les comptes par page sans échouer.
// Usage : npm run test:typographie [-- --base http://localhost:3300] [--compter]
import { chromium } from "playwright";

const arg = (n) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null);
const base = arg("--base") ?? "http://localhost:3300";
const compter = process.argv.includes("--compter");

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const chemins = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

const REGLES = [
  { nom: "apostrophe droite", re: /\p{L}'(?=\p{L})/gu },
  { nom: "guillemet droit", re: /"/g },
  { nom: "« ... »", re: /\.\.\./g },
  { nom: "espace ordinaire avant : ; ? ! %", re: /\S \s*[:;?!%](?=\s|$)/g },
];

const browser = await chromium.launch();
const page = await browser.newPage();
let echecs = 0;
const lignes = [];
for (const chemin of chemins) {
  await page.goto(base + chemin, { waitUntil: "networkidle" });
  const morceaux = await page.evaluate(() => {
    const textes = [];
    const marche = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement?.closest("script, style, pre, code, noscript, template") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    while (marche.nextNode()) textes.push({ ou: "texte", t: marche.currentNode.textContent ?? "" });
    // Blocs : le texte d'un paragraphe ou d'un titre reconstitué, balises de mise en forme comprises.
    for (const el of document.body.querySelectorAll("p, li, dd, dt, h1, h2, h3, h4, h5, h6, figcaption, blockquote, td, th, label, summary")) {
      if (!el.closest("script, style, pre, code, noscript, template")) textes.push({ ou: "bloc", t: el.textContent ?? "" });
    }
    for (const el of document.querySelectorAll("[aria-label]")) textes.push({ ou: "aria-label", t: el.getAttribute("aria-label") ?? "" });
    textes.push({ ou: "title", t: document.title });
    for (const [sel, ou] of [["meta[name='description']", "meta description"], ["meta[property='og:title']", "og:title"], ["meta[property='og:description']", "og:description"]]) {
      const m = document.querySelector(sel);
      if (m) textes.push({ ou, t: m.getAttribute("content") ?? "" });
    }
    for (const img of document.querySelectorAll("img[alt]")) textes.push({ ou: "alt", t: img.getAttribute("alt") ?? "" });
    return { textes, titre: document.title };
  });
  const comptes = {};
  const exemples = [];
  for (const r of REGLES) {
    comptes[r.nom] = 0;
    for (const { ou, t } of morceaux.textes) {
      const n = [...t.matchAll(r.re)].length;
      if (n) {
        comptes[r.nom] += n;
        if (exemples.length < 3) exemples.push(`${ou} : « ${t.trim().slice(0, 90)} »`);
      }
    }
  }
  const tropLong = morceaux.titre.length > 60;
  const total = Object.values(comptes).reduce((a, b) => a + b, 0);
  lignes.push({ chemin, ...comptes, titre: morceaux.titre.length });
  if (!compter && (total || tropLong)) {
    echecs++;
    console.log(`✗ ${chemin} : ${Object.entries(comptes).filter(([, n]) => n).map(([k, n]) => `${n} ${k}`).join(", ")}${tropLong ? ` · titre de ${morceaux.titre.length} caractères` : ""}`);
    for (const e of exemples) console.log(`    ${e}`);
  }
}
await browser.close();
if (compter) {
  console.log("| Page | Apostrophes droites | Guillemets droits | « ... » | Espaces ordinaires avant : ; ? ! % | Titre (car.) |");
  console.log("|---|---|---|---|---|---|");
  for (const l of lignes) console.log(`| ${l.chemin} | ${l["apostrophe droite"]} | ${l["guillemet droit"]} | ${l["« ... »"]} | ${l["espace ordinaire avant : ; ? ! %"]} | ${l.titre} |`);
  const s = (k) => lignes.reduce((a, l) => a + l[k], 0);
  console.log(`| **Total (${lignes.length} pages)** | ${s("apostrophe droite")} | ${s("guillemet droit")} | ${s("« ... »")} | ${s("espace ordinaire avant : ; ? ! %")} | ${lignes.filter((l) => l.titre > 60).length} titre(s) > 60 |`);
  process.exit(0);
}
console.log(echecs ? `\n${echecs} page(s) en échec sur ${chemins.length}` : `\nTypographie correcte sur les ${chemins.length} pages du sitemap.`);
process.exit(echecs ? 1 : 0);
