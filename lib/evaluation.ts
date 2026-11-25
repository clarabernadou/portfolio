// Retour de l'évaluateur d'un projet (demande de Clara, 23 nov. 2026) : l'évaluation de soutenance
// OpenClassrooms, reproduite mot pour mot (25 nov. 2026 : aucune reformulation). Bloc distinct du retour d'expérience (lib/retour.ts), qui ne change pas.
// Saisi dans l'administration (4 colonnes nullables de Project), affiché sur la fiche publique sous le
// retour d'expérience dès qu'un champ est rempli. Sans dépendance serveur.

export interface Evaluation {
  mois: string;
  pointsForts: string;
  axes: string;
  remarque: string;
}
export type CleEvaluation = keyof Evaluation;

export const EVALUATION_VIDE: Evaluation = { mois: "", pointsForts: "", axes: "", remarque: "" };

export const EVALUATION_SOURCE = "Évaluation de soutenance OpenClassrooms, reproduite telle quelle.";

export const CHAMPS_EVALUATION: {
  cle: CleEvaluation;
  colonne: "evaluationMois" | "evaluationPointsForts" | "evaluationAxes" | "evaluationRemarque";
  libelle: string;
  titre: string;
  aide: string;
  max: number;
}[] = [
  { cle: "mois", colonne: "evaluationMois", libelle: "Mois et année de soutenance", titre: "Soutenance", aide: "Mois et année, par exemple « mai 2025 », ou la date précise ci-dessous.", max: 40 },
  { cle: "pointsForts", colonne: "evaluationPointsForts", libelle: "Points forts", titre: "Points forts", aide: "Recopie le texte de l’évaluateur mot pour mot. Un point par ligne : chaque ligne devient un élément de liste.", max: 600 },
  { cle: "axes", colonne: "evaluationAxes", libelle: "Axes d’amélioration (facultatif)", titre: "Axes d’amélioration", aide: "Recopie le texte de l’évaluateur mot pour mot. Un axe par ligne : chaque ligne devient un élément de liste.", max: 600 },
  { cle: "remarque", colonne: "evaluationRemarque", libelle: "Remarque sur la soutenance (facultatif)", titre: "Remarque sur la soutenance", aide: "Recopie le texte de l’évaluateur mot pour mot.", max: 400 },
];

type Colonnes = Partial<Record<(typeof CHAMPS_EVALUATION)[number]["colonne"], string | null>>;

/** Lit les 4 colonnes (absentes ou nulles) en une évaluation complète. */
export function lireEvaluation(r: Colonnes): Evaluation {
  return Object.fromEntries(CHAMPS_EVALUATION.map((c) => [c.cle, typeof r[c.colonne] === "string" ? r[c.colonne] : ""])) as unknown as Evaluation;
}

/** Évaluation à afficher (champs nettoyés), ou null si aucun champ n'est rempli : pas de bloc, pas de titre orphelin. */
export function evaluationAffichee(e: Partial<Evaluation> | null | undefined): Evaluation | null {
  if (!e) return null;
  const propre = Object.fromEntries(CHAMPS_EVALUATION.map((c) => [c.cle, (e[c.cle] ?? "").trim()])) as unknown as Evaluation;
  return CHAMPS_EVALUATION.some((c) => propre[c.cle]) ? propre : null;
}

// Date de soutenance (25 nov. 2026) : la colonne « evaluationMois » garde soit un mois et une année en texte
// (« octobre 2026 », comme avant), soit une date précise au format AAAA-MM-JJ, saisie dans le champ date de l'administration.
const DATE_PRECISE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Date précise (AAAA-MM-JJ) valide, ou null. */
export function datePrecise(valeur: string): { jour: number; mois: number; annee: number } | null {
  const m = DATE_PRECISE.exec(valeur.trim());
  if (!m) return null;
  const [annee, mois, jour] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(annee, mois - 1, jour));
  return d.getUTCMonth() === mois - 1 && d.getUTCDate() === jour ? { jour, mois, annee } : null;
}

/** « octobre 2026 » d'une date précise, ou le texte tel quel. */
export const moisDeSoutenance = (valeur: string) => {
  const d = datePrecise(valeur);
  return d ? `${MOIS[d.mois - 1]} ${d.annee}` : valeur.trim();
};

/** « Soutenance réalisée le 20 octobre 2026 » ou « Soutenance réalisée en octobre 2026 ». */
export function ligneSoutenance(valeur: string): string {
  const d = datePrecise(valeur);
  if (d) return `Soutenance réalisée le ${d.jour === 1 ? "1er" : d.jour} ${MOIS[d.mois - 1]} ${d.annee}`;
  return `Soutenance réalisée en ${valeur.trim()}`;
}

/** Lignes non vides d'un champ : une ligne = un élément de liste (puce « - » ou « • » de tête retirée). */
export const lignes = (texte: string) =>
  texte
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•]\s+/, "").trim())
    .filter(Boolean);

/** Colonnes à enregistrer : texte nettoyé, null pour un champ vide. Erreur si un champ dépasse sa limite. */
export function colonnesEvaluation(e: Partial<Evaluation> | null | undefined): { ok: true; data: Required<Colonnes> } | { ok: false; error: string } {
  const data = {} as Required<Colonnes>;
  for (const c of CHAMPS_EVALUATION) {
    const v = (e?.[c.cle] ?? "").trim();
    if (v.length > c.max) return { ok: false, error: `Retour de l’évaluateur : « ${c.titre} » dépasse ${c.max} caractères (${v.length}).` };
    data[c.colonne] = v || null;
  }
  return { ok: true, data };
}
