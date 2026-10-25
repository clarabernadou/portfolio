// Étape 10, critères de réception 7, 7 bis et 7 ter (ADMIN-et-SYNCHRONISATION.md §7).
// Usage (site lancé avec npm run start, base configurée) : node scripts/test-admin-cv.mjs
import { chromium } from "playwright";
import { encode } from "next-auth/jwt";

process.loadEnvFile(".env.local");
const base = "http://localhost:3000";
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${label}`);
  if (!ok) failures++;
};
const pages = (buf) => (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;

const token = await encode({ token: { githubId: process.env.ADMIN_GITHUB_ID, name: "Clara" }, secret: process.env.NEXTAUTH_SECRET, maxAge: 3600 });
const cookie = `next-auth.session-token=${token}`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: "next-auth.session-token", value: token, url: base, httpOnly: true }]);
const page = await ctx.newPage();
page.setDefaultTimeout(60000);

try {
  // 7 et 7 ter : CV essentiel depuis Profil et CV (français seulement depuis le 24 oct. 2026).
  await page.goto(`${base}/admin/profil`);
  await page.getByRole("button", { name: "Générer", exact: true }).click();
  await page.getByText(/CV généré/).waitFor();
  const essentiel = await fetch(`${base}/media/cv/CV_Clara_Bernadou_FR.pdf`);
  const buf0 = Buffer.from(await essentiel.arrayBuffer());
  check(essentiel.status === 200 && buf0.subarray(0, 4).toString() === "%PDF", `CV_Clara_Bernadou_FR.pdf généré et téléchargeable (${essentiel.status}, ${pages(buf0)} pages)`);
  await page.reload();
  check(await page.getByText(/généré le /).first().isVisible(), "La date de dernière génération est indiquée");
  const en = await fetch(`${base}/media/cv/CV_Clara_Bernadou_EN.pdf`);
  check(en.status === 404, `La version anglaise n’est plus publique (${en.status})`);

  // 7 bis : CV orienté d'une page.
  await page.goto(`${base}/admin/profil/cv-oriente/ux`);
  await page.getByText("Tient sur 1 page").waitFor();
  check(true, "L’aperçu A4 indique « Tient sur 1 page »");
  const quatrieme = page.getByRole("checkbox", { name: /WatchedThis/ });
  check(await quatrieme.isDisabled(), "Un 4e projet phare est refusé (case désactivée à 3 sur 3)");
  await page.getByRole("button", { name: "Générer le PDF" }).first().click();
  await page.getByText("PDF généré.").waitFor();
  const r = await fetch(`${base}/media/cv/CV_Clara_Bernadou_UX.pdf`, { headers: { cookie } });
  const buf = Buffer.from(await r.arrayBuffer());
  check(r.status === 200 && pages(buf) === 1, `CV_Clara_Bernadou_UX.pdf tient sur une page (${pages(buf)} page)`);
  const anonyme = await fetch(`${base}/media/cv/CV_Clara_Bernadou_UX.pdf`);
  check(anonyme.status === 404, `Un CV orienté n’est pas public (${anonyme.status} sans session)`);

  // Contenu trop long : la génération est désactivée et expliquée, sans réduire le texte.
  const profil = page.getByLabel("Texte de profil");
  const avant = await profil.inputValue();
  await profil.fill(Array(14).fill(avant).join(" "));
  await page.getByText("Dépasse d’une page").waitFor();
  check(await page.getByRole("button", { name: "Générer le PDF" }).first().isDisabled(), "Contenu trop long : « Dépasse d’une page » et génération désactivée");
  await page.getByRole("button", { name: "Annuler" }).first().click();
  await page.getByText("Tient sur 1 page").waitFor();

} catch (e) {
  check(false, `Erreur : ${e.message.split("\n")[0]}`);
  await page.screenshot({ path: "audit/test-admin-cv-erreur.png", fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

console.log(failures ? `\n${failures} échec(s)` : "\nTous les contrôles passent.");
process.exit(failures ? 1 : 0);
