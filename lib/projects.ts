import projectsData from "@/data/projects.json";
import type { Project } from "./types";

const projects = projectsData as Project[];

// L'ordre du fichier source est déjà du plus récent au plus ancien (README §5).
export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectCount(): number {
  return projects.length;
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

// Ordre du bandeau « Projets phares » (maquettes/site-mobile/projets.jpg) :
// Ce portfolio, WatchedThis, IntuitLearn — différent de l'ordre chronologique
// du fichier source, où featured:true liste intuitlearn avant watchedthis.
const FEATURED_ORDER = ["portfolio", "watchedthis", "intuitlearn"];

export function getFeaturedProjects(): Project[] {
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => FEATURED_ORDER.indexOf(a.id) - FEATURED_ORDER.indexOf(b.id));
}

export function getHomeProjects(): Project[] {
  return projects.filter((p) => p.onHome);
}

export function getProjectsWithLivrables(): Project[] {
  return projects.filter((p) => p.docs.length > 0);
}

export function getProjectTypeCounts(): { type: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const type of project.types) {
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([type, count]) => ({ type, count }));
}

export function getParcoursCounts(): { parcours: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    counts.set(project.parcours, (counts.get(project.parcours) ?? 0) + 1);
  }
  return Array.from(counts, ([parcours, count]) => ({ parcours, count }));
}

// Navigation en boucle : le premier projet renvoie au dernier et inversement
// (maquettes/fiches-desktop/portfolio.jpg : « Projet précédent » y est Booki,
// le dernier projet de la liste).
export function getAdjacentProjects(id: string): { previous: Project | null; next: Project | null } {
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return { previous: null, next: null };
  const previousIndex = (index - 1 + projects.length) % projects.length;
  const nextIndex = (index + 1) % projects.length;
  return {
    previous: projects[previousIndex],
    next: projects[nextIndex],
  };
}
