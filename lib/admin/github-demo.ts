// Dépôts GitHub FICTIFS du mode démo (npm run demo:serveur, DEMO_DONNEES_FICTIVES=1) :
// la synchronisation et l'import par adresse les lisent à la place de l'API GitHub,
// pour que la base de démonstration ne reçoive jamais les vrais dépôts de Clara.
import type { RepoJson } from "./github";

export const DEMO_GITHUB_LOGIN = "demo-portfolio";

const repo = (id: number, name: string, description: string | null, pushed: string, extra: Partial<RepoJson> = {}): RepoJson => ({
  id,
  name,
  full_name: `${DEMO_GITHUB_LOGIN}/${name}`,
  description,
  html_url: `https://github.com/${DEMO_GITHUB_LOGIN}/${name}`,
  pushed_at: pushed,
  fork: false,
  archived: false,
  size: 420,
  ...extra,
});

export const DEMO_REPOS: RepoJson[] = [
  repo(910001, "carnet-de-rando", "Carnet de randonnée hors ligne : itinéraires, dénivelé et notes de terrain.", "2026-10-21T09:12:00Z"),
  repo(910002, "memo-accessible", "Jeu de mémoire jouable au clavier et au lecteur d’écran.", "2026-06-03T16:40:00Z"),
  repo(910003, "api-recettes", "API REST de recettes de saison, avec recherche par ingrédient.", "2026-09-14T11:05:00Z"),
  repo(910004, "meteo-du-potager", "Alerte gel et arrosage pour un potager partagé, à partir d’une API météo.", "2026-08-02T08:30:00Z"),
  repo(910005, "convertisseur-unites", "Petit convertisseur d’unités de cuisine en TypeScript.", "2026-03-19T18:22:00Z"),
  repo(910006, "notes-de-cours", null, "2025-12-01T10:00:00Z"),
  repo(910007, "fork-d-un-framework", "Copie d’un framework pour lire son code.", "2025-05-10T10:00:00Z", { fork: true }),
];

const LANGAGES: Record<string, Record<string, number>> = {
  "carnet-de-rando": { TypeScript: 52000, CSS: 8000, HTML: 1200 },
  "memo-accessible": { JavaScript: 21000, CSS: 6000, HTML: 3000 },
  "api-recettes": { TypeScript: 30000, Dockerfile: 400 },
  "meteo-du-potager": { Python: 14000 },
  "convertisseur-unites": { TypeScript: 6000 },
  "notes-de-cours": { Markdown: 1 },
  "fork-d-un-framework": { JavaScript: 90000 },
};

// Réponse de l'API GitHub simulée pour un chemin donné (mêmes chemins que lib/admin/github.ts).
export function ghDemo(path: string): unknown {
  if (/^\/users\/[^/]+\/repos/.test(path)) return DEMO_REPOS;
  const m = path.match(/^\/repos\/[^/]+\/([^/?]+)(\/languages)?/);
  const r = m && DEMO_REPOS.find((x) => x.name === m[1]);
  if (!m || !r) throw new Error("Dépôt introuvable ou privé.");
  if (m[2]) return LANGAGES[r.name] ?? {};
  return { ...r, owner: { login: DEMO_GITHUB_LOGIN }, homepage: null, has_pages: r.name === "carnet-de-rando" };
}
