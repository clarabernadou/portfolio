// Retour depuis une fiche projet à l'endroit exact d'où l'on venait (demande de Clara, 29 oct. 2026) :
// la page (accueil, liste des projets…), les filtres de la liste, le nombre de projets affichés et
// la position dans la page. Tout reste dans sessionStorage (l'onglet en cours) : aucun cookie.

export type Origine = { path: string; y: number; type?: string; par?: string; limit?: number };
export type EtatListe = { type: string; par: string; limit: number };

const ORIGINE = "projets-origine";
const LISTE = "projets-liste";
const RESTAURER = "projets-restaurer";

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

export const estFiche = (path: string) => /^\/projets\/[^/]+\/?$/.test(path);
export const lireOrigine = () => lire<Origine>(ORIGINE);
export const ecrireOrigine = (o: Origine) => ecrire(ORIGINE, o);
export const lireEtatListe = () => lire<EtatListe>(LISTE);
export const ecrireEtatListe = (e: EtatListe) => ecrire(LISTE, e);
export const demanderRestauration = () => ecrire(RESTAURER, true);
export const restaurationDemandee = () => lire<boolean>(RESTAURER) === true;
export function finirRestauration() {
  try {
    sessionStorage.removeItem(RESTAURER);
  } catch {}
}

// Libellé du bouton retour de la fiche, selon la page d'origine.
export function libelleRetour(path: string | undefined): string {
  if (path === "/") return "Retour à l’accueil";
  if (path === "/cv") return "Retour au CV";
  if (path === "/ia") return "Retour à la page IA";
  return "Retour aux projets";
}
