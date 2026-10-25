"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity";

export interface Groupe {
  name: string;
  items: string[];
}

// Remplace d'un bloc les catégories de compétences d'une version du CV.
export async function saveSkills(version: "essentiel" | "complet", groupes: Groupe[]): Promise<{ ok: true } | { ok: false; error: string; session?: boolean }> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  const clean = groupes.map((g) => ({ name: g.name.trim(), items: g.items.map((i) => i.trim()).filter(Boolean) }));
  if (clean.some((g) => !g.name)) return { ok: false, error: "Chaque catégorie doit avoir un nom." };
  if (new Set(clean.map((g) => g.name)).size !== clean.length) return { ok: false, error: "Deux catégories portent le même nom." };
  const prisma = db();
  await prisma.$transaction([
    prisma.skillGroup.deleteMany({ where: { version } }),
    prisma.skillGroup.createMany({ data: clean.map((g, position) => ({ version, name: g.name, items: g.items, position })) }),
  ]);
  await logActivity("skills", version, `Compétences du CV ${version === "essentiel" ? "essentiel" : "complet"} modifiées`);
  revalidatePath("/", "layout");
  return { ok: true };
}
