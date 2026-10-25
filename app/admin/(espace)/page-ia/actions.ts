"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity";
import type { IaContent } from "@/lib/types";

type Lists = Pick<IaContent, "tools" | "skills" | "routines">;

// Enregistre les listes de la page IA (outils, skills, routines) ; le reste du
// contenu (introduction, méthode, règles) est conservé tel quel.
export async function saveIa(lists: Lists): Promise<{ ok: true } | { ok: false; error: string; session?: boolean }> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  if (lists.tools.some((t) => !t.name.trim()) || lists.skills.some((t) => !t.name.trim()) || lists.routines.some((t) => !t.title.trim()))
    return { ok: false, error: "Chaque élément doit avoir un nom." };
  if (lists.tools.filter((t) => t.favorite).length > 1) return { ok: false, error: "Une seule carte peut porter le badge « Prédilection »." };
  const prisma = db();
  const row = await prisma.singleton.findUnique({ where: { key: "ia" } });
  const data = JSON.parse(JSON.stringify({ ...((row?.data as object) ?? {}), ...lists }));
  await prisma.singleton.upsert({ where: { key: "ia" }, create: { key: "ia", data }, update: { data } });
  await logActivity("ia", "ia", "Page IA modifiée");
  revalidatePath("/", "layout");
  return { ok: true };
}
