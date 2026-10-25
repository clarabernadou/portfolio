import type { Experience, Formation, IaContent, Project } from "./types";

// Types et fonctions sans accès à la base : utilisables dans les composants client.

export interface HomeCard {
  section: string;
  eyebrow: string;
  line: string;
  tags: string[];
  order: number;
}

export type SiteProject = Project & { homeCard?: HomeCard };

export function sortFeatured(projects: SiteProject[], order: string[]): SiteProject[] {
  const rank = (id: string) => {
    const i = order.indexOf(id);
    return i < 0 ? order.length : i;
  };
  return projects.filter((p) => p.featured).sort((a, b) => rank(a.id) - rank(b.id));
}

export function homeProjects(projects: SiteProject[]): SiteProject[] {
  return projects
    .filter((p) => p.onHome)
    .sort((a, b) => (a.homeCard?.order ?? 99) - (b.homeCard?.order ?? 99));
}

export interface AlternanceCard {
  lieuMode: string;
  technologies: string[];
  order: number;
}

export type SiteExperience = Experience & { homeCard?: AlternanceCard };
export type SiteFormation = Formation;

export interface SiteProfile {
  nom: string;
  intitule: string;
  accroche: string;
  contrat: string;
  disponibilite: string;
  entretiens: string;
  lieu: string;
  mobilite: string;
  email: string;
  telephone: string;
  linkedin: string;
  github: string;
  profilEssentiel: string;
  profilComplet: string;
  langues: { nom: string; niveau: string[] }[];
  photoAlt: string;
}

// « CDI · disponible en mars 2027 »
export const dispoLabel = (p: SiteProfile) => [p.contrat, p.disponibilite].filter(Boolean).join(" · ");

export interface SiteReco {
  initiales: string;
  auteur: string;
  linkedin: string | null;
  poste: string;
  relation: string;
  citationCourte: string;
  texteIntegral: string[];
  lettrePdf?: string;
  entrepriseHref?: string;
  lienTexte?: string;
  voirLinkedin: boolean;
}

// Repères du haut de la page IA, calculés à partir des listes (rien à saisir) :
// « ChatGPT, Gemini et Mistral » compte pour trois outils.
export function iaStats(ia: Pick<IaContent, "stats" | "tools" | "skills" | "routines">): { value: string; label: string }[] {
  const noms = (name: string) => name.split(/,\s*|\s+et\s+/).filter(Boolean);
  const claude = ia.tools.filter((t) => /^Claude\b/.test(t.name)).length;
  const autres = ia.tools.filter((t) => !/^Claude\b/.test(t.name)).reduce((n, t) => n + noms(t.name).length, 0);
  const valeurs = [ia.skills.length, claude, autres, ia.routines.length];
  return ia.stats.map((st, i) => ({ value: String(valeurs[i] ?? st.value), label: st.label }));
}

// Données envoyées aux pages publiques (décisions de Clara, 25 oct. 2026) : ni le
// téléphone (seulement dans le PDF du CV), ni la version complète du CV, qui reste
// dans l'administration. Ces champs sont vidés côté serveur, jamais seulement cachés.
export const profilPublic = (p: SiteProfile): SiteProfile => ({ ...p, telephone: "", profilComplet: "" });
export const experiencePublique = (e: SiteExperience): SiteExperience => ({
  ...e,
  contexteComplet: "",
  competencesAcquisesComplet: undefined,
  blocs: e.blocs.map((b) => ({ ...b, bulletsComplet: [] })),
});
export const formationPublique = (f: SiteFormation): SiteFormation => ({ ...f, competencesAcquises: undefined });
