// Captures des écrans de l'administration, en local, avec une session de test.
// La session est signée avec NEXTAUTH_SECRET (lu dans .env.local, jamais affiché).
// Usage : node scripts/admin-capture.mjs <dossier> /admin /admin/projets ... [--widths 1440,390] [--axe]
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { encode } from "next-auth/jwt";

process.loadEnvFile(".env.local");
const args = process.argv.slice(2);
const out = args.shift();
const flag = (n) => args.includes(n);
const widthsArg = args.indexOf("--widths");
const widths = widthsArg >= 0 ? args[widthsArg + 1].split(",").map(Number) : [1440, 390];
const paths = args.filter((a, i) => a.startsWith("/") && args[i - 1] !== "--widths");
const base = "http://localhost:3000";

const token = await encode({
  token: { name: "Clara Bernadou", githubId: process.env.ADMIN_GITHUB_ID, sub: process.env.ADMIN_GITHUB_ID },
  secret: process.env.NEXTAUTH_SECRET,
  maxAge: 3600,
});
const browser = await chromium.launch();
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addCookies([{ name: "next-auth.session-token", value: token, url: base, httpOnly: true }]);
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: "load", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const file = `${out}/admin${p.replace(/[/?=&]/g, "_")}.${w}.png`;
    await page.screenshot({ path: file, fullPage: true });
    let axe = "";
    if (flag("--axe")) {
      const r = await new AxeBuilder({ page }).analyze();
      axe = " axe: " + (r.violations.map((v) => `${v.id}(${v.nodes.length}) ${v.nodes[0]?.target}`).join(" ") || "0");
    }
    console.log(`${p}@${w} → ${page.url().replace(base, "")}${axe}`);
  }
  await ctx.close();
}
await browser.close();
