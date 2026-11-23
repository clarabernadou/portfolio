import type { ProjectCapture } from "@/lib/types";

// Légende facultative d'une capture (demande de Clara, 23 nov. 2026) : affichée sous l'image de la fiche,
// dans un <figcaption>. Le texte alternatif reste obligatoire et distinct. Jamais de légende pour une image
// décorative.
export const LEGENDE_MAX = 160;

/** Légende à afficher, ou null (absente, vide, ou image décorative). */
export function legendeAffichee(c: Pick<ProjectCapture, "legende" | "decorative">): string | null {
  if (c.decorative) return null;
  const t = c.legende?.trim();
  return t ? t : null;
}

/** Message d'erreur si une légende dépasse la limite (n° de capture à partir de 1), sinon null. */
export function erreurLegende(captures: Pick<ProjectCapture, "legende" | "decorative">[]): string | null {
  const i = captures.findIndex((c) => (legendeAffichee(c)?.length ?? 0) > LEGENDE_MAX);
  return i < 0 ? null : `La légende de la capture ${i + 1} dépasse ${LEGENDE_MAX} caractères : raccourcis-la.`;
}
