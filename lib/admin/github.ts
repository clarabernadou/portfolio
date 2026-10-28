// Lecture d'un dépôt GitHub public (API REST officielle). Le jeton GITHUB_SYNC_TOKEN
// (lecture seule, étape 11) est utilisé s'il existe ; sans lui, la limite est de
// 60 requêtes par heure, largement suffisante pour un import à la main.

export interface RepoInfo {
  name: string;
  fullName: string;
  description: string;
  languages: string[];
  url: string;
  pushedAt: string | null;
  fork: boolean;
  archived: boolean;
  size: number;
}

export function parseRepoUrl(input: string): { owner: string; repo: string } | null {
  const m = input.trim().match(/github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?(?:[?#].*)?$/i);
  return m ? { owner: m[1], repo: m[2] } : null;
}

async function gh(path: string) {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_SYNC_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_SYNC_TOKEN}`;
  const r = await fetch(`https://api.github.com${path}`, { headers, cache: "no-store" });
  if (!r.ok) {
    if (r.status === 404) throw new Error("Dépôt introuvable ou privé.");
    if ((r.status === 403 || r.status === 429) && r.headers.get("x-ratelimit-remaining") === "0") throw new Error("Limite de requêtes GitHub atteinte pour l’heure : réessaie un peu plus tard.");
    throw new Error(`GitHub a répondu ${r.status}.`);
  }
  return r.json();
}

export type RepoJson = { id: number; name: string; full_name: string; description: string | null; html_url: string; pushed_at: string | null; fork: boolean; archived: boolean; size: number };

export function toRepoInfo(r: RepoJson, languages: string[]): RepoInfo {
  return {
    name: r.name,
    fullName: r.full_name,
    description: r.description ?? "",
    languages,
    url: r.html_url,
    pushedAt: r.pushed_at,
    fork: r.fork,
    archived: r.archived,
    size: r.size,
  };
}

export async function fetchRepo(owner: string, repo: string): Promise<RepoInfo> {
  const [r, langs] = await Promise.all([gh(`/repos/${owner}/${repo}`), gh(`/repos/${owner}/${repo}/languages`)]);
  return toRepoInfo(r as RepoJson, Object.keys(langs as Record<string, number>));
}

/** Site en ligne d'un dépôt : le champ « Website » du dépôt, sinon son adresse GitHub Pages ; "" s'il n'y en a pas. */
export async function siteDuDepot(owner: string, repo: string): Promise<string> {
  const r = (await gh(`/repos/${owner}/${repo}`)) as { name: string; owner: { login: string }; homepage: string | null; has_pages: boolean };
  if (r.homepage?.trim()) return /^https?:\/\//.test(r.homepage.trim()) ? r.homepage.trim() : `https://${r.homepage.trim()}`;
  return r.has_pages ? `https://${r.owner.login.toLowerCase()}.github.io/${r.name}/` : "";
}

export async function listPublicRepos(login: string): Promise<RepoJson[]> {
  return (await gh(`/users/${login}/repos?type=owner&per_page=100&sort=created`)) as RepoJson[];
}

export async function repoLanguages(fullName: string): Promise<string[]> {
  return Object.keys((await gh(`/repos/${fullName}/languages`)) as Record<string, number>);
}

// « Repo-Name_v2 » → « Repo Name v2 »
export function prettyName(name: string): string {
  return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export function moisAnnee(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
