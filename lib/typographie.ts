// Typographie française du site (demande de Clara, 27 nov. 2026). Une seule fonction, appelée à l'affichage
// (lib/data.ts : toutes les données lues en base) et à l'enregistrement (lib/db.ts : extension Prisma), et par le
// script de migration (scripts/maj-typographie.ts). Sans dépendance serveur.
// - apostrophe ’ entre deux lettres ;
// - guillemets « texte » avec espaces insécables à l'intérieur (au lieu de "…", “…”, ‘…’) ;
// - espace fine insécable avant ; ? ! : % € ; espace insécable entre un nombre et son unité (35 h, 2 Mo) ;
// - points de suspension … ;
// - tiret d'incise ou de plage – (demi-cadratin) avec espaces, au lieu de « - » isolé entre deux espaces ;
// - séparateur « · » au lieu de « | » entre deux espaces.
// Jamais touchés : adresses, identifiants, noms de fichiers, e-mails (clés ignorées et valeurs reconnues), segments
// entre accents graves (code), puces Markdown « - » en début de ligne et marques **gras** / *italique*.

const FINE = "\u202F";
const INSECABLE = "\u00A0";

/** Clés dont la valeur n'est jamais du texte affiché. */
const CLES_IGNOREES = new Set([
  "id", "slug", "href", "url", "src", "pdf", "github", "figma", "site", "email", "linkedin", "telephone", "youtubeId",
  "image", "photoUrl", "key", "lien", "fileId", "fileName", "entrepriseHref", "entrepriseParentHref", "status",
  "kind", "lang", "origin", "fieldMeta", "computed", "icone", "icon", "couleur", "mode_technique", "data",
]);

const ressembleAUneAdresse = (s: string) => /^(https?:|mailto:|tel:|\/|#|data:)/i.test(s.trim()) || /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(s.trim()) || /^[\w./-]+\.(pdf|png|jpe?g|webp|gif|svg|avif|mp4|json|md|docx?|pptx?|xlsx?|csv|zip)$/i.test(s.trim());

function normaliserSegment(t: string): string {
  return (
    t
      // Points de suspension.
      .replace(/\.\.\./g, "…")
      // Guillemets : "…", “…”, ‘…’ (pas l'apostrophe ’ dans un mot) → « … ».
      .replace(/"([^"\n]+?)"/g, (_, x: string) => `«${INSECABLE}${x.trim()}${INSECABLE}»`)
      .replace(/“([^”\n]+?)”/g, (_, x: string) => `«${INSECABLE}${x.trim()}${INSECABLE}»`)
      .replace(/(^|[\s(])‘([^’\n]+?)’(?=$|[\s).,;:!?])/g, (_, a: string, x: string) => `${a}«${INSECABLE}${x.trim()}${INSECABLE}»`)
      // Espaces insécables à l'intérieur des guillemets français.
      .replace(/«[ \u00A0\u202F]*/g, `«${INSECABLE}`)
      .replace(/[ \u00A0\u202F]*»/g, `${INSECABLE}»`)
      // Apostrophe entre deux lettres, y compris de part et d'autre d'une marque de gras ou d'italique
      // (« d'**auditer** », 28 nov. 2026).
      .replace(/(\p{L}[*_]*)'(?=[*_]*\p{L})/gu, "$1’")
      // Tiret isolé entre deux espaces → demi-cadratin (jamais une puce en début de ligne, jamais un mot composé).
      .replace(/(\S) +- +(?=\S)/g, "$1 – ")
      // Séparateur « | » entre deux espaces → « · ».
      .replace(/(\S) +\| +(?=\S)/g, "$1 · ")
      // Pourcentage et euro après un nombre.
      .replace(/(\d)[ \u00A0\u202F]?%/g, `$1${FINE}%`)
      .replace(/(\d)[ \u00A0\u202F]?€/g, `$1${FINE}€`)
      // Espace fine insécable avant ; ? ! (ajoutée si absente après une lettre ou un chiffre).
      .replace(/([\p{L}\p{N})»’%€])[ \u00A0\u202F]?([;?!])(?=$|[\s»)\]])/gu, `$1${FINE}$2`)
      // Deux-points : seulement une espace déjà présente (jamais dans « 10:30 » ni une adresse).
      .replace(/[ \u00A0]+:(?=$|\s)/g, `${FINE}:`)
      // Nombre et unité.
      .replace(/(\d) (h|min|Mo|Go|ko|Ko|px)(?![\p{L}\p{N}])/gu, `$1${INSECABLE}$2`)
  );
}

/** Texte normalisé ; les segments entre accents graves (code) restent tels quels. */
export function normaliserTypo(texte: string): string {
  if (!texte || ressembleAUneAdresse(texte)) return texte;
  return texte
    .split(/(`[^`]*`)/)
    .map((s, i) => (i % 2 ? s : normaliserSegment(s)))
    .join("");
}

/** Normalise toutes les chaînes d'une valeur (objet, tableau), sauf les clés ignorées. Renvoie une copie. */
export function normaliserTypoProfond<T>(valeur: T, cle?: string): T {
  if (cle && CLES_IGNOREES.has(cle)) return valeur;
  if (typeof valeur === "string") return normaliserTypo(valeur) as T;
  if (Array.isArray(valeur)) return valeur.map((v) => normaliserTypoProfond(v)) as T;
  if (valeur && typeof valeur === "object" && !(valeur instanceof Date) && !ArrayBuffer.isView(valeur)) {
    return Object.fromEntries(Object.entries(valeur as Record<string, unknown>).map(([k, v]) => [k, normaliserTypoProfond(v, k)])) as T;
  }
  return valeur;
}
