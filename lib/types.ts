// Types de la couche de données (étape 3). Sources : docs/passation/assets/projects.json,
// docs/passation/data/*.json et docs/passation/contenu/*.txt.

export type ProjectType = "Développement" | "UX / UI" | "Conception et gestion";

export interface ProjectStep {
  label: string;
  status: string;
}

export interface ProjectDoc {
  n: number;
  label: string;
  href: string;
  thumb?: string;
  alt?: string;
}

export interface ProjectVideo {
  n: number;
  kicker: string;
  title: string;
  youtubeId: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  date: string;
  type: string;
  types: ProjectType[];
  parcours: string;
  line: string;
  tags: string[];
  pdf: string | null;
  docs: ProjectDoc[];
  steps: ProjectStep[];
  github: string | null;
  figma: string | null;
  context: string;
  skillsValidated: string[];
  onHome: boolean;
  featured: boolean;
  videos?: ProjectVideo[];
}

export interface IaStat {
  value: string;
  label: string;
  computed: string;
}

export interface IaTool {
  name: string;
  category: string;
  description: string;
  favorite: boolean;
}

export interface IaSkill {
  name: string;
  description: string;
  deliverables: string[];
}

export interface IaRoutine {
  title: string;
  when: string;
  description: string;
  note?: string;
}

export interface IaMethodStep {
  order: number;
  title: string;
  description: string;
}

export interface IaRule {
  title: string;
  description: string;
}

export interface IaCase {
  title: string;
  description: string;
  href: string;
}

export interface IaContent {
  intro: { title: string; lead: string };
  stats: IaStat[];
  tools: IaTool[];
  toolsIntro: string;
  skills: IaSkill[];
  skillsIntro: string;
  routines: IaRoutine[];
  routinesIntro: string;
  method: IaMethodStep[];
  rules: IaRule[];
  rulesIntro: string;
  cases: IaCase[];
}

// Les textes essentiel et complet sont deux versions indépendantes et déjà
// validées (contenu/cv-essentiel.txt, contenu/cv-complet.txt), pas une liste
// unique de puces avec drapeau partagé : on les garde donc chacune telle quelle.
export interface ExperienceBloc {
  name?: string;
  period?: string;
  bulletsEssentiel: string[];
  bulletsComplet: string[];
  technologies?: string[];
}

export interface Experience {
  poste: string;
  entreprise: string;
  entrepriseParent?: string;
  entrepriseHref?: string;
  entrepriseParentHref?: string;
  periode: string;
  lieuMode: string;
  contexteEssentiel: string;
  contexteComplet: string;
  blocs: ExperienceBloc[];
  competencesAcquisesComplet?: string[];
  note?: string;
}

export interface Formation {
  intitule: string;
  url: string;
  annees: string;
  diplome: string;
  niveauComplet: string;
  mode: "En alternance" | "Autodidacte";
  statut: "Obtenu" | "En cours";
  projets: string;
  competencesAcquises?: string[];
  mentionComplementaire?: string;
}

export interface CompetenceCategorie {
  categorie: string;
  items: string[];
}

export interface Langue {
  nom: string;
  niveau: string[];
}

export interface Recommendation {
  initiales: string;
  auteur: string;
  linkedin: string | null;
  poste: string;
  relation: string;
  citationCourte: string;
  texteIntegral: string[];
  lettrePdf?: string;
  entrepriseHref?: string;
}

export interface ProfilCv {
  profilCourt: string;
  profilLong: string;
}

