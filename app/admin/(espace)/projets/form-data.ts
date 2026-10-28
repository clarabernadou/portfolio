import { db } from "@/lib/db";
import type { ProjectInput } from "./actions";
import type { ProjectFormProps } from "@/components/admin/ProjectForm";

type Row = Awaited<ReturnType<ReturnType<typeof db>["project"]["findMany"]>>[number];

export function toInput(r: Row): ProjectInput {
  const hc = r.homeCard as ProjectInput["homeCard"] | null;
  return {
    originalId: r.id,
    id: r.id,
    name: r.name,
    date: r.date,
    parcours: r.parcours,
    types: r.types as string[],
    line: r.line,
    context: r.context,
    tags: r.tags as string[],
    skillsValidated: r.skillsValidated as string[],
    github: r.github ?? "",
    figma: r.figma ?? "",
    site: r.site ?? "",
    pdf: r.pdf ?? "",
    docs: (r.docs as { label: string; href: string; thumb?: string; alt?: string }[]) ?? [],
    steps: (r.steps as { label: string; status: string }[]) ?? [],
    videos: ((r.videos as { title: string; kicker: string; url: string }[] | null) ?? []).map(({ title, kicker, url }) => ({ title, kicker, url })),
    visible: r.visible,
    onHome: r.onHome,
    featured: r.featured,
    homeCard: hc ? { section: hc.section, eyebrow: hc.eyebrow, line: hc.line, tags: hc.tags } : null,
    status: r.status === "draft" ? "draft" : "published",
  };
}

export const EMPTY: ProjectInput = {
  originalId: null,
  id: "",
  name: "",
  date: "",
  parcours: "",
  types: [],
  line: "",
  context: "",
  tags: [],
  skillsValidated: [],
  github: "",
  figma: "",
  site: "",
  pdf: "",
  docs: [],
  steps: [],
  videos: [],
  visible: true,
  onHome: false,
  featured: false,
  homeCard: null,
  status: "published",
};

// Listes de choix et suggestions (tags et compétences des autres projets du même cadre).
export async function formContext(): Promise<Omit<ProjectFormProps, "initial" | "note" | "updatedAt">> {
  const prisma = db();
  const [rows, cats] = await Promise.all([
    prisma.project.findMany({ where: { deletedAt: null }, select: { parcours: true, tags: true, skillsValidated: true, onHome: true, featured: true, visible: true, status: true } }),
    prisma.category.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] }),
  ]);
  const tagSuggestions: Record<string, string[]> = {};
  const skillSuggestions: Record<string, string[]> = {};
  for (const r of rows) {
    const t = (tagSuggestions[r.parcours] ??= []);
    for (const x of r.tags as string[]) if (!t.includes(x)) t.push(x);
    const s = (skillSuggestions[r.parcours] ??= []);
    for (const x of r.skillsValidated as string[]) if (!s.includes(x)) s.push(x);
  }
  return {
    cadres: cats.filter((c) => c.kind === "cadre").map((c) => c.name),
    types: cats.filter((c) => c.kind === "type").map((c) => c.name),
    tagSuggestions,
    skillSuggestions,
    // Seuls les projets publics comptent : un projet privé ou en brouillon n'occupe pas de place.
    counts: { onHome: rows.filter((r) => r.onHome && r.visible && r.status !== "draft").length, featured: rows.filter((r) => r.featured && r.visible && r.status !== "draft").length },
  };
}
