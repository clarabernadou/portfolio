// Critères de réception n° 5 et 6 (ADMIN-et-SYNCHRONISATION.md §7) : les listes se
// répercutent dans les filtres du site et les formulaires ; un type utilisé ne se
// supprime qu'après réaffectation. Travaille sur un type et une copie de projet de test.
// Usage (site lancé, base configurée) : node scripts/test-admin-categories.mjs
import { chromium } from "playwright";
import { encode } from "next-auth/jwt";
import { execFileSync } from "node:child_process";

process.loadEnvFile(".env.local");
const base = "http://localhost:3000";
const TYPE = "Type de test (à supprimer)";
const TYPE2 = "Type renommé (à supprimer)";
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${label}`);
  if (!ok) failures++;
};
const site = async (p) => (await fetch(base + p, { cache: "no-store" })).text();

const token = await encode({ token: { githubId: process.env.ADMIN_GITHUB_ID, name: "Clara" }, secret: process.env.NEXTAUTH_SECRET, maxAge: 3600 });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: "next-auth.session-token", value: token, url: base, httpOnly: true }]);
const page = await ctx.newPage();
page.on("dialog", (d) => d.accept());

try {
  await page.goto(`${base}/admin/categories`);
  await page.getByLabel("Nouveau type de projet").fill(TYPE);
  await page.getByRole("button", { name: "Ajouter" }).first().click();
  await page.getByText(TYPE).waitFor();
  check(true, "Ajouter un type");
  await page.waitForTimeout(1000);
  check((await site("/projets")).includes(TYPE), "Le nouveau type apparaît dans les filtres de la page Projets du site");
  await page.goto(`${base}/admin/projets/nouveau?depart=vide`);
  check(await page.getByLabel(TYPE).isVisible(), "Le nouveau type apparaît dans le formulaire de projet");

  // Un projet de test l'utilise : la suppression doit proposer la réaffectation.
  await page.getByLabel("Nom du projet").fill("Projet de test (à supprimer)");
  await page.getByLabel("Cadre").selectOption("Projet personnel");
  await page.getByLabel(TYPE).check();
  await page.getByRole("button", { name: "Enregistrer le brouillon" }).click();
  await page.waitForURL("**/admin/projets/projet-de-test-a-supprimer");

  await page.goto(`${base}/admin/categories`);
  await page.getByRole("button", { name: `Renommer « ${TYPE} »` }).click();
  await page.getByLabel(`Nouveau nom de « ${TYPE} »`).fill(TYPE2);
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.getByText(TYPE2).waitFor();
  check(true, "Renommer un type");
  await page.goto(`${base}/admin/projets/projet-de-test-a-supprimer`);
  check(await page.getByLabel(TYPE2).isChecked(), "Le projet qui l’utilisait suit le nouveau nom");

  await page.goto(`${base}/admin/categories`);
  await page.getByRole("button", { name: `Supprimer « ${TYPE2} »` }).click();
  check(await page.getByText("1 projet utilise").isVisible(), "Un type utilisé propose la réaffectation au lieu d’être supprimé");
  await page.getByLabel("Réaffecter vers").selectOption("Développement");
  await page.getByRole("button", { name: "Réaffecter et supprimer" }).click();
  await page.getByText(/projets réaffectés/).waitFor();
  await page.goto(`${base}/admin/projets/projet-de-test-a-supprimer`);
  check(await page.getByLabel("Développement").isChecked(), "Le projet est réaffecté à « Développement »");
  await page.waitForTimeout(1000);
  check(!(await site("/projets")).includes(TYPE2), "Le type supprimé disparaît des filtres du site");
} catch (e) {
  check(false, `Erreur : ${e.message.split("\n")[0]}`);
  await page.screenshot({ path: "audit/test-admin-categories-erreur.png", fullPage: true }).catch(() => {});
} finally {
  await browser.close();
  execFileSync("npx", ["tsx", "scripts/purge-test-project.ts", "projet-de-test-a-supprimer"], { stdio: "inherit" });
}

console.log(failures ? `\n${failures} échec(s)` : "\nTous les contrôles passent.");
process.exit(failures ? 1 : 0);
