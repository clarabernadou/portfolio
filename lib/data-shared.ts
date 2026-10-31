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
  langues: { nom: string; niveau: string[] }[];
  photoAlt: string;
  /** Premier chiffre de « En bref » sur l'accueil (ex. « 70+ » pull requests) : masqué s'il est absent. */
  chiffreCle?: { valeur: string; libelle: string };
  /** Début de la première formation, plus précis que les années des fiches (« oct. 2021 »). */
  formationDepuis?: string;
  /** Section « Projet » du CV PDF, entre expériences et formations : masquée si vide. */
  projetsCv?: { titre: string; lien?: string; periode: string; puces: string[] }[];
  /** Profil pour l'IA de relecture (administration) : privé, jamais envoyé aux pages publiques. */
  noteIA?: string;
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

// Données envoyées aux pages publiques (décision de Clara, 25 oct. 2026) : ni le téléphone
// (seulement dans le PDF du CV), ni le profil pour l'IA. Vidés côté serveur, jamais seulement cachés.
// Durée d'alternance depuis le début de la plus ancienne expérience (« déc. 2023 – … ») : calculée, jamais écrite à la main.
const MOIS = ["janv", "fév", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
export function dureeAlternance(experiences: Pick<Experience, "periode">[], maintenant = new Date()): { ans: number; mois: number } | null {
  const debuts = experiences.flatMap((e) => {
    const m = e.periode.match(/^(\p{L}+)\.?\s+(\d{4})/u);
    const i = m ? MOIS.indexOf(m[1].toLowerCase()) : -1;
    return i < 0 ? [] : [Number(m![2]) * 12 + i];
  });
  if (!debuts.length) return null;
  const total = maintenant.getFullYear() * 12 + maintenant.getMonth() - Math.min(...debuts);
  return total > 0 ? { ans: Math.floor(total / 12), mois: total % 12 } : null;
}

// Cases « projets » et « titres » de « En bref » (30 oct. 2026), calculées, jamais écrites à la main.
// Projets : le nombre indiqué sur chaque fiche de formation (« 13 projets réalisés », « 8 projets validés
// sur 11 » : le premier nombre), plus les projets hors formation de la base.
export function enBref(
  formations: Pick<Formation, "projets" | "diplome" | "statut" | "annees">[],
  compte: { horsFormation: number; avecLivrables: number },
  depuis?: string,
) {
  const total = formations.reduce((n, f) => n + (Number(/\d+/.exec(f.projets)?.[0]) || 0), 0) + compte.horsFormation;
  const niveaux = formations.flatMap((f) => {
    const m = /Bac\+(\d)/.exec(f.diplome);
    return m ? [Number(m[1])] : [];
  });
  const enCours = formations.filter((f) => f.statut === "En cours").length;
  const debut = depuis || formations.map((f) => /\d{4}/.exec(f.annees)?.[0]).filter(Boolean).sort()[0];
  return {
    projets: total > 0 ? { valeur: String(total), libelle: `projets${compte.avecLivrables > 0 ? `, dont ${compte.avecLivrables} avec livrables` : ""}` } : null,
    titres: formations.length
      ? {
          valeur: `${formations.length} titre${formations.length > 1 ? "s" : ""}`,
          libelle: [
            `RNCP${niveaux.length ? `, du Bac+${Math.min(...niveaux)} au Bac+${Math.max(...niveaux)}` : ""}${enCours ? `, dont ${enCours} en cours` : ""}`,
            debut ? `en formation depuis ${debut}` : "",
          ].filter(Boolean).join(" · "),
        }
      : null,
  };
}

export const profilPublic =(p: SiteProfile): SiteProfile => ({ ...p, telephone: "", noteIA: "" });
