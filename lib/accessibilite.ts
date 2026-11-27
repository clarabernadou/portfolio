import audit from "@/data/rgaa-audit.json";

// Audit RGAA du site public (grille des 106 critères : data/rgaa-audit.json).
// Source unique de la page « Accessibilité » et du rapport PDF (scripts/rapport-rgaa.mjs).

export type Statut = "C" | "NC" | "NA";
export type Critere = { n: string; theme: string; titre: string; statut: Statut; pages: string; constat: string };

export const criteres = audit.criteres as Critere[];
export const dateAudit = audit.date;
export const referentiel = audit.referentiel;

export const compte = (s: Statut) => criteres.filter((c) => c.statut === s).length;
const applicables = compte("C") + compte("NC");
/** Taux de conformité RGAA : critères conformes sur critères applicables, arrondi au dixième. */
export const taux = Math.round((1000 * compte("C")) / applicables) / 10;
export const nonConformes = criteres.filter((c) => c.statut === "NC");

// Résultat de l'audit dans les textes saisis en administration (CV, fiche « Ce portfolio ») : la balise
// {{audit-rgaa}} est remplacée à l'affichage, pour que les chiffres suivent la grille (4 nov. 2026).
export const BALISE_AUDIT = "{{audit-rgaa}}";
export const resultatAudit = `audit ${referentiel}, ${compte("C")} critères conformes sur ${applicables} applicables, soit ${String(taux).replace(".", ",")}\u00a0%, sur les ${criteres.length} critères`;
export const avecAudit = (texte: string) => texte.replaceAll(BALISE_AUDIT, resultatAudit);

/** Rapport d'audit complet (PDF hébergé sur Vercel Blob, généré par scripts/rapport-rgaa.ts). */
export const RAPPORT_PDF = "https://dwadyuuedgcexv44.public.blob.vercel-storage.com/accessibilite/Rapport_audit_accessibilite_RGAA_Clara_Bernadou.pdf";

export const ECHANTILLON = [
  { label: "Accueil", href: "/" },
  { label: "Projets", href: "/projets" },
  { label: "Fiche projet : WatchedThis (captures du site)", href: "/projets/watchedthis" },
  { label: "Fiche projet : Équi-libre (livrables)", href: "/projets/equi-libre" },
  { label: "CV", href: "/cv" },
  { label: "IA", href: "/ia" },
  { label: "Mentions légales et confidentialité", href: "/mentions-legales" },
  { label: "Page introuvable (404)", href: "" },
];

/**
 * Pages vérifiées affichées (27 nov. 2026) : seulement les pages publiques. Une fiche projet n'y figure que si le
 * projet est publié, la page IA que si elle est publiée ; une page non publique n'est jamais citée.
 */
export function echantillonPublic(publics: string[], iaPubliee: boolean) {
  return ECHANTILLON.filter((p) => (p.href === "/ia" ? iaPubliee : !p.href.startsWith("/projets/") || publics.includes(p.href.slice("/projets/".length))));
}
