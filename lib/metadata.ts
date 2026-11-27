import type { Metadata } from "next";
import { normaliserTypo } from "./typographie";

// openGraph/twitter ne reprennent pas automatiquement title/description d'une
// page : sans ce bloc, toutes les pages gardaient le titre et la description
// de partage de la racine (RAPPORT-FIDELITE, écart 8).
// `chemin` donne l'adresse canonique de la page (référencement : une seule adresse par contenu).
// L'image de partage vient du fichier opengraph-image de chaque page (lib/og.tsx, 13 nov. 2026) :
// Next.js l'ajoute à og:image et twitter:image, avec son texte alternatif propre.

// Titres de page (27 nov. 2026) : 60 caractères au plus, suffixe « — Clara Bernadou » du modèle compris (app/layout.tsx).
export const SUFFIXE_TITRE = " — Clara Bernadou";
export const TITRE_MAX = 60;
/** Le premier titre candidat qui tient dans 60 caractères avec le suffixe, sinon le plus court. */
export function titreAuPlus60(...candidats: string[]): string {
  return candidats.find((c) => (c + SUFFIXE_TITRE).length <= TITRE_MAX) ?? [...candidats].sort((a, b) => a.length - b.length)[0];
}

export function pageMetadata(titre: string, texte: string, chemin: string): Metadata {
  // Typographie (lib/typographie.ts) : title, description, og et twitter.
  const title = normaliserTypo(titre);
  const description = normaliserTypo(texte);
  return {
    title,
    description,
    alternates: { canonical: chemin },
    openGraph: { title, description, url: chemin },
    twitter: { card: "summary_large_image", title, description },
  };
}
