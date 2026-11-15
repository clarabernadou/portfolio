import type { Metadata } from "next";

// openGraph/twitter ne reprennent pas automatiquement title/description d'une
// page : sans ce bloc, toutes les pages gardaient le titre et la description
// de partage de la racine (RAPPORT-FIDELITE, écart 8).
// `chemin` donne l'adresse canonique de la page (référencement : une seule adresse par contenu).
// L'image de partage vient du fichier opengraph-image de chaque page (lib/og.tsx, 13 nov. 2026) :
// Next.js l'ajoute à og:image et twitter:image, avec son texte alternatif propre.

export function pageMetadata(title: string, description: string, chemin: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: chemin },
    openGraph: { title, description, url: chemin },
    twitter: { card: "summary_large_image", title, description },
  };
}
