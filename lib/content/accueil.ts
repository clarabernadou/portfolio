// Transcrit depuis docs/passation/contenu/accueil.txt. Sélection propre à
// l'accueil (texte et tags parfois différents de la fiche projet complète).

export interface AccueilProjectCard {
  id: string;
  eyebrow: string;
  name: string;
  line: string;
  tags: string[];
}

export const projetsDesign: AccueilProjectCard[] = [
  {
    id: "intuitlearn",
    eyebrow: "Audit UX / UI",
    name: "IntuitLearn",
    line: "Audit d’une application d’apprentissage des langues : détail visuel et accessibilité.",
    tags: ["Audit", "Accessibilité", "UI"],
  },
  {
    id: "les-bambinets",
    eyebrow: "UX Design · OpenClassrooms",
    name: "Les Bambinets",
    line: "Prototype d’une application mobile.",
    tags: ["Figma", "Prototypage"],
  },
  {
    id: "equi-libre",
    eyebrow: "UX Design · OpenClassrooms",
    name: "Équi-libre",
    line: "Architecture de l’information : tri de cartes, parcours utilisateurs et wireframes.",
    tags: ["Tri de cartes", "Wireframes"],
  },
];

export const projetsDeveloppement: AccueilProjectCard[] = [
  {
    id: "portfolio",
    eyebrow: "Projet perso",
    name: "Ce portfolio",
    line: "Mon portfolio, mené seule de A à Z : charte graphique, UX, prototype, puis développement Next.js avec une administration sur mesure.",
    tags: ["Next.js", "TypeScript", "Prisma", "Accessibilité"],
  },
  {
    id: "watchedthis",
    eyebrow: "Projet perso",
    name: "WatchedThis",
    line: "Suivi de films et séries, conçu et développé de bout en bout, maintenu plusieurs mois.",
    tags: ["React", "Redux", "Node.js", "MySQL"],
  },
  {
    id: "monde-de-dev",
    eyebrow: "Full-Stack · OpenClassrooms",
    name: "Monde de Dév",
    line: "Mise en relation de développeurs par centres d’intérêt techniques.",
    tags: ["Spring Boot", "Angular", "MySQL"],
  },
];

export const stats = [
  { value: "4", label: "formations OpenClassrooms" },
  { value: "Bac+5", label: "Full Stack Java & Angular" },
  { value: "40", label: "projets, dont 23 avec livrables" },
  { value: "2", label: "alternances depuis 2023" },
];

export interface AlternanceCardContent {
  periode: string;
  poste: string;
  entreprise: string;
  entrepriseParent: string;
  lieuMode: string;
  technologies: string[];
}

// Ordre du plus ancien au plus récent (maquette site-desktop/accueil.jpg).
export const alternances: AlternanceCardContent[] = [
  {
    periode: "déc. 2023 – fév. 2025",
    poste: "Développeuse Full-Stack & UI Designer",
    entreprise: "CarbonScore",
    entrepriseParent: "TechUpClimate",
    lieuMode: "Alternance · Pontoise, télétravail",
    technologies: ["Vue.js", "TypeScript", "NestJS", "PostgreSQL", "Figma"],
  },
  {
    periode: "mars 2025 – aujourd’hui",
    poste: "Développeuse Full-Stack & UI Designer",
    entreprise: "Fruggr",
    entrepriseParent: "Digital4Better",
    lieuMode: "Alternance · Nantes, télétravail",
    technologies: ["React", "NestJS", "MongoDB", "Figma", "Azure"],
  },
];
