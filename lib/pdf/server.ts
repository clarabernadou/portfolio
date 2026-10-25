import { readFile } from "node:fs/promises";
import path from "node:path";
import { getExperiences, getFormations, getProfile, getSiteProjects, getSkills } from "@/lib/data";
import type { CvAssets } from "./cv-html";
import type { CvSources } from "./cv-data";

// Génération des PDF côté serveur (étape 10) : en local, Playwright ; sur Vercel,
// Chromium « serverless » (@sparticuz/chromium) piloté par playwright-core.

async function prisma() {
  const { db } = await import("@/lib/db");
  return db();
}

export async function loadSources(): Promise<CvSources> {
  const [profil, skills, experiences, formations, projets] = await Promise.all([getProfile(), getSkills(), getExperiences(), getFormations(), getSiteProjects()]);
  return {
    profil,
    skills: skills.essentiel,
    experiences,
    formations,
    projets: projets.map((p) => ({ id: p.id, name: p.name, parcours: p.parcours, line: p.line, homeCard: p.homeCard })),
  };
}


// Polices et photo intégrées au document (data URI) : le PDF ne dépend d'aucun réseau.
export async function loadAssets(): Promise<CvAssets> {
  const [manrope, bricolage] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/Manrope.ttf")),
    readFile(path.join(process.cwd(), "public/fonts/BricolageGrotesque.ttf")),
  ]);
  let photo = `data:image/jpeg;base64,${(await readFile(path.join(process.cwd(), "public/photo-clara.jpg"))).toString("base64")}`;
  if (process.env.DATABASE_URL) {
    const a = await (await prisma()).asset.findUnique({ where: { key: "photo" } });
    if (a) photo = `data:${a.mime};base64,${Buffer.from(a.data).toString("base64")}`;
  }
  return { manrope: `data:font/ttf;base64,${manrope.toString("base64")}`, bricolage: `data:font/ttf;base64,${bricolage.toString("base64")}`, photo };
}

async function launch() {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const { chromium: pw } = await import("playwright-core");
    return pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true });
  }
  const { chromium } = await import("playwright");
  return chromium.launch();
}

export async function renderPdf(html: string): Promise<{ pdf: Buffer; pages: number }> {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    // PDF balisé (structure, langue) pour les lecteurs d’écran (RGAA 13.3).
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true });
    const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    return { pdf, pages };
  } finally {
    await browser.close();
  }
}

export async function storeFile(name: string, kind: string, lang: string, pdf: Buffer) {
  const data = new Uint8Array(pdf);
  await (await prisma()).generatedFile.upsert({
    where: { name },
    create: { name, kind, lang, data },
    update: { kind, lang, data, generatedAt: new Date() },
  });
}

export { FICHIERS_PUBLICS } from "./fichiers";
