// Bandeau « en bref » de la fiche projet (demande de Clara, 24 nov. 2026) : Cadre, Rôle, Équipe et Durée, sous l'en-tête,
// la première chose qu'un recruteur lit. Le cadre est le champ existant (parcours) ; rôle, équipe et durée sont 3 colonnes
// facultatives de Project, saisies dans l'administration (section Informations). Un champ vide n'apparaît pas.
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

/** Lignes du bandeau, dans l'ordre : Cadre, puis les champs remplis. */
export function faitsEnBref(cadre: string, e: Partial<EnBref> | null | undefined): { libelle: string; valeur: string }[] {
  const faits = [{ libelle: "Cadre", valeur: cadre.trim() }];
  for (const c of CHAMPS_EN_BREF) faits.push({ libelle: c.libelle, valeur: (e?.[c.cle] ?? "").trim() });
  return faits.filter((f) => f.valeur);
}
