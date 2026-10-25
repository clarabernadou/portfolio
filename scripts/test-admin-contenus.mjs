// Réenregistrer chaque formation et chaque expérience sans rien changer ne doit
// modifier ni le CV ni l'accueil du site public (aller-retour sans perte).
// Usage (site lancé avec npm run start, base configurée) : node scripts/test-admin-contenus.mjs
import { chromium } from "playwright";
import { encode } from "next-auth/jwt";

process.loadEnvFile(".env.local");
const base = "http://localhost:3000";
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${label}`);
  if (!ok) failures++;
};
// Contenu visible seulement (sans les identifiants de build ni les scripts).
const visible = async (path) => {
  const html = await (await fetch(base + path, { cache: "no-store" })).text();
  return html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
};

const token = await encode({ token: { githubId: process.env.ADMIN_GITHUB_ID, name: "Clara" }, secret: process.env.NEXTAUTH_SECRET, maxAge: 3600 });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: "next-auth.session-token", value: token, url: base, httpOnly: true }]);
const page = await ctx.newPage();

const avant = { cv: await visible("/cv"), accueil: await visible("/") };
for (const ecran of ["formations", "experiences"]) {
  await page.goto(`${base}/admin/${ecran}`);
  const liens = await page.locator(".adm-item a.adm-icon-btn").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  for (const href of liens) {
    await page.goto(base + href);
    await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
    await page.getByText(/enregistrée\./).waitFor();
    check(true, `${href} réenregistré`);
  }
}
// Profil : une modification se voit sur le CV public, puis on remet la valeur d'origine.
await page.goto(`${base}/admin/profil`);
const mobilite = page.getByLabel("Mobilité");
const origine = await mobilite.inputValue();
await mobilite.fill("Mobilité de test (à supprimer)");
await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
await page.getByText("Profil enregistré.").waitFor();
await page.waitForTimeout(1000);
check((await visible("/cv")).includes("Mobilité de test (à supprimer)"), "Une modification du profil apparaît sur le CV du site");
await page.reload();
await page.getByLabel("Mobilité").fill(origine);
await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
await page.getByText("Profil enregistré.").waitFor();

await page.waitForTimeout(1500);
const apres = { cv: await visible("/cv"), accueil: await visible("/") };
check(avant.cv === apres.cv, "Le CV du site est identique après réenregistrement");
check(avant.accueil === apres.accueil, "L’accueil du site est identique après réenregistrement");
await browser.close();

console.log(failures ? `\n${failures} échec(s)` : "\nTous les contrôles passent.");
process.exit(failures ? 1 : 0);
