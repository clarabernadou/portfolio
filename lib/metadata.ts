import type { Metadata } from "next";

// openGraph/twitter ne reprennent pas automatiquement title/description d'une
// page : sans ce bloc, toutes les pages gardaient le titre et la description
// de partage de la racine (RAPPORT-FIDELITE, écart 8).
export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}
