"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity";
import type { FormationCourte } from "@/lib/types";

// Enregistre la liste des formations courtes et certifications (accueil, rubrique « Parcours »).
export async function saveFormationsCourtes(items: FormationCourte[]): Promise<{ ok: true } | { ok: false; error: string; session?: boolean }> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  const propres = items.map((f) => ({
    name: f.name.trim(),
    organisme: f.organisme.trim(),
    date: f.date.trim(),
    type: f.type === "certification" ? ("certification" as const) : ("attestation" as const),
    ...(f.url?.trim() ? { url: f.url.trim() } : {}),
  }));
  if (propres.some((f) => !f.name || !f.organisme || !f.date)) return { ok: false, error: "Chaque formation doit avoir un intitulé, un organisme et une date." };
  if (propres.some((f) => f.url && !/^https:\/\/[^\s]+$/.test(f.url))) return { ok: false, error: "Le lien doit commencer par https://." };
  const data = { items: propres };
  await db().singleton.upsert({ where: { key: "formationsCourtes" }, create: { key: "formationsCourtes", data }, update: { data } });
  await logActivity("formationsCourtes", "formationsCourtes", "Formations courtes modifiées");
  revalidatePath("/", "layout");
  return { ok: true };
}
