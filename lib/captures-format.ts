// Format d'affichage d'une capture du site selon son ratio (demande de Clara, 24 nov. 2026). Les bandeaux très
// larges et bas étaient recadrés sur un petit morceau, agrandi et flou. Sans dépendance serveur.
// - normal (ratio entre 0,6 et 2,2) : case de la grille, recadrée comme avant ;
// - large (plus de 2,2) : image entière, sur toute la largeur de la grille, à sa hauteur naturelle ;
// - haute (moins de 0,6) : image entière, sur 2 lignes de la grille (hauteur plafonnée).
// Jamais agrandie au-delà de sa taille native. Sans dimensions connues, une capture reste « normal ».

export type FormatCapture = "normal" | "large" | "haute";

export const RATIO_LARGE = 2.2;
export const RATIO_HAUTE = 0.6;

export function formatCapture(c: { largeur?: number; hauteur?: number }): FormatCapture {
  if (!c.largeur || !c.hauteur) return "normal";
  const ratio = c.largeur / c.hauteur;
  if (ratio > RATIO_LARGE) return "large";
  if (ratio < RATIO_HAUTE) return "haute";
  return "normal";
}

/**
 * Lignes de la grille occupées par des cases normales ou hautes, en suivant le placement automatique de CSS
 * Grid sans « dense » (l'ordre des captures est conservé, donc celui de la tabulation aussi). Une capture
 * large occupe une ligne entière, qui ne compte pas : elle est basse et toujours affichée en entier.
 */
export function lignesOccupees(formats: FormatCapture[], colonnes: number): number {
  const prises = new Set<string>();
  const lignes = new Set<number>();
  const libre = (l: number, c: number) => !prises.has(`${l},${c}`);
  let l = 0;
  let c = 0;
  for (const f of formats) {
    if (f === "large") {
      if (c > 0) l++;
      while (!Array.from({ length: colonnes }, (_, k) => libre(l, k)).every(Boolean)) l++;
      for (let k = 0; k < colonnes; k++) prises.add(`${l},${k}`);
      l++;
      c = 0;
      continue;
    }
    const h = f === "haute" ? 2 : 1;
    for (;;) {
      if (c >= colonnes) {
        l++;
        c = 0;
      }
      if (libre(l, c) && (h === 1 || libre(l + 1, c))) break;
      c++;
    }
    for (let k = 0; k < h; k++) {
      prises.add(`${l + k},${c}`);
      lignes.add(l + k);
    }
    c++;
  }
  return lignes.size;
}

/**
 * Nombre de captures montrées avant le collage « +N autres captures » : 2 lignes au plus (au moins 4 cases
 * en une colonne). Tout est montré si tout tient, ou si le collage ne regrouperait qu'une capture.
 * `colonnes` null (avant la première mesure, rendu serveur) : tout est montré.
 */
export function capturesMontrees(formats: FormatCapture[], colonnes: number | null, lignesMax = 2): number {
  const n = formats.length;
  if (!colonnes) return n;
  const limite = Math.max(lignesMax, Math.ceil(4 / colonnes));
  if (lignesOccupees(formats, colonnes) <= limite) return n;
  for (let k = n - 2; k > 0; k--) if (lignesOccupees([...formats.slice(0, k), "normal"], colonnes) <= limite) return k;
  return 0;
}
