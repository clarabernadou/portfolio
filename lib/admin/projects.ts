// Règles communes aux écrans Projets et au tableau de bord.

// Cadres qui ne sont pas des formations (les autres parcours le sont).
const CADRES_HORS_FORMATION = ["Alternance · Fruggr", "Projet personnel", "Audit indépendant"];

export const enCours = (p: { date: string }) => /en cours/i.test(p.date);
export const estFormation = (p: { parcours: string }) => !CADRES_HORS_FORMATION.includes(p.parcours);

type P = { date: string; parcours: string; types: unknown; github: string | null; docs: unknown; steps: unknown; origin: string; context: string };

// Les quatre listes « À compléter » (ADMIN-et-SYNCHRONISATION.md, §5).
// niveau « erreur » : le projet reste masqué ou incomplet sur le site ; « alerte » : simple manque.
export const A_COMPLETER = {
  imports: { niveau: "erreur", label: (n: number) => `${n} ${n > 1 ? "éléments importés" : "élément importé"} à compléter`, test: (p: P) => p.origin !== "manual" && (!p.context || !(p.types as string[]).length) },
  github: { niveau: "alerte", label: (n: number) => `${n} ${n > 1 ? "projets" : "projet"} de développement sans lien GitHub`, test: (p: P) => (p.types as string[]).includes("Développement") && !p.github },
  livrables: { niveau: "alerte", label: (n: number) => `${n} ${n > 1 ? "projets" : "projet"} de formation sans livrable`, test: (p: P) => estFormation(p) && !(p.docs as unknown[]).length },
  etapes: { niveau: "alerte", label: (n: number) => `${n} ${n > 1 ? "projets" : "projet"} en cours sans étapes d’avancement`, test: (p: P) => enCours(p) && !(p.steps as unknown[]).length },
} as const;

export type ACompleter = keyof typeof A_COMPLETER;

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}
