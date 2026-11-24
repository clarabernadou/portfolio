// Disposition du contexte et de la colonne de droite (avancement, compétences mises en pratique) sur la fiche projet
// (24 nov. 2026). Côte à côte, les deux cartes ont la même hauteur : la colonne de droite n'y va que si elle est au plus
// aussi haute que le contexte, sinon c'est la carte blanche du contexte qui garderait un vide. Dans ce cas, elle passe en
// pleine largeur sous le contexte (listes en 2 colonnes). Le choix est fait au rendu, sans mesure dans le navigateur :
// les hauteurs sont estimées à 1280 px de large d'après la longueur des textes, calibrées sur les fiches en ligne.
// Sans dépendance serveur.

// Mesures relevées à 1280 px : contexte 705 px de texte utile (17 px, interligne 28 px), colonne de droite 327 px.
const CTX = { cadre: 91, signesParLigne: 84, ligne: 28, ecart: 10, ecartListe: 4 };
const COMPETENCES = { cadre: 122, signesParLigne: 42, ligne: 24, ecart: 10 };
const AVANCEMENT = { cadre: 87, signesParLigne: 25, ligne: 22, minimum: 28, marge: 29 };
const ECART_SECTIONS = 20;
/** Écart toléré (px) : en deçà, un léger vide en bas du contexte passe inaperçu. */
const TOLERANCE = 24;
/** Au-delà de 6 éléments, une liste passe toujours en pleine largeur. */
export const LONGUE_LISTE = 6;

const brut = (t: string) => t.replace(/\*\*|\*/g, "").trim();
const lignes = (texte: string, parLigne: number) => Math.max(1, Math.ceil(brut(texte).length / parLigne));

/** Hauteur estimée de la carte Contexte (texte mis en forme : paragraphes, puces « - »). */
export function hauteurContexte(ctx: string): number {
  const blocs = ctx.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!blocs.length) return CTX.cadre;
  let h = 0;
  blocs.forEach((b, i) => {
    const puce = /^[-•]\s+/.test(b);
    h += lignes(b.replace(/^[-•]\s+/, ""), puce ? CTX.signesParLigne - 4 : CTX.signesParLigne) * CTX.ligne;
    if (i > 0) h += puce && /^[-•]\s+/.test(blocs[i - 1]) ? CTX.ecartListe : CTX.ecart;
  });
  return CTX.cadre + h;
}

export function hauteurCompetences(items: string[]): number {
  if (!items.length) return 0;
  return COMPETENCES.cadre + items.reduce((s, k) => s + lignes(k, COMPETENCES.signesParLigne) * COMPETENCES.ligne, 0) + COMPETENCES.ecart * (items.length - 1);
}

export function hauteurAvancement(etapes: string[]): number {
  if (!etapes.length) return 0;
  return AVANCEMENT.cadre + etapes.reduce((s, e) => s + AVANCEMENT.marge + Math.max(AVANCEMENT.minimum, lignes(e, AVANCEMENT.signesParLigne) * AVANCEMENT.ligne), 0);
}

/**
 * Colonne de droite à côté du contexte ? Oui s'il y a un contexte, aucune liste de plus de 6 éléments, et une hauteur
 * estimée au plus égale à celle du contexte (à la tolérance près). Sinon, pleine largeur sous le contexte.
 */
export function coteAuContexte({ ctx, etapes, competences }: { ctx: string; etapes: string[]; competences: string[] }): boolean {
  if (!ctx.trim() || (!etapes.length && !competences.length)) return false;
  if (etapes.length > LONGUE_LISTE || competences.length > LONGUE_LISTE) return false;
  const cote = hauteurAvancement(etapes) + hauteurCompetences(competences) + (etapes.length && competences.length ? ECART_SECTIONS : 0);
  return cote <= hauteurContexte(ctx) + TOLERANCE;
}
