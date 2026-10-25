"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity";

export interface FormationInput {
  id: number | null;
  intitule: string;
  url: string;
  annees: string;
  diplome: string;
  niveauComplet: string;
  mode: string;
  statut: string;
  projets: string;
  competencesAcquises: string[];
  mentionComplementaire: string;
}

export type FormationResult = { ok: true; id: number } | { ok: false; error: string; session?: boolean };

const refresh = () => revalidatePath("/", "layout");

export async function saveFormation(input: FormationInput): Promise<FormationResult> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  const prisma = db();
  const intitule = input.intitule.trim();
  if (!intitule) return { ok: false, error: "L’intitulé est obligatoire." };
  if (!input.annees.trim()) return { ok: false, error: "Les années sont obligatoires." };
  if (!input.statut) return { ok: false, error: "Le statut est obligatoire." };
  const data = {
    intitule,
    url: input.url.trim() || null,
    annees: input.annees.trim(),
    diplome: input.diplome.trim(),
    niveauComplet: input.niveauComplet.trim(),
    mode: input.mode,
    statut: input.statut,
    projets: input.projets.trim(),
    competencesAcquises: input.competencesAcquises,
    mentionComplementaire: input.mentionComplementaire.trim() || null,
  };
  let id = input.id;
  if (id) {
    const before = await prisma.formation.findUniqueOrThrow({ where: { id } });
    await prisma.formation.update({ where: { id }, data });
    // La formation sert aussi de cadre aux projets : un changement d'intitulé suit partout.
    if (before.intitule !== intitule) {
      await prisma.category.updateMany({ where: { kind: "cadre", name: before.intitule }, data: { name: intitule } });
      await prisma.project.updateMany({ where: { parcours: before.intitule }, data: { parcours: intitule } });
    }
  } else {
    // Nouvelle formation : en tête de liste (la plus récente).
    await prisma.formation.updateMany({ data: { position: { increment: 1 } } });
    id = (await prisma.formation.create({ data: { ...data, position: 0 } })).id;
    const cadres = await prisma.category.count({ where: { kind: "cadre" } });
    await prisma.category.upsert({ where: { kind_name: { kind: "cadre", name: intitule } }, create: { kind: "cadre", name: intitule, position: cadres, nature: "Formation" }, update: {} });
  }
  await logActivity("formation", String(id), `Formation « ${intitule} » ${input.id ? "modifiée" : "ajoutée"}`, input.id ? "updated" : "created");
  refresh();
  return { ok: true, id };
}

export async function deleteFormation(id: number): Promise<FormationInput & { position: number }> {
  await requireAdmin();
  const prisma = db();
  const f = await prisma.formation.delete({ where: { id } });
  await logActivity("formation", String(id), `Formation « ${f.intitule} » supprimée`, "deleted");
  refresh();
  return {
    id: null,
    position: f.position,
    intitule: f.intitule,
    url: f.url ?? "",
    annees: f.annees,
    diplome: f.diplome,
    niveauComplet: f.niveauComplet,
    mode: f.mode,
    statut: f.statut,
    projets: f.projets,
    competencesAcquises: (f.competencesAcquises as string[] | null) ?? [],
    mentionComplementaire: f.mentionComplementaire ?? "",
  };
}

// Annulation pendant 10 secondes : la formation est recréée à sa place.
export async function restoreFormation(snapshot: FormationInput & { position: number }) {
  await requireAdmin();
  const { id: _id, position, ...rest } = snapshot;
  await db().formation.create({ data: { ...rest, url: rest.url || null, mentionComplementaire: rest.mentionComplementaire || null, position } });
  await logActivity("formation", "", `Suppression de la formation « ${rest.intitule} » annulée`, "restored");
  refresh();
}

export async function moveFormation(id: number, direction: -1 | 1) {
  await requireAdmin();
  const prisma = db();
  const all = await prisma.formation.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  const i = all.findIndex((f) => f.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await prisma.$transaction(all.map((f, k) => prisma.formation.update({ where: { id: f.id }, data: { position: k } })));
  refresh();
}

// Préremplissage depuis la page OpenClassrooms de la formation (titre de la page).
export async function readOpenClassrooms(url: string): Promise<{ ok: true; intitule: string } | { ok: false; error: string }> {
  await requireAdmin();
  if (!/^https:\/\/openclassrooms\.com\/[a-z]{2}\/paths\//.test(url)) return { ok: false, error: "Colle l’adresse d’un parcours OpenClassrooms (https://openclassrooms.com/fr/paths/…)." };
  try {
    const r = await fetch(url, { headers: { "Accept-Language": "fr-FR" }, cache: "no-store" });
    if (!r.ok) return { ok: false, error: `OpenClassrooms a répondu ${r.status}.` };
    const html = await r.text();
    const m = html.match(/<meta property="og:title" content="([^"]+)"/) ?? html.match(/<title>([^<]+)<\/title>/);
    if (!m) return { ok: false, error: "Intitulé introuvable sur la page." };
    const intitule = m[1].replace(/\s*[-|–]\s*OpenClassrooms.*$/i, "").replace(/^Formation\s+/i, "").trim();
    return { ok: true, intitule };
  } catch {
    return { ok: false, error: "OpenClassrooms n’a pas répondu. Remplis l’intitulé à la main." };
  }
}
