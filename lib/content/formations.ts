// Transcrit depuis docs/passation/contenu/cv-essentiel.txt et cv-complet.txt.
import type { Formation } from "../types";
import { formationsLiens } from "../site-data";

function urlFor(nom: string): string {
  return formationsLiens.find((f) => f.nom === nom)?.url ?? "#";
}

export const formations: Formation[] = [
  {
    intitule: "UX Design / Product Designer",
    url: urlFor("UX Design / Product Designer"),
    annees: "2025 – 2027",
    diplome: "Bac+3/4",
    niveauComplet: "OpenClassrooms · Titre RNCP niveau 6 « UX/UI Designer » (Bac+3/4)",
    mode: "En alternance",
    statut: "En cours",
    projets: "8 projets validés sur 11",
  },
  {
    intitule: "Full Stack Java & Angular",
    url: urlFor("Full Stack Java & Angular"),
    annees: "2023 – 2025",
    diplome: "Bac+5",
    niveauComplet: "OpenClassrooms · Titre RNCP niveau 7 « Expert en développement logiciel » (Bac+5)",
    mode: "En alternance",
    statut: "Obtenu",
    projets: "13 projets réalisés",
    mentionComplementaire:
      "Diplôme américain également délivré par OpenClassrooms : Master’s degree in Computer Software Development",
  },
  {
    intitule: "Application JavaScript React",
    url: urlFor("Application JavaScript React"),
    annees: "2022 – 2023",
    diplome: "Bac+3/4",
    niveauComplet: "OpenClassrooms · Titre RNCP niveau 6 (Bac+3/4)",
    mode: "En autonomie",
    statut: "Obtenu",
    projets: "14 projets réalisés",
  },
  {
    intitule: "Développeur Web",
    url: urlFor("Développeur Web"),
    annees: "2021 – 2022",
    diplome: "Bac+2",
    niveauComplet: "OpenClassrooms · Titre RNCP niveau 5 (Bac+2)",
    mode: "En autonomie",
    statut: "Obtenu",
    projets: "7 projets réalisés",
  },
];
