"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity";
import { fromBloc, type BlocInput } from "@/lib/admin/experiences";
import { Prisma } from "@/lib/generated/prisma/client";

// Écran Expériences : une seule version du CV (décision de Clara, 28 oct. 2026).

export type { BlocInput } from "@/lib/admin/experiences";

export interface ExperienceInput {
  id: number | null;
  poste: string;
  entreprise: string;
  entrepriseHref: string;
  entrepriseParent: string;
  entrepriseParentHref: string;
  periode: string;
  lieuMode: string;
  contexteEssentiel: string;
  blocs: BlocInput[];
  note: string;
  accueil: { visible: boolean; lieuMode: string; technologies: string[] };
}

export type ExperienceResult = { ok: true; id: number } | { ok: false; error: string; session?: boolean };

const refresh = () => revalidatePath("/", "layout");

function toDb(input: ExperienceInput, homeOrder: number) {
  return {
    poste: input.poste.trim(),
    entreprise: input.entreprise.trim(),
    entrepriseHref: input.entrepriseHref.trim() || null,
    entrepriseParent: input.entrepriseParent.trim() || null,
    entrepriseParentHref: input.entrepriseParentHref.trim() || null,
    periode: input.periode.trim(),
    lieuMode: input.lieuMode.trim(),
    contexteEssentiel: input.contexteEssentiel.trim(),
    blocs: input.blocs.map(fromBloc) as unknown as Prisma.InputJsonArray,
    note: input.note.trim() || null,
    homeCard: input.accueil.visible ? { lieuMode: input.accueil.lieuMode.trim(), technologies: input.accueil.technologies, order: homeOrder } : undefined,
  };
}

export async function saveExperience(input: ExperienceInput): Promise<ExperienceResult> {
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  if (!input.poste.trim()) return { ok: false, error: "Le poste est obligatoire." };
  if (!input.entreprise.trim()) return { ok: false, error: "L’entreprise est obligatoire." };
  if (!input.periode.trim()) return { ok: false, error: "La période est obligatoire." };
  const prisma = db();
  const all = await prisma.experience.findMany({ select: { id: true, homeCard: true } });
  const current = all.find((e) => e.id === input.id);
  // Cartes d'alternance de l'accueil, de la plus ancienne à la plus récente : une
  // nouvelle carte se place en dernier.
  const orders = all.map((e) => (e.homeCard as { order?: number } | null)?.order ?? -1);
  const order = (current?.homeCard as { order?: number } | null)?.order ?? Math.max(-1, ...orders) + 1;
  const data = toDb(input, order);
  let id = input.id;
  if (id) {
    await prisma.experience.update({ where: { id }, data: { ...data, homeCard: data.homeCard ?? Prisma.DbNull } });
  } else {
    await prisma.experience.updateMany({ data: { position: { increment: 1 } } });
    id = (await prisma.experience.create({ data: { ...data, position: 0 } })).id;
  }
  const label = input.entrepriseParent ? `${input.entreprise} by ${input.entrepriseParent}` : input.entreprise;
  await logActivity("experience", String(id), `Expérience « ${label} » ${input.id ? "modifiée" : "ajoutée"}`, input.id ? "updated" : "created");
  refresh();
  return { ok: true, id };
}

export async function deleteExperience(id: number) {
  await requireAdmin();
  const e = await db().experience.delete({ where: { id } });
  await logActivity("experience", String(id), `Expérience « ${e.entreprise} » supprimée`, "deleted");
  refresh();
  const { id: _id, createdAt: _c, updatedAt: _u, ...snapshot } = e;
  return JSON.parse(JSON.stringify(snapshot)) as Record<string, unknown>;
}

export async function restoreExperience(snapshot: Record<string, unknown>) {
  await requireAdmin();
  // Les champs JSON vides doivent être recréés comme « nul en base » (Prisma.DbNull).
  const data = Object.fromEntries(
    Object.entries(snapshot).map(([k, v]) => [k, v === null && ["fieldMeta", "i18n", "homeCard"].includes(k) ? Prisma.DbNull : v]),
  );
  await db().experience.create({ data: data as never });
  await logActivity("experience", "", `Suppression de l’expérience « ${String(snapshot.entreprise)} » annulée`, "restored");
  refresh();
}

export async function moveExperience(id: number, direction: -1 | 1) {
  await requireAdmin();
  const prisma = db();
  const all = await prisma.experience.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  const i = all.findIndex((e) => e.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await prisma.$transaction(all.map((e, k) => prisma.experience.update({ where: { id: e.id }, data: { position: k } })));
  refresh();
}
