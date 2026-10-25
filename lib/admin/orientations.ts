import orientationsJson from "@/data/cv-orientations.json";
import type { OrientationState } from "@/lib/pdf/cv-data";

// Valeurs de départ des CV orientés (data/cv-orientations.json, ADMIN-et-SYNCHRONISATION.md §5 bis).

export type OrientationId = "ux" | "dev";

export function defaults(id: OrientationId): OrientationState {
  const o = orientationsJson.orientations.find((x) => x.id === id)!;
  return {
    id: o.id,
    name: o.name,
    title: o.title,
    profile: o.profile,
    skillOrder: o.skillOrder,
    featuredProjects: o.featuredProjects,
    firstFormation: o.firstFormation,
    fileName: o.fileName,
    bullets: orientationsJson.bullets.filter((b) => b[id as "ux" | "dev"]).map((b) => b.text),
  };
}

// État enregistré en base, complété par les valeurs de départ pour les champs absents.
export function toState(id: OrientationId, data: unknown): OrientationState {
  const d = defaults(id);
  // Les anciens textes anglais (« en ») ne sont plus repris.
  const { en: _en, ...saved } = (data ?? {}) as Partial<OrientationState> & { en?: unknown };
  return { ...d, ...saved };
}

// Étiquettes UX / Dev d'une puce : pour quelle orientation elle est suggérée.
export function bulletFlags(text: string): { ux: boolean; dev: boolean } {
  const b = orientationsJson.bullets.find((x) => x.text === text);
  return { ux: !!b?.ux, dev: !!b?.dev };
}

export const PROFIL_MAX = orientationsJson.profileMaxLength;
export const ORIENTATIONS = orientationsJson.orientations.map((o) => ({ id: o.id as OrientationId, name: o.name, featured: o.featuredProjects, firstFormation: o.firstFormation, title: o.title, skillOrder: o.skillOrder }));
