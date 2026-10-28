"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity";
import { slugify } from "@/lib/admin/projects";

// Actions serveur des écrans Projets. Chacune revérifie la session (requireAdmin) :
// une action serveur est un point d'entrée public, la vérification de la page ne suffit pas.

export interface ProjectInput {
  originalId: string | null;
  id: string;
  name: string;
  date: string;
  parcours: string;
  types: string[];
  line: string;
  context: string;
  tags: string[];
  skillsValidated: string[];
  github: string;
  figma: string;
  pdf: string;
  docs: { label: string; href: string; thumb?: string; alt?: string }[];
  steps: { label: string; status: string }[];
  videos: { title: string; kicker: string; url: string }[];
  visible: boolean;
  onHome: boolean;
  featured: boolean;
  homeCard: { section: string; eyebrow: string; line: string; tags: string[] } | null;
  status: "published" | "draft";
}

export type SaveResult = { ok: true; id: string } | { ok: false; error: string; session?: boolean };

const MAX_ACCUEIL = 9;
const MAX_PHARES = 3;

// Libellé court affiché sur les cartes (« UX / UI · Développement · Gestion »).
function typeLabel(types: string[]) {
  return types.map((t) => (t === "Conception et gestion" ? "Gestion" : t)).join(" · ");
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const refresh = () => revalidatePath("/", "layout");

export async function saveProject(input: ProjectInput): Promise<SaveResult> {
  // Session expirée : pas de redirection, pour que le formulaire garde le brouillon local.
  if (!(await isAdminSession())) return { ok: false, error: "Ta session a expiré.", session: true };
  const prisma = db();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Le nom du projet est obligatoire." };
  if (!input.parcours) return { ok: false, error: "Le cadre est obligatoire." };
  if (!input.types.length) return { ok: false, error: "Choisis au moins un type." };
  const id = slugify(input.id || name);
  if (!id) return { ok: false, error: "L’adresse de la page est vide." };

  const videos = [];
  for (const [i, v] of input.videos.entries()) {
    const yid = youtubeId(v.url);
    if (!yid) return { ok: false, error: `Le lien de la vidéo ${i + 1} n’est pas un lien YouTube.` };
    videos.push({ n: i + 1, kicker: v.kicker || `Film ${i + 1} sur ${input.videos.length}`, title: v.title, youtubeId: yid, url: v.url });
  }

  const others = await prisma.project.findMany({
    where: { deletedAt: null, NOT: { id: input.originalId ?? "" } },
    select: { id: true, onHome: true, featured: true, visible: true, status: true },
  });
  // Seuls les projets publics occupent une place à l'accueil ou parmi les phares.
  const publics = others.filter((o) => o.visible && o.status !== "draft");
  if (others.some((o) => o.id === id)) return { ok: false, error: `L’adresse /projets/${id} est déjà utilisée par un autre projet.` };
  if (input.onHome && input.visible && input.status !== "draft" && publics.filter((o) => o.onHome).length >= MAX_ACCUEIL)
    return { ok: false, error: `Déjà ${MAX_ACCUEIL} projets à l’accueil : retire d’abord l’un d’eux.` };
  if (input.featured && input.visible && input.status !== "draft" && publics.filter((o) => o.featured).length >= MAX_PHARES)
    return { ok: false, error: `Déjà ${MAX_PHARES} projets phares : désactive d’abord l’un d’eux.` };

  const existing = input.originalId ? await prisma.project.findUnique({ where: { id: input.originalId } }) : null;
  // Un champ modifié à la main est verrouillé : la synchronisation ne l'écrasera plus (§6.3).
  const meta = { ...((existing?.fieldMeta as Record<string, { origin: string; locked: boolean }>) ?? {}) };
  if (existing && existing.origin !== "manual") {
    const changed: [string, unknown, unknown][] = [
      ["name", existing.name, name],
      ["line", existing.line, input.line],
      ["tags", JSON.stringify(existing.tags), JSON.stringify(input.tags)],
      ["github", existing.github, input.github || null],
    ];
    for (const [k, before, after] of changed) if (before !== after) meta[k] = { origin: meta[k]?.origin ?? existing.origin, locked: true };
  }

  const data = {
    name,
    date: input.date.trim(),
    parcours: input.parcours,
    types: input.types,
    type: typeLabel(input.types),
    line: input.line.trim(),
    context: input.context.trim(),
    tags: input.tags,
    skillsValidated: input.skillsValidated,
    github: input.github.trim() || null,
    figma: input.figma.trim() || null,
    pdf: input.pdf.trim() || input.docs[0]?.href || null,
    docs: input.docs.map((d, i) => ({ n: i + 1, label: d.label, href: d.href, ...(d.thumb ? { thumb: d.thumb, alt: d.alt || `Aperçu : ${d.label}` } : {}) })),
    steps: input.steps.filter((s) => s.label.trim()),
    videos: videos.length ? videos : undefined,
    visible: input.visible,
    onHome: input.onHome,
    featured: input.featured,
    homeCard: input.onHome && input.homeCard ? { ...input.homeCard, order: (existing?.homeCard as { order?: number } | null)?.order ?? 99 } : undefined,
    status: input.status,
    fieldMeta: meta,
  };

  if (existing) {
    await prisma.project.update({ where: { id: existing.id }, data: { ...data, id, videos: videos.length ? videos : [] } });
  } else {
    const first = await prisma.project.findFirst({ orderBy: { position: "asc" }, select: { position: true } });
    await prisma.project.create({ data: { ...data, id, position: (first?.position ?? 0) - 1 } });
  }
  if (input.featured) {
    const row = await prisma.singleton.findUnique({ where: { key: "phares" } });
    const ids = ((row?.data as { ids?: string[] } | null)?.ids ?? []).filter((x) => x !== input.originalId);
    if (!ids.includes(id)) ids.push(id);
    await prisma.singleton.upsert({ where: { key: "phares" }, create: { key: "phares", data: { ids } }, update: { data: { ids } } });
  }
  await logActivity("project", id, `Projet « ${name} » ${existing ? "modifié" : "créé"}${input.status === "draft" ? " (brouillon)" : ""}`, existing ? "updated" : "created");
  refresh();
  return { ok: true, id };
}

// Publication d'un projet depuis la liste : publié, privé (masqué du site, sans être
// supprimé) ou brouillon. Un projet privé ou en brouillon n'apparaît nulle part sur le
// site public : liste, fiche, accueil, plan du site et sitemap.
export type Publication = "publie" | "prive" | "brouillon";
export async function setPublication(id: string, mode: Publication): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  if (mode === "publie") {
    const prisma = db();
    const p = await prisma.project.findUniqueOrThrow({ where: { id }, select: { onHome: true, featured: true } });
    const publics = await prisma.project.findMany({ where: { deletedAt: null, visible: true, status: { not: "draft" }, NOT: { id } }, select: { onHome: true, featured: true } });
    if (p.onHome && publics.filter((o) => o.onHome).length >= MAX_ACCUEIL)
      return { ok: false, error: `Déjà ${MAX_ACCUEIL} projets publics à l’accueil : retire d’abord l’un d’eux de l’accueil.` };
    if (p.featured && publics.filter((o) => o.featured).length >= MAX_PHARES)
      return { ok: false, error: `Déjà ${MAX_PHARES} projets phares publics : retire d’abord l’un d’eux.` };
  }
  const data = mode === "publie" ? { visible: true, status: "published" } : mode === "prive" ? { visible: false, status: "published" } : { visible: true, status: "draft" };
  const p = await db().project.update({ where: { id }, data });
  await logActivity("project", id, `Projet « ${p.name} » ${mode === "publie" ? "publié" : mode === "prive" ? "passé en privé" : "repassé en brouillon"}`, "updated");
  refresh();
  return { ok: true };
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const p = await db().project.update({ where: { id }, data: { deletedAt: new Date() } });
  await logActivity("project", id, `Projet « ${p.name} » supprimé`, "deleted");
  refresh();
}

// Annulation pendant 10 secondes après une suppression (§5).
export async function restoreProject(id: string) {
  await requireAdmin();
  const p = await db().project.update({ where: { id }, data: { deletedAt: null } });
  await logActivity("project", id, `Suppression du projet « ${p.name} » annulée`, "restored");
  refresh();
}

export async function duplicateProject(id: string) {
  await requireAdmin();
  const prisma = db();
  const src = await prisma.project.findUniqueOrThrow({ where: { id } });
  let newId = `${src.id}-copie`;
  for (let i = 2; await prisma.project.findUnique({ where: { id: newId }, select: { id: true } }); i++) newId = `${src.id}-copie-${i}`;
  const { createdAt: _c, updatedAt: _u, deletedAt: _d, ...rest } = src;
  await prisma.project.create({
    data: {
      ...rest,
      id: newId,
      name: `${src.name} (copie)`,
      status: "draft",
      onHome: false,
      featured: false,
      origin: "manual",
      types: src.types ?? [],
      tags: src.tags ?? [],
      docs: src.docs ?? [],
      steps: src.steps ?? [],
      skillsValidated: src.skillsValidated ?? [],
      videos: src.videos ?? undefined,
      fieldMeta: undefined,
      i18n: src.i18n ?? undefined,
      homeCard: undefined,
    },
  });
  await logActivity("project", newId, `Projet « ${src.name} » dupliqué`, "created");
  redirect(`/admin/projets/${newId}`);
}

// Formulaire « Dupliquer un projet » de l'écran Nouveau projet.
export async function duplicateFromForm(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("source") ?? "");
  if (id) await duplicateProject(id);
}
