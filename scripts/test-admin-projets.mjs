// Test de bout en bout de l'écran Projets, sur une copie jetable (effacée à la fin).
// Usage (site lancé avec npm run start, base configurée) : node scripts/test-admin-projets.mjs
import { chromium } from "playwright";
import { encode } from "next-auth/jwt";
import { execFileSync } from "node:child_process";

process.loadEnvFile(".env.local");
const base = "http://localhost:3000";
const ID = "watchedthis-copie";
const NOM = "Copie de test (à supprimer)";
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${label}`);
  if (!ok) failures++;
};

const token = await encode({ token: { githubId: process.env.ADMIN_GITHUB_ID, name: "Clara" }, secret: process.env.NEXTAUTH_SECRET, maxAge: 3600 });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: "next-auth.session-token", value: token, url: base, httpOnly: true }]);
const page = await ctx.newPage();
page.on("dialog", (d) => d.accept());

try {
  // 1. Dupliquer depuis l'écran Nouveau projet
  await page.goto(`${base}/admin/projets/nouveau`);
  await page.getByLabel("Projet à copier").selectOption("watchedthis");
  await page.getByRole("button", { name: "Dupliquer" }).click();
  await page.waitForURL(`**/admin/projets/${ID}`);
  check(true, "Dupliquer ouvre la copie en modification");

  // 2. Modifier le nom et publier
  await page.getByLabel("Nom du projet").fill(NOM);
  check(await page.getByText("Modifications non enregistrées").isVisible(), "« Modifications non enregistrées » apparaît");
  await page.getByRole("button", { name: "Publier" }).click();
  await page.getByText("Projet publié.").waitFor();
  check(true, "Publier enregistre le projet");

  // 3. La modification se répercute sur le site public
  const pub = await fetch(`${base}/projets/${ID}`);
  check(pub.status === 200 && (await pub.text()).includes(NOM), `Le site public affiche la copie publiée (${pub.status})`);
  const liste = await (await fetch(`${base}/projets`)).text();
  check(liste.includes(NOM), "La page Projets du site liste la copie");

  // 4. Supprimer, annuler, puis supprimer pour de bon
  await page.getByRole("button", { name: "Supprimer le projet" }).click();
  await page.waitForURL("**/admin/projets");
  await page.getByRole("button", { name: "Annuler" }).click();
  await page.waitForTimeout(1500);
  await page.reload();
  check(await page.getByRole("link", { name: NOM }).first().isVisible(), "« Annuler » restaure le projet supprimé");
  const ligne = page.getByRole("button", { name: `Supprimer « ${NOM} »` });
  await ligne.click();
  await page.getByText(`« ${NOM} » supprimé.`).waitFor();
  await page.waitForTimeout(1500);
  const apres = await fetch(`${base}/projets/${ID}`);
  check(apres.status === 404, `Supprimé : la fiche publique renvoie 404 (${apres.status})`);
} catch (e) {
  check(false, `Erreur : ${e.message.split("\n")[0]}`);
  await page.screenshot({ path: "audit/test-admin-projets-erreur.png", fullPage: true }).catch(() => {});
} finally {
  await browser.close();
  // Nettoyage : effacement définitif de la copie de test (et d'elle seule).
  execFileSync("npx", ["tsx", "scripts/purge-test-project.ts", ID], { stdio: "inherit" });
}

console.log(failures ? `\n${failures} échec(s)` : "\nTous les contrôles passent.");
process.exit(failures ? 1 : 0);
