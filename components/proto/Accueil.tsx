"use client";

import { AccueilView } from "./AccueilView";
import { siteContact } from "@/lib/site-data";
import { dispoLabel, type SiteExperience, type SiteFormation, type SiteProfile, type SiteProject, type SiteReco } from "@/lib/data-shared";

// Cartes « Projets » : projets mis à l'accueil, avec le texte propre à leur carte.
function cards(home: SiteProject[], section: string) {
  return home
    .filter((p) => (p.homeCard?.section ?? (p.types.includes("Développement") ? "Développement" : "Design")) === section)
    .map((p) => ({
      id: p.id,
      name: p.name,
      eyebrow: p.homeCard?.eyebrow ?? p.parcours,
      line: p.homeCard?.line ?? p.line,
      tags: p.homeCard?.tags ?? p.tags,
    }));
}

export function Accueil({ home, experiences, formations, profil, recos }: { home: SiteProject[]; experiences: SiteExperience[]; formations: SiteFormation[]; profil: SiteProfile; recos: SiteReco[] }) {
  const v: Record<string, unknown> = {
    cvUrl: siteContact.cvPdfHref,
    profil,
    dispo: dispoLabel(profil),
    homeEntreprise: cards(home, "En entreprise"),
    homeDesign: cards(home, "Design"),
    homeDev: cards(home, "Développement"),
    // Parcours : alternances et frise, de la plus ancienne à la plus récente.
    alternances: experiences.filter((e) => e.homeCard).sort((a, b) => a.homeCard!.order - b.homeCard!.order),
    frise: [...formations].reverse(),
    recos,
  };
  return <AccueilView v={v} />;
}
