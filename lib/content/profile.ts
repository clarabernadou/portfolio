// Transcrit depuis docs/passation/contenu/accueil.txt, cv-essentiel.txt et
// cv-complet.txt. Texte copié, jamais réécrit (CLAUDE.md).
import type { CompetenceCategorie, Langue, ProfilCv } from "../types";

export const identite = {
  nom: "Clara Bernadou",
  intituleSite: "Développeuse front-end & UI/UX designer",
  // Titre de l'accueil uniquement : trait d'union insécable (U+2011) dans
  // accueil.txt pour que « front‑end » ne se coupe jamais en fin de ligne.
  intituleAccueil: "Développeuse front‑end & UI/UX designer",
  accroche: "Je conçois et développe des applications web de bout en bout.",
  disponibilite: "CDI · disponible en mars 2027",
  lieu: "Full remote ou Vannes / Auray",
  permis: "Permis B, véhiculée",
};

export const langues: Langue[] = [
  { nom: "Français", niveau: ["Langue maternelle"] },
  {
    nom: "Anglais",
    niveau: [
      "Lecture et écrit : C1",
      "Compréhension orale : bonne",
      "Expression orale : en progression",
    ],
  },
];

export const profilCv: ProfilCv = {
  profilCourt:
    "Développeuse front-end (React, TypeScript) à double compétence UI/UX. En alternance depuis décembre 2023 sur 2 plateformes SaaS : je développe des fonctionnalités et des refontes de pages, et je conçois leurs maquettes sur Figma. Diplômée Bac+5 en développement logiciel (titre RNCP niveau 7), formation UX/UI Designer en cours.",
  // Version complète non publique (décision de Clara, 25 oct. 2026) : même texte que l'essentiel.
  profilLong:
    "Développeuse front-end (React, TypeScript) à double compétence UI/UX. En alternance depuis décembre 2023 sur 2 plateformes SaaS : je développe des fonctionnalités et des refontes de pages, et je conçois leurs maquettes sur Figma. Diplômée Bac+5 en développement logiciel (titre RNCP niveau 7), formation UX/UI Designer en cours.",
};

export const competencesEssentiel: CompetenceCategorie[] = [
  { categorie: "Front-end", items: ["React","TypeScript","JavaScript","Next.js","Vue.js","Tailwind CSS"] },
  { categorie: "Back-end et données", items: ["Node.js","NestJS","PostgreSQL","MongoDB"] },
  { categorie: "UI/UX", items: ["Figma","Design system","Prototypage","Recherche utilisateur","Tests utilisateurs","Accessibilité (WCAG, RGAA)"] },
  { categorie: "Outils", items: ["Git","Docker","Jest","Azure DevOps","Vercel"] },
  { categorie: "IA", items: ["Claude Code","Cursor","Création de skills Claude"] },
];

// Version complète non publique : mêmes compétences que l'essentiel.
export const competencesComplet: CompetenceCategorie[] = competencesEssentiel;
