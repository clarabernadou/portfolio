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

/** Rapport d'audit complet (PDF hébergé sur Vercel Blob, généré par scripts/rapport-rgaa.ts). */
export const RAPPORT_PDF = "https://dwadyuuedgcexv44.public.blob.vercel-storage.com/accessibilite/Rapport_audit_accessibilite_RGAA_Clara_Bernadou.pdf";

export const ECHANTILLON = [
  { label: "Accueil", href: "/" },
  { label: "Projets", href: "/projets" },
  { label: "Fiche projet : Repositionnement de Fruggr (films)", href: "/projets/repositionnement-fruggr" },
  { label: "Fiche projet : Équi-libre (livrables)", href: "/projets/equi-libre" },
  { label: "CV", href: "/cv" },
  { label: "IA", href: "/ia" },
  { label: "Mentions légales et confidentialité", href: "/mentions-legales" },
  { label: "Page introuvable (404)", href: "" },
];
