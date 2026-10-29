// Règles communes aux écrans Projets et au tableau de bord.

// Cadres qui ne sont pas des formations (les autres parcours le sont).
const CADRES_HORS_FORMATION = ["En entreprise", "Projet personnel", "Audit indépendant"];

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

// Tris de la liste des projets (demande de Clara, 29 oct. 2026). Sans tri : l'ordre du site.
export const TRIS = [
  ["nom", "Nom, de A à Z"],
  ["nom-desc", "Nom, de Z à A"],
  ["date-desc", "Date, du plus récent"],
  ["date", "Date, du plus ancien"],
] as const;
export type Tri = (typeof TRIS)[number][0];

const MOIS = ["janv", "fév", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
const SAISONS: Record<string, number> = { hiver: 0, printemps: 3, "été": 6, automne: 9 };

// Clé de tri d'une date de projet (« mars 2025 – juin 2026 », « été 2026 », « oct. 2026 · en cours ») :
// la plus récente des dates citées, comptée en mois. Sans date (« projet perso ») : null.
export function cleDate(date: string): number | null {
  const cles = [...date.toLowerCase().matchAll(/(?:(\p{L}+)\.?\s+)?(\d{4})/gu)].map(([, mot, an]) => {
    const m = mot ? MOIS.indexOf(mot) : -1;
    return Number(an) * 12 + (m >= 0 ? m : (SAISONS[mot ?? ""] ?? 0));
  });
  return cles.length ? Math.max(...cles) : null;
}

// Les projets sans date restent à la fin, quel que soit le sens.
export function trier<T extends { name: string; date: string }>(projets: T[], tri: string | undefined): T[] {
  if (!tri || !TRIS.some(([v]) => v === tri)) return projets;
  const nom = (a: T, b: T) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
  return [...projets].sort((a, b) => {
    if (tri === "nom") return nom(a, b);
    if (tri === "nom-desc") return nom(b, a);
    const ka = cleDate(a.date), kb = cleDate(b.date);
    if (ka === null || kb === null) return ka === kb ? nom(a, b) : ka === null ? 1 : -1;
    return (tri === "date" ? ka - kb : kb - ka) || nom(a, b);
  });
}

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}
