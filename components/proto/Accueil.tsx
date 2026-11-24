"use client";

import { AccueilView } from "./AccueilView";
import { siteContact } from "@/lib/site-data";
import type { FormationCourte } from "@/lib/types";
import { dispoLabel, type enBref, type SiteExperience, type SiteFormation, type SiteProfile, type SiteProject, type SiteReco } from "@/lib/data-shared";

// Cartes « Projets » : projets mis à l'accueil, avec le texte propre à leur carte.
function cards(home: SiteProject[], section: string) {
  return home
    .filter((p) => (p.homeCard?.section ?? (p.types.includes("Développement") ? "Développement" : "Design")) === section)
    .map((p) => ({
      id: p.id,
      name: p.name,
      // Cadre · date, comme sur toutes les cartes de projet (24 nov. 2026).
      parcours: p.parcours,
      date: p.date,
      line: p.homeCard?.line ?? p.line,
      // Toutes les étiquettes du projet, celles choisies pour la carte d'accueil d'abord (24 nov. 2026) : la carte en
      // montre autant que la largeur le permet, puis « +N », comme dans la bibliothèque de projets (EtiquettesCarte).
      tags: [...new Set([...(p.homeCard?.tags ?? []), ...p.tags])],
    }));
}

export function Accueil({ home, total, bref, experiences, duree, formations, courtes, profil, recos, iaPubliee = true }: { home: SiteProject[]; total: number; bref: ReturnType<typeof enBref>; experiences: SiteExperience[]; duree: { ans: number; mois: number } | null; formations: SiteFormation[]; courtes: FormationCourte[]; profil: SiteProfile; recos: SiteReco[]; iaPubliee?: boolean }) {
  const v: Record<string, unknown> = {
    iaPubliee,
    cvUrl: siteContact.cvPdfHref,
    profil,
    dispo: dispoLabel(profil),
    chiffreCle: profil.chiffreCle,
    // « 2 ans » + « et 11 mois d'expérience professionnelle » (en alternance) : la durée reste exacte, sans arrondi.
    duree: duree && duree.ans > 0 && {
      valeur: `${duree.ans} an${duree.ans > 1 ? "s" : ""}`,
      libelle: `${duree.mois ? `et ${duree.mois} mois ` : ""}d’expérience professionnelle`,
    },
    // Lien vers la liste et « En bref » : les projets publiés ; titres calculés (lib/data-shared.ts).
    total,
    projetsBref: bref.projets,
    titres: bref.titres,
    homeEntreprise: cards(home, "En entreprise"),
    homeDesign: cards(home, "Design"),
    homeDev: cards(home, "Développement"),
    // Parcours : alternances et frise, de la plus ancienne à la plus récente.
    alternances: experiences.filter((e) => e.homeCard).sort((a, b) => a.homeCard!.order - b.homeCard!.order),
    frise: [...formations].reverse(),
    courtes,
    recos,
  };
  return <AccueilView v={v} />;
}
