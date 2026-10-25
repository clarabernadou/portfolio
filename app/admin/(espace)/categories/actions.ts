"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity";

// Catégories : types de projet et cadres. Elles alimentent les filtres du site et les
// formulaires (ADMIN-et-SYNCHRONISATION.md §1, critère de réception n° 6).

type Result = { ok: true } | { ok: false; error: string };
const refresh = () => revalidatePath("/", "layout");
const NATURES = ["Formation", "Entreprise", "Projet perso", "Audit"];

export async function addCategory(kind: "type" | "cadre", name: string, nature?: string): Promise<Result> {
  await requireAdmin();
  const n = name.trim();
  if (!n) return { ok: false, error: "Le nom est obligatoire." };
  const prisma = db();
  if (await prisma.category.findUnique({ where: { kind_name: { kind, name: n } } })) return { ok: false, error: `« ${n} » existe déjà.` };
  const position = await prisma.category.count({ where: { kind } });
  await prisma.category.create({ data: { kind, name: n, position, nature: kind === "cadre" ? (NATURES.includes(nature ?? "") ? nature : "Formation") : null } });
  await logActivity("category", n, `${kind === "type" ? "Type" : "Cadre"} « ${n} » ajouté`, "created");
  refresh();
  return { ok: true };
}

// Renommer : les projets qui l'utilisent suivent.
export async function renameCategory(id: number, name: string, nature?: string): Promise<Result> {
  await requireAdmin();
  const n = name.trim();
  if (!n) return { ok: false, error: "Le nom est obligatoire." };
  const prisma = db();
  const c = await prisma.category.findUniqueOrThrow({ where: { id } });
  if (n !== c.name && (await prisma.category.findUnique({ where: { kind_name: { kind: c.kind, name: n } } }))) return { ok: false, error: `« ${n} » existe déjà.` };
  await prisma.category.update({ where: { id }, data: { name: n, ...(c.kind === "cadre" && nature ? { nature } : {}) } });
  if (n !== c.name) {
    if (c.kind === "cadre") {
      await prisma.project.updateMany({ where: { parcours: c.name }, data: { parcours: n } });
      await prisma.formation.updateMany({ where: { intitule: c.name }, data: { intitule: n } });
    } else {
      for (const p of await prisma.project.findMany({ select: { id: true, types: true } })) {
        const types = p.types as string[];
        if (types.includes(c.name)) await prisma.project.update({ where: { id: p.id }, data: { types: types.map((t) => (t === c.name ? n : t)) } });
      }
    }
    await logActivity("category", n, `« ${c.name} » renommé en « ${n} »`);
  }
  refresh();
  return { ok: true };
}

// Supprimer : si des projets l'utilisent, ils sont d'abord réaffectés (§5 « suppression avec réaffectation »).
export async function deleteCategory(id: number, reassignTo: string | null): Promise<Result> {
  await requireAdmin();
  const prisma = db();
  const c = await prisma.category.findUniqueOrThrow({ where: { id } });
  const projets = await prisma.project.findMany({ where: { deletedAt: null }, select: { id: true, types: true, parcours: true } });
  const used = projets.filter((p) => (c.kind === "cadre" ? p.parcours === c.name : (p.types as string[]).includes(c.name)));
  if (used.length) {
    if (!reassignTo || reassignTo === c.name) return { ok: false, error: `${used.length} projets utilisent « ${c.name} » : choisis vers quelle catégorie les réaffecter.` };
    for (const p of used) {
      if (c.kind === "cadre") await prisma.project.update({ where: { id: p.id }, data: { parcours: reassignTo } });
      else {
        const types = (p.types as string[]).map((t) => (t === c.name ? reassignTo : t));
        await prisma.project.update({ where: { id: p.id }, data: { types: [...new Set(types)] } });
      }
    }
  }
  await prisma.category.delete({ where: { id } });
  await logActivity("category", c.name, `${c.kind === "type" ? "Type" : "Cadre"} « ${c.name} » supprimé${used.length ? `, ${used.length} projets réaffectés à « ${reassignTo} »` : ""}`, "deleted");
  refresh();
  return { ok: true };
}

export async function moveCategory(id: number, direction: -1 | 1) {
  await requireAdmin();
  const prisma = db();
  const c = await prisma.category.findUniqueOrThrow({ where: { id } });
  const all = await prisma.category.findMany({ where: { kind: c.kind }, orderBy: [{ position: "asc" }, { id: "asc" }] });
  const i = all.findIndex((x) => x.id === id);
  const j = i + direction;
  if (j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await prisma.$transaction(all.map((x, k) => prisma.category.update({ where: { id: x.id }, data: { position: k } })));
  refresh();
}
