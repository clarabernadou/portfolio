// Bandeau « en bref » de la fiche projet (demande de Clara, 24 nov. 2026) : Rôle, Équipe et Durée, sous l'en-tête, la
// première chose qu'un recruteur lit. 3 colonnes facultatives de Project, saisies dans l'administration (section
// Informations). Un champ vide n'apparaît pas. Depuis le 25 novembre 2026, le bandeau est sur toutes les fiches : Type,
// Cadre et Date y passent depuis l'en-tête (faitsFiche).
// Sans dépendance serveur.

export interface EnBref {
  role: string;
  equipe: string;
  duree: string;
}
export type CleEnBref = keyof EnBref;

export const EN_BREF_VIDE: EnBref = { role: "", equipe: "", duree: "" };

export const CHAMPS_EN_BREF: { cle: CleEnBref; libelle: string; exemple: string; aide: string; max: number }[] = [
  { cle: "role", libelle: "Rôle", exemple: "Développeuse front-end", aide: "Ton rôle sur ce projet, en quelques mots.", max: 80 },
  { cle: "equipe", libelle: "Équipe", exemple: "En solo", aide: "Seule, ou avec qui (« Avec un UI designer », « Équipe produit de 6 personnes »).", max: 80 },
  { cle: "duree", libelle: "Durée", exemple: "6 semaines", aide: "Durée du projet, en chiffres (« 6 semaines », « 3 mois »).", max: 40 },
];

/** Lit les 3 colonnes (absentes ou nulles). */
export function lireEnBref(r: Partial<Record<CleEnBref, string | null>>): EnBref {
  return { role: r.role ?? "", equipe: r.equipe ?? "", duree: r.duree ?? "" };
}

/** Colonnes à enregistrer : texte nettoyé, null pour un champ vide ; erreur au-delà de la limite. */
export function colonnesEnBref(e: Partial<EnBref> | null | undefined): { ok: true; data: Record<CleEnBref, string | null> } | { ok: false; error: string } {
  const data = {} as Record<CleEnBref, string | null>;
  for (const c of CHAMPS_EN_BREF) {
    const v = (e?.[c.cle] ?? "").replace(/\s+/g, " ").trim();
    if (v.length > c.max) return { ok: false, error: `« ${c.libelle} » dépasse ${c.max} caractères (${v.length}).` };
    data[c.cle] = v || null;
  }
  return { ok: true, data };
}

/**
 * Bandeau de la fiche, sur toutes les fiches (retour de Clara du 25 novembre 2026) : Type, Cadre et Date, qui
 * quittent l'en-tête (plus de redite), puis Rôle, Équipe et Durée quand ils sont remplis. Une valeur vide n'apparaît pas.
 */
export type FormationFiche = { intitule: string; nomOfficiel?: string; mode?: string };

/** Formation dont le cadre du projet est l'intitulé (« UX Design », « Développeur Web »…), ou null. */
export const formationDuCadre = (parcours: string | null | undefined, formations: readonly FormationFiche[] = []) =>
  formations.find((f) => f.intitule.trim() === (parcours ?? "").trim()) ?? null;

/** « Formation OpenClassrooms · UX Designer / Product Designer » (nom officiel sans « d'OpenClassrooms », 27 nov. 2026). */
export const cadreFormation = (f: FormationFiche) => `Formation OpenClassrooms · ${(f.nomOfficiel || f.intitule).replace(/\s+d['’]OpenClassrooms\s*$/i, "").trim()}`;

/** Aide sur la durée d'un projet de formation, selon le mode (27 nov. 2026). */
export const aideDuree = (f: FormationFiche) =>
  /alternance/i.test(f.mode ?? "") ? "35 heures de formation par mois, en alternance" : /autonomie|plein temps/i.test(f.mode ?? "") ? "35 heures par semaine, à plein temps" : undefined;

export function faitsFiche(
  p: { types?: readonly string[]; parcours?: string | null; date?: string | null },
  e: Partial<EnBref> | null | undefined,
  formations: readonly FormationFiche[] = [],
): { libelle: string; valeur: string; aide?: string }[] {
  const types = (p.types ?? []).map((t) => t.trim()).filter(Boolean);
  const formation = formationDuCadre(p.parcours, formations);
  return [
    { libelle: types.length > 1 ? "Types" : "Type", valeur: types.join(", ") },
    { libelle: "Cadre", valeur: formation ? cadreFormation(formation) : (p.parcours ?? "").trim() },
    { libelle: "Date", valeur: (p.date ?? "").trim() },
    ...faitsEnBref(e).map((f) => (f.libelle === "Durée" && formation && aideDuree(formation) ? { ...f, aide: aideDuree(formation) } : f)),
  ].filter((f) => f.valeur);
}

/** Lignes du bandeau, dans l'ordre Rôle, Équipe, Durée : seulement les champs remplis. */
export function faitsEnBref(e: Partial<EnBref> | null | undefined): { libelle: string; valeur: string }[] {
  return CHAMPS_EN_BREF.map((c) => ({ libelle: c.libelle, valeur: (e?.[c.cle] ?? "").trim() })).filter((f) => f.valeur);
}
