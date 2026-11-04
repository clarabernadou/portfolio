// Transcrit depuis docs/passation/contenu/accueil.txt, cv-essentiel.txt et
// cv-complet.txt. Texte copié, jamais réécrit (CLAUDE.md).
import type { CompetenceCategorie, Langue, ProfilCv } from "../types";

export const identite = {
  nom: "Clara Bernadou",
  intituleSite: "Développeuse full-stack",
  // Titre de l'accueil uniquement : trait d'union insécable (U+2011) dans
  // accueil.txt pour que « full‑stack » ne se coupe jamais en fin de ligne.
  intituleAccueil: "Développeuse full‑stack",
  accroche: "Je conçois et développe des applications web accessibles (React, TypeScript, Node.js), de la maquette Figma à la mise en production.",
  disponibilite: "CDI · disponible en mars 2027",
  lieu: "Full remote ou Vannes / Auray",
  permis: "Permis B, véhiculée",
};

export const langues: Langue[] = [
  { nom: "Français", niveau: ["Langue maternelle"] },
  {
    nom: "Anglais",
    niveau: [
      "Lecture et écriture : C1",
      "Compréhension et expression orales : B1",
    ],
  },
];

export const profilCv: ProfilCv = {
  profilCourt:
    "Développeuse full-stack (React, TypeScript, Node.js), je conçois et développe des applications web accessibles, de la maquette Figma à la mise en production. Bac+5, en alternance depuis décembre 2023 sur deux plateformes SaaS ; l’IA fait partie de mon quotidien.",
};

export const competencesEssentiel: CompetenceCategorie[] = [
  { categorie: "Front-end", items: ["React","TypeScript / JavaScript","Next.js","Tailwind CSS"] },
  { categorie: "Back-end et données", items: ["Node.js","NestJS","SQL (PostgreSQL, MySQL)","MongoDB"] },
  { categorie: "UI/UX", items: ["Figma","Design system","Prototypage","Architecture de l’information","Accessibilité (WCAG, RGAA)"] },
  { categorie: "Outils et IA", items: ["Git","Tests (Jest, Playwright)","Claude Code","Skills Claude sur mesure"] },
];

