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

// Cases « projets » et « titre » de « En bref » (30 oct. 2026), calculées, jamais écrites à la main.
// Projets : le nombre indiqué sur chaque fiche de formation (« 13 projets réalisés », « 8 projets validés
// sur 11 » : le premier nombre), plus les projets hors formation de la base.
// Titre : le plus haut diplôme obtenu et sa formation (« Bac+5 · Full Stack Java & Angular »), comme
// dans la maquette ; le détail des 4 titres était trop long (demande de Clara, 2 nov. 2026).
export function enBref(
  formations: Pick<Formation, "projets" | "diplome" | "statut" | "intitule">[],
  compte: { horsFormation: number },
) {
  const total = formations.reduce((n, f) => n + (Number(/\d+/.exec(f.projets)?.[0]) || 0), 0) + compte.horsFormation;
  const niveau = (f: Pick<Formation, "diplome">) => Number(/Bac\+(\d)/.exec(f.diplome)?.[1]) || 0;
  const haut = formations.filter((f) => f.statut === "Obtenu" && niveau(f) > 0).sort((a, b) => niveau(b) - niveau(a))[0];
  return {
    projets: total > 0 ? { valeur: String(total), libelle: "projets" } : null,
    titres: haut ? { valeur: `Bac+${niveau(haut)}`, libelle: haut.intitule.replace(/\s+-\s+/g, " ") } : null,
  };
}

// Phrase d'ouverture du contexte de chaque projet (choix de Clara, 31 oct. 2026) : la même formule
// partout, seul le cadre change. Le reste du texte suit, sans répéter le cadre.
export function phraseCadre(parcours: string, formations: Pick<Formation, "intitule" | "nomOfficiel">[], entreprise?: string): string | null {
  const f = formations.find((x) => x.intitule === parcours);
  if (f) return `Projet réalisé dans le cadre de la formation ${f.nomOfficiel?.trim() || f.intitule}.`;
  if (parcours === "En entreprise") return entreprise ? `Projet réalisé dans le cadre de mon alternance chez ${entreprise}.` : "Projet réalisé dans le cadre de mon alternance.";
  if (parcours === "Projet personnel") return "Projet personnel, mené seule.";
  if (parcours === "Audit indépendant") return "Audit réalisé en indépendant.";
  return null;
}

/** Le contexte commence-t-il par la phrase de cadre (espaces et apostrophes typographiques tolérés) ? */
export const commenceParCadre = (texte: string, phrase: string) => {
  const n = (t: string) => t.replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
  return n(texte).startsWith(n(phrase));
};

export const profilPublic =(p: SiteProfile): SiteProfile => ({ ...p, telephone: "", noteIA: "" });
