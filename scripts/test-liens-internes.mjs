// Aucun lien interne cliquable d'une page publique ne mène à une page d'erreur ni à un projet non publié
// (demande de Clara, 4 nov. 2026). Parcourt les pages publiques depuis le plan du site, relève chaque
// lien interne <a href="/…"> et vérifie qu'il répond 200 sans être la page 404 ni « en cours de validation ».
// Usage : serveur lancé (npm run dev ou npm run start), puis npm run test:liens [-- --base URL]
const base = process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : "http://localhost:3000";
let failures = 0;
const check = (ok, label) => {
  if (!ok) console.log(`ÉCHEC ${label}`);
  if (!ok) failures++;
};

const lire = async (chemin) => {
  const r = await fetch(new URL(chemin, base), { redirect: "manual" });
  return { status: r.status, html: r.status === 200 ? await r.text() : "" };
};
// Pages d'erreur ou d'attente reconnues à leur titre (app/not-found.tsx, components/proto/ProjetEnValidation.tsx).
const pageVide = (html) => /<title>[^<]*(Page introuvable|Projet en cours de validation)/.test(html);
const liens = (html) =>
  [...html.matchAll(/<a\b[^>]*\shref="(\/[^"#?]*)/g)]
    .map((m) => m[1])
    .filter((h) => !h.startsWith("/media/") && !h.startsWith("/_next/") && !/\.\w+$/.test(h));

const sitemap = (await lire("/sitemap.xml")).html;
const pages = [...new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1] || "/"))];
check(pages.length > 5, `le plan du site liste les pages publiques (${pages.length})`);

const verifies = new Map();
for (const page of pages) {
  const { status, html } = await lire(page);
  check(status === 200 && !pageVide(html), `${page} : page du plan du site (${status})`);
  for (const lien of new Set(liens(html))) {
    if (!verifies.has(lien)) {
      const r = await lire(lien);
      verifies.set(lien, r.status === 200 && !pageVide(r.html) ? "ok" : `${r.status}${pageVide(r.html) ? ", page d'erreur ou en cours de validation" : ""}`);
    }
    const etat = verifies.get(lien);
    check(etat === "ok", `${page} → ${lien} (${etat})`);
  }
}
console.log(`${pages.length} pages parcourues, ${verifies.size} liens internes distincts vérifiés.`);
if (failures) {
  console.log(`${failures} échec(s).`);
  process.exit(1);
}
console.log("Tous les liens internes mènent à une page publique.");
