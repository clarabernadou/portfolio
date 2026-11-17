// Sous-catégories des captures d'un projet (17 nov. 2026) : une simple étiquette facultative
// par capture (« groupe »), qui permet de filtrer la galerie de la fiche projet.
// Les filtres n'apparaissent qu'à partir de 2 groupes nommés : sans groupe, ou avec un seul,
// la galerie reste identique. Les captures sans groupe vont alors dans « Autres ».

/** Libellé du filtre des captures sans groupe. */
export const LIBELLE_AUTRES = "Autres";
/** Paramètre d'adresse du filtre actif (/projets/x?captures=module-budget). */
export const PARAM_FILTRE = "captures";

/** Espaces en trop retirés ; une valeur vide ou absente donne "". */
export function normaliserGroupe(groupe: string | null | undefined): string {
  return (groupe ?? "").replace(/\s+/g, " ").trim();
}

/** Clé de comparaison : deux groupes de même clé sont le même groupe (casse et accents ignorés). */
export function cleGroupe(groupe: string | null | undefined): string {
  return normaliserGroupe(groupe)
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Valeur du paramètre d'adresse pour un groupe : minuscules, sans accents, mots reliés par « - ». */
export function slugGroupe(groupe: string): string {
  return cleGroupe(groupe)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Harmonise les groupes d'une liste de captures : espaces normalisés, et une seule écriture
 * par groupe (celle de sa première apparition). Un groupe vide est retiré de la capture,
 * pour que les captures sans groupe restent identiques en base.
 */
export function harmoniserGroupes<T extends { groupe?: string }>(captures: T[]): T[] {
  const ecriture = new Map<string, string>();
  return captures.map((c) => {
    const g = normaliserGroupe(c.groupe);
    const copie = { ...c };
    if (!g) {
      delete copie.groupe;
      return copie;
    }
    const cle = cleGroupe(g);
    if (!ecriture.has(cle)) ecriture.set(cle, g);
    copie.groupe = ecriture.get(cle)!;
    return copie;
  });
}

/** Groupes distincts d'un projet, dans l'ordre de première apparition (suggestions de l'administration). */
export function groupesDistincts(captures: { groupe?: string }[]): string[] {
  const vus = new Map<string, string>();
  for (const c of captures) {
    const g = normaliserGroupe(c.groupe);
    if (g && !vus.has(cleGroupe(g))) vus.set(cleGroupe(g), g);
  }
  return [...vus.values()];
}

export interface FiltreCaptures {
  /** Valeur du paramètre d'adresse. */
  slug: string;
  libelle: string;
  /** Positions des captures du filtre dans la liste d'origine (ordre manuel conservé). */
  indices: number[];
}

/**
 * Filtres de la galerie : null quand la galerie ne doit pas en avoir (moins de 2 groupes nommés).
 * Sinon, les groupes dans l'ordre de première apparition, puis « Autres » si des captures n'ont pas de groupe.
 */
export function filtresCaptures(captures: { groupe?: string }[]): FiltreCaptures[] | null {
  const groupes = new Map<string, FiltreCaptures>();
  const autres: number[] = [];
  captures.forEach((c, i) => {
    const g = normaliserGroupe(c.groupe);
    if (!g) {
      autres.push(i);
      return;
    }
    const cle = cleGroupe(g);
    const f = groupes.get(cle);
    if (f) f.indices.push(i);
    else groupes.set(cle, { slug: slugGroupe(g) || cle, libelle: g, indices: [i] });
  });
  if (groupes.size < 2) return null;
  const liste = [...groupes.values()];
  if (autres.length) {
    // Un groupe nommé « Autres » par Clara reçoit les captures sans groupe (même filtre, même adresse).
    const homonyme = liste.find((f) => cleGroupe(f.libelle) === cleGroupe(LIBELLE_AUTRES));
    if (homonyme) homonyme.indices = [...homonyme.indices, ...autres].sort((a, b) => a - b);
    else liste.push({ slug: slugGroupe(LIBELLE_AUTRES), libelle: LIBELLE_AUTRES, indices: autres });
  }
  // Deux libellés différents peuvent donner la même adresse (« UI/UX » et « UI UX ») : suffixe -2, -3…
  const pris = new Set<string>();
  for (const f of liste) {
    let s = f.slug || "groupe";
    for (let k = 2; pris.has(s); k++) s = `${f.slug || "groupe"}-${k}`;
    f.slug = s;
    pris.add(s);
  }
  return liste;
}

/** Filtre désigné par l'adresse ; null (« Tout ») pour une valeur absente ou inconnue. */
export function filtreDepuisParam(filtres: FiltreCaptures[] | null, valeur: string | null | undefined): FiltreCaptures | null {
  if (!filtres || !valeur) return null;
  return filtres.find((f) => f.slug === valeur) ?? null;
}
