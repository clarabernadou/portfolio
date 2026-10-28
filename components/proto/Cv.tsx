"use client";

import { CvView } from "./CvView";
import { siteContact } from "@/lib/site-data";
import { dispoLabel, type SiteExperience, type SiteFormation, type SiteProfile } from "@/lib/data-shared";

type Groupes = { name: string; items: string[] }[];

// Mêmes pictogrammes que l'en-tête du CV en PDF (lib/pdf/cv-html.ts) ; le téléphone n'est que dans le PDF.
const ICONES = {
  mail: "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 7l9 6 9-6",
  linkedin: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 11v5M8 8v.01M12 16v-5M16 16v-3a2 2 0 0 0-4 0",
  github: "M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
};
const sansProtocole = (url: string) => (url ?? "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export function Cv({ experiences, formations, skills, profil, photoUrl }: { experiences: SiteExperience[]; formations: SiteFormation[]; skills: Groupes; profil: SiteProfile; photoUrl: string }) {
  const v = {
    // Le CV n'a qu'une version, la même sur la page et dans le PDF (décisions de Clara, 25 et 28 oct. 2026).
    cvUrl: siteContact.cvPdfHref,
    experiences,
    formations,
    skillsEssentiel: skills,
    profil,
    photoUrl,
    dispo: dispoLabel(profil),
    contacts: [
      { href: `mailto:${profil.email}`, texte: profil.email, icone: ICONES.mail },
      { href: profil.linkedin, texte: sansProtocole(profil.linkedin), icone: ICONES.linkedin, externe: true },
      { href: profil.github, texte: sansProtocole(profil.github), icone: ICONES.github, externe: true },
    ].filter((c) => c.texte),
  };
  return <CvView v={v} />;
}
