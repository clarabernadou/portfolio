import { db } from "@/lib/db";
import liensJson from "@/data/liens.json";
import { listPublicRepos, moisAnnee, prettyName, repoLanguages, toRepoInfo, type RepoJson } from "./github";
import { slugify } from "./projects";

// Synchronisation automatique (ADMIN-et-SYNCHRONISATION.md §6).
// Règle commune : un élément importé est créé avec les informations disponibles ;
// un champ modifié à la main (fieldMeta.locked) n'est jamais écrasé.

export interface SyncSettings {
  github: {
    createProjects: boolean;
    ignoreForks: boolean;
    ignoreArchivedEmpty: boolean;
    autoPublish: boolean;
    // Décision validée : un dépôt sans description est créé mais masqué.
    hideWithoutDescription: boolean;
    // Dépôts déjà présents au premier passage : référence, non importés d'office.
    baseline: number[] | null;
    lastRun: string | null;
  };
}

export const SYNC_DEFAUT: SyncSettings = {
  github: { createProjects: true, ignoreForks: true, ignoreArchivedEmpty: true, autoPublish: true, hideWithoutDescription: true, baseline: null, lastRun: null },
};

export async function getSyncSettings(): Promise<SyncSettings> {
  const row = await db().singleton.findUnique({ where: { key: "sync" } });
  const d = (row?.data ?? {}) as Partial<SyncSettings>;
  return { github: { ...SYNC_DEFAUT.github, ...d.github } };
}

export async function setSyncSettings(s: SyncSettings) {
  const data = JSON.parse(JSON.stringify(s));
  await db().singleton.upsert({ where: { key: "sync" }, create: { key: "sync", data }, update: { data } });
}

const normUrl = (u: string | null | undefined) => (u ?? "").toLowerCase().replace(/\/+$/, "").replace(/\.git$/, "");
type Meta = Record<string, { origin: string; locked: boolean }>;

export interface SyncReport {
  created: string[];
  updated: string[];
  skipped: string[];
  baseline?: number;
  error?: string;
}

// Un dépôt public → un projet (§6.1). Les dépôts déjà liés à un projet (même adresse
// GitHub) ne créent rien ; un projet importé de GitHub est mis à jour hors champs verrouillés.
// `source` permet aux tests de simuler les dépôts et leurs langages sans appeler GitHub.
export async function syncGithub(options: { importIds?: number[]; source?: { repos: RepoJson[]; languages: (fullName: string) => Promise<string[]> } } = {}): Promise<SyncReport> {
  const prisma = db();
  const settings = await getSyncSettings();
  const g = settings.github;
  const report: SyncReport = { created: [], updated: [], skipped: [] };
  const log = (entityId: string, action: string, state: string, message: string) => prisma.syncLog.create({ data: { source: "github", entity: "project", entityId, action, state, message } });

  const repos = options.source?.repos ?? (await listPublicRepos(liensJson.profil.githubLogin));
  const langues = options.source?.languages ?? repoLanguages;
  const eligibles = repos.filter((r) => !(g.ignoreForks && r.fork) && !(g.ignoreArchivedEmpty && (r.archived || r.size === 0)));

  if (g.baseline === null) {
    g.baseline = repos.map((r) => r.id);
    report.baseline = g.baseline.length;
    await log("*", "baseline", "Référence", `Première synchronisation : ${g.baseline.length} dépôts existants pris comme référence (non importés d’office).`);
  }

  const projets = await prisma.project.findMany({ where: { deletedAt: null } });
  for (const r of eligibles) {
    const id = r.id;
    const lie = projets.find((p) => normUrl(p.github) === normUrl(r.html_url));
    const nouveau = !g.baseline.includes(id) || options.importIds?.includes(id);
    if (!lie && !nouveau) continue;
    const info = toRepoInfo(r, await langues(r.full_name));
    const name = prettyName(info.name);

    if (!lie) {
      if (!g.createProjects) continue;
      let pid = slugify(info.name);
      for (let i = 2; projets.some((p) => p.id === pid) || (await prisma.project.findUnique({ where: { id: pid }, select: { id: true } })); i++) pid = `${slugify(info.name)}-${i}`;
      const visible = !(g.hideWithoutDescription && !info.description);
      const meta: Meta = Object.fromEntries(["name", "line", "tags", "github", "date"].map((k) => [k, { origin: "github", locked: false }]));
      const first = await prisma.project.findFirst({ orderBy: { position: "asc" }, select: { position: true } });
      await prisma.project.create({
        data: {
          id: pid,
          position: (first?.position ?? 0) - 1,
          name,
          date: moisAnnee(info.pushedAt),
          type: "Développement",
          types: ["Développement"],
          parcours: "Projet personnel",
          line: info.description,
          tags: info.languages,
          docs: [],
          steps: [],
          context: "",
          skillsValidated: [],
          github: info.url,
          visible,
          status: g.autoPublish ? "published" : "draft",
          origin: "github",
          fieldMeta: meta,
        },
      });
      g.baseline.push(id);
      report.created.push(name);
      await log(pid, "created", visible ? "Publié · À compléter" : "Masqué (sans description) · À compléter", `Projet « ${name} » créé depuis GitHub`);
      continue;
    }

    if (lie.origin !== "github") continue;
    // Mise à jour d'un projet importé : seulement les champs non verrouillés.
    const meta = (lie.fieldMeta ?? {}) as Meta;
    const champs: Record<string, unknown> = { name, line: info.description, tags: info.languages, date: moisAnnee(info.pushedAt) };
    const data: Record<string, unknown> = {};
    const ignores: string[] = [];
    for (const [k, v] of Object.entries(champs)) {
      const avant = JSON.stringify((lie as Record<string, unknown>)[k]);
      if (avant === JSON.stringify(v)) continue;
      if (meta[k]?.locked) ignores.push(k);
      else data[k] = v;
    }
    if (Object.keys(data).length) {
      await prisma.project.update({ where: { id: lie.id }, data });
      report.updated.push(lie.name);
      await log(lie.id, "updated", "Mis à jour", `Projet « ${lie.name} » mis à jour depuis GitHub (${Object.keys(data).join(", ")})`);
    }
    if (ignores.length) {
      report.skipped.push(lie.name);
      await log(lie.id, "skipped", "Conservé", `Projet « ${lie.name} » : ${ignores.join(", ")} non modifiés, car corrigés à la main`);
    }
  }

  g.lastRun = new Date().toISOString();
  await setSyncSettings(settings);
  return report;
}

// Dépôts publics présents à la première synchronisation et non liés à un projet :
// importables un par un depuis l'écran Synchronisation.
export async function reposNonImportes() {
  const settings = await getSyncSettings();
  const repos = await listPublicRepos(liensJson.profil.githubLogin);
  const projets = await db().project.findMany({ where: { deletedAt: null }, select: { github: true } });
  return repos
    .filter((r) => !(settings.github.ignoreForks && r.fork) && !(settings.github.ignoreArchivedEmpty && (r.archived || r.size === 0)))
    .filter((r) => !projets.some((p) => normUrl(p.github) === normUrl(r.html_url)))
    .map((r) => ({ id: r.id, name: r.name, url: r.html_url, description: r.description ?? "" }));
}
