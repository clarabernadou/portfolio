// Statut d'une fiche après enregistrement depuis l'administration (demande de Clara, 23 nov. 2026).
// Publié = status "published" + visible ; Privé = "published" + visible false ; Brouillon = "draft".
// « Enregistrer le brouillon » ne fait plus passer une fiche Privé en Brouillon : elle reste Privé avec
// les deux boutons. Le message affiché reflète le statut réellement enregistré. Sans dépendance serveur.

export type StatutFiche = "publie" | "prive" | "brouillon";

/**
 * Valeur de `status` à enregistrer. Une fiche existante déjà Privé (non brouillon) et toujours masquée dans
 * le formulaire garde « published » même avec « Enregistrer le brouillon ».
 */
export function statusAEnregistrer(demande: "published" | "draft", visible: boolean, statusExistant: string | null): "published" | "draft" {
  if (demande === "draft" && !visible && statusExistant !== null && statusExistant !== "draft") return "published";
  return demande;
}

export const statutFiche = (status: string, visible: boolean): StatutFiche => (status === "draft" ? "brouillon" : visible ? "publie" : "prive");

/** Message affiché après l'enregistrement, selon le statut réel. */
export function messageEnregistrement(statut: StatutFiche): string {
  if (statut === "publie") return "Projet publié.";
  if (statut === "prive") return "Fiche enregistrée, statut : Privé";
  return "Brouillon enregistré.";
}
