// Retour depuis une fiche projet à l'endroit exact d'où l'on venait (demande de Clara, 29 oct. 2026) :
// la page (accueil, liste des projets…), les filtres de la liste, le nombre de projets affichés et
// la position dans la page. Même chose dans l'administration (30 oct. 2026), où les filtres, le tri
// et la page sont dans l'adresse de la liste. Tout reste dans sessionStorage (l'onglet en cours) : aucun cookie.

export type Origine = { path: string; y: number; type?: string; par?: string; limit?: number };
export type EtatListe = { type: string; par: string; limit: number };
// Le site public et l'administration ont chacun leur mémoire.
export type Espace = "site" | "admin";

const LISTE = "projets-liste";

// sessionStorage peut être indisponible (navigation privée stricte) : le site marche alors sans mémoire.
function lire<T>(cle: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(cle) ?? "null") as T | null;
  } catch {
    return null;
  }
}
function ecrire(cle: string, valeur: unknown) {
  try {
    sessionStorage.setItem(cle, JSON.stringify(valeur));
  } catch {}
}

export const espaceDe = (path: string): Espace => (path.startsWith("/admin/") || path === "/admin" ? "admin" : "site");
// Fiche publique (/projets/booki) ou page de modification (/admin/projets/booki, /admin/projets/nouveau).
export const estFiche = (path: string) => /^\/(admin\/)?projets\/[^/]+\/?$/.test(path);
export const lireOrigine = (e: Espace) => lire<Origine>(`projets-origine-${e}`);
export const ecrireOrigine = (e: Espace, o: Origine) => ecrire(`projets-origine-${e}`, o);
export const lireEtatListe = () => lire<EtatListe>(LISTE);
export const ecrireEtatListe = (etat: EtatListe) => ecrire(LISTE, etat);
export const demanderRestauration = (e: Espace) => ecrire(`projets-restaurer-${e}`, true);
export const restaurationDemandee = (e: Espace) => lire<boolean>(`projets-restaurer-${e}`) === true;
export function finirRestauration(e: Espace) {
  try {
    sessionStorage.removeItem(`projets-restaurer-${e}`);
  } catch {}
}

// Libellé du bouton retour de la fiche, selon la page d'origine.
export function libelleRetour(path: string | undefined): string {
  if (path === "/") return "Retour à l’accueil";
  if (path === "/cv") return "Retour au CV";
  if (path === "/ia") return "Retour à la page IA";
  if (path === "/admin") return "Retour au tableau de bord";
  return "Retour aux projets";
}
