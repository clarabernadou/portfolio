"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity";
import type { SiteProfile } from "@/lib/data-shared";

type Result = { ok: true } | { ok: false; error: string; session?: boolean };
const refresh = () => revalidatePath("/", "layout");

export async function saveProfile(p: SiteProfile): Promise<Result> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  if (!p.nom.trim()) return { ok: false, error: "Le nom est obligatoire." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) return { ok: false, error: "L’e-mail de contact n’est pas valide." };
  for (const [k, v] of [["LinkedIn", p.linkedin], ["GitHub", p.github]] as const) if (v && !/^https:\/\//.test(v)) return { ok: false, error: `Le lien ${k} doit commencer par https://.` };
  const data = {
    ...p,
    langues: p.langues.filter((l) => l.nom.trim()).map((l) => ({ nom: l.nom.trim(), niveau: l.niveau.map((n) => n.trim()).filter(Boolean) })),
  };
  await db().singleton.upsert({ where: { key: "profil" }, create: { key: "profil", data }, update: { data } });
  await logActivity("profil", "profil", "Profil et CV modifiés");
  refresh();
  return { ok: true };
}

// Photo : carrée, 800 px minimum (vérifié dans le navigateur), 2 Mo au plus.
export async function uploadPhoto(form: FormData): Promise<Result> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  const f = form.get("photo");
  if (!(f instanceof File) || !f.size) return { ok: false, error: "Choisis une image." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return { ok: false, error: "Format accepté : JPEG, PNG ou WebP." };
  if (f.size > 2 * 1024 * 1024) return { ok: false, error: "L’image dépasse 2 Mo : réduis-la avant de l’envoyer." };
  const data = Buffer.from(await f.arrayBuffer());
  await db().asset.upsert({ where: { key: "photo" }, create: { key: "photo", mime: f.type, data }, update: { mime: f.type, data } });
  await logActivity("profil", "photo", "Photo du profil remplacée");
  refresh();
  return { ok: true };
}

export async function removePhoto(): Promise<Result> {
  await requireAdmin();
  await db().asset.deleteMany({ where: { key: "photo" } });
  await logActivity("profil", "photo", "Photo du profil retirée (photo d’origine rétablie)");
  refresh();
  return { ok: true };
}

export interface RecoInput {
  id: number | null;
  auteur: string;
  initiales: string;
  linkedin: string;
  poste: string;
  relation: string;
  citationCourte: string;
  texteIntegral: string;
  lettrePdf: string;
  entrepriseHref: string;
  lienTexte: string;
  voirLinkedin: boolean;
  status: "published" | "draft";
}

export async function saveReco(r: RecoInput): Promise<Result> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  if (!r.auteur.trim()) return { ok: false, error: "Le nom de la personne est obligatoire." };
  if (!r.citationCourte.trim()) return { ok: false, error: "La citation courte est obligatoire." };
  const data = {
    auteur: r.auteur.trim(),
    initiales: (r.initiales.trim() || r.auteur.split(/\s+/).map((m) => m[0]).join("")).toUpperCase().slice(0, 4),
    linkedin: r.linkedin.trim() || null,
    poste: r.poste.trim(),
    relation: r.relation.trim(),
    citationCourte: r.citationCourte.trim(),
    texteIntegral: r.texteIntegral.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    lettrePdf: r.lettrePdf.trim() || null,
    entrepriseHref: r.entrepriseHref.trim() || null,
    lienTexte: r.lienTexte.trim() || null,
    voirLinkedin: r.voirLinkedin,
    status: r.status,
  };
  const prisma = db();
  if (r.id) await prisma.recommendation.update({ where: { id: r.id }, data });
  else await prisma.recommendation.create({ data: { ...data, position: await prisma.recommendation.count() } });
  await logActivity("recommendation", data.auteur, `Recommandation de ${data.auteur} ${r.id ? "modifiée" : "ajoutée"}`, r.id ? "updated" : "created");
  refresh();
  return { ok: true };
}

export async function deleteReco(id: number) {
  await requireAdmin();
  const r = await db().recommendation.delete({ where: { id } });
  await logActivity("recommendation", r.auteur, `Recommandation de ${r.auteur} supprimée`, "deleted");
  refresh();
  const { id: _id, createdAt: _c, updatedAt: _u, ...snapshot } = r;
  return JSON.parse(JSON.stringify(snapshot)) as Record<string, unknown>;
}

export async function restoreReco(snapshot: Record<string, unknown>) {
  await requireAdmin();
  await db().recommendation.create({ data: snapshot as never });
  await logActivity("recommendation", String(snapshot.auteur), `Suppression de la recommandation de ${String(snapshot.auteur)} annulée`, "restored");
  refresh();
}

export async function moveReco(id: number, direction: -1 | 1) {
  await requireAdmin();
  const prisma = db();
  const all = await prisma.recommendation.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  const i = all.findIndex((x) => x.id === id);
  const j = i + direction;
  if (j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await prisma.$transaction(all.map((x, k) => prisma.recommendation.update({ where: { id: x.id }, data: { position: k } })));
  refresh();
}

// Génération du CV essentiel en PDF (ADMIN-et-SYNCHRONISATION.md §5 et critère 7 ter).
export async function generateEssentiel(): Promise<{ ok: true; pages: number } | { ok: false; error: string; session?: boolean }> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  const { cvHtml } = await import("@/lib/pdf/cv-html");
  const { essentielFr } = await import("@/lib/pdf/cv-data");
  const { loadAssets, loadSources, renderPdf, storeFile } = await import("@/lib/pdf/server");
  const [sources, assets] = await Promise.all([loadSources(), loadAssets()]);
  try {
    const { pdf, pages } = await renderPdf(cvHtml(essentielFr(sources), assets, "complete"));
    const name = "CV_Clara_Bernadou_FR.pdf";
    await storeFile(name, "essentiel", "fr", pdf);
    await logActivity("cv", name, "CV essentiel généré");
    return { ok: true, pages };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "La génération a échoué : réessaie dans un instant." };
  }
}
