// Étape 10, critères de réception 7, 7 bis et 7 ter (ADMIN-et-SYNCHRONISATION.md §7), revus le 12 nov. 2026 :
// le CV n'est plus généré, il est envoyé depuis l'administration.
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
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: "next-auth.session-token", value: token, url: base, httpOnly: true }]);
const page = await ctx.newPage();
page.setDefaultTimeout(60000);

try {
  // CV en PDF (12 nov. 2026) : un seul CV public, le PDF envoyé depuis Profil et CV.
  // On renvoie le fichier déjà en ligne : le contenu ne change pas, seule la date d'envoi bouge.
  const nom = "CV_Clara_Bernadou_Developpeuse_Full_Stack.pdf";
  const actuel = Buffer.from(await (await fetch(`${base}/media/cv/${nom}`)).arrayBuffer());
  check(actuel.subarray(0, 4).toString() === "%PDF", `${nom} servi (${pages(actuel)} pages)`);
  await page.goto(`${base}/admin/profil`);
  await page.locator('input[type="file"][accept="application/pdf"]').setInputFiles({ name: nom, mimeType: "application/pdf", buffer: actuel });
  await page.getByText(/CV remplacé/).waitFor();
  const apres = Buffer.from(await (await fetch(`${base}/media/cv/${nom}`)).arrayBuffer());
  check(apres.equals(actuel), "Le PDF envoyé est celui servi par le site");
  await page.locator('input[type="file"][accept="application/pdf"]').setInputFiles({ name: "faux.pdf", mimeType: "application/pdf", buffer: Buffer.from("pas un pdf") });
  check(await page.getByText("Ce fichier n’est pas un PDF.").waitFor().then(() => true, () => false), "Un fichier qui n’est pas un PDF est refusé");
  await page.reload();
  check(await page.getByText(/Envoyé le /).first().isVisible(), "La date d’envoi est indiquée");
  for (const ancien of ["CV_Clara_Bernadou_FR.pdf", "CV_Clara_Bernadou_FR_texte.pdf"]) {
    const r = await fetch(`${base}/media/cv/${ancien}`, { redirect: "manual" });
    check(r.status === 308 && r.headers.get("location")?.endsWith(nom), `${ancien} redirige vers le CV actuel (${r.status})`);
  }
  const en = await fetch(`${base}/media/cv/CV_Clara_Bernadou_EN.pdf`);
  check(en.status === 404, `La version anglaise n’est pas publique (${en.status})`);

} catch (e) {
  check(false, `Erreur : ${e.message.split("\n")[0]}`);
  await page.screenshot({ path: "audit/test-admin-cv-erreur.png", fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

console.log(failures ? `\n${failures} échec(s)` : "\nTous les contrôles passent.");
process.exit(failures ? 1 : 0);
