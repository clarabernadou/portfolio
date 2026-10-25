"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity";
import { PROFIL_MAX } from "@/lib/admin/orientations";
import type { OrientationState } from "@/lib/pdf/cv-data";

type Result = { ok: true; pages?: number; name?: string } | { ok: false; error: string; manque?: string[]; session?: boolean };

function check(o: OrientationState): string | null {
  if (!o.title.trim()) return "L’intitulé affiché est obligatoire.";
  if (o.profile.length > PROFIL_MAX) return `Le texte de profil dépasse ${PROFIL_MAX} caractères.`;
  if (o.featuredProjects.length > 3) return "Trois projets phares au maximum.";
  if (!/^[\w.-]+\.pdf$/i.test(o.fileName)) return "Le nom du fichier doit finir par .pdf, sans espace ni accent.";
  return null;
}

export async function saveOrientation(o: OrientationState): Promise<Result> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  const err = check(o);
  if (err) return { ok: false, error: err };
  const data = JSON.parse(JSON.stringify(o));
  await db().cvOrientation.upsert({ where: { id: o.id }, create: { id: o.id, data }, update: { data } });
  await logActivity("cv", o.id, `CV orienté « ${o.name} » enregistré`);
  revalidatePath("/admin/profil", "layout");
  return { ok: true };
}

// Génère le PDF d'une page (§5 bis) : refusé si le contenu dépasse une page.
// Jamais de réduction automatique du texte.
export async function generateOriente(o: OrientationState): Promise<Result> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  const saved = await saveOrientation(o);
  if (!saved.ok) return saved;
  const { cvHtml } = await import("@/lib/pdf/cv-html");
  const { nomFichier, oriente } = await import("@/lib/pdf/cv-data");
  const { loadAssets, loadSources, renderPdf, storeFile } = await import("@/lib/pdf/server");
  const [sources, assets] = await Promise.all([loadSources(), loadAssets()]);
  const doc = oriente(sources, o);
  try {
    const { pdf, pages } = await renderPdf(cvHtml(doc, assets, "une-page"));
    if (pages > 1) return { ok: false, error: `Dépasse d’une page (${pages} pages) : raccourcis le contenu avant de générer.` };
    const name = nomFichier(o);
    await storeFile(name, o.id, "fr", pdf);
    await logActivity("cv", name, `CV orienté ${name} généré`);
    revalidatePath("/admin/profil", "layout");
    return { ok: true, pages, name };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "La génération a échoué : réessaie dans un instant." };
  }
}
