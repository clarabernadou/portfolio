import type { Metadata } from "next";

// openGraph/twitter ne reprennent pas automatiquement title/description d'une
// page : sans ce bloc, toutes les pages gardaient le titre et la description
// de partage de la racine (RAPPORT-FIDELITE, écart 8).
// `chemin` donne l'adresse canonique de la page (référencement : une seule adresse par contenu).
// L'image de partage (app/opengraph-image.tsx) est redonnée ici : un bloc openGraph de page
// remplace celui de la racine.
export const IMAGE_PARTAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Clara Bernadou, développeuse front-end & UI/UX designer" };

export function pageMetadata(title: string, description: string, chemin: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: chemin },
    openGraph: { title, description, url: chemin, images: [IMAGE_PARTAGE] },
    twitter: { card: "summary_large_image", title, description, images: [IMAGE_PARTAGE.url] },
  };
}
