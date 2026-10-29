"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { demanderRestauration, ecrireOrigine, estFiche, finirRestauration, lireEtatListe, lireOrigine, restaurationDemandee } from "@/lib/retour-projets";

// Mémorise d'où l'on ouvre une fiche projet, puis y ramène (bouton retour de la fiche ou
// bouton précédent du navigateur) à la même position (lib/retour-projets.ts). Placé après
// ScrollToTop : la page s'ouvre en haut, sauf lors d'un retour.
export function MemoireNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    // Clic sur un lien vers une fiche, depuis une page qui n'est pas elle-même une fiche
    // (passer d'une fiche à la suivante garde la page d'origine).
    const clic = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.origin !== location.origin || !estFiche(a.pathname) || estFiche(location.pathname)) return;
      const liste = location.pathname === "/projets" ? lireEtatListe() : null;
      ecrireOrigine({ path: location.pathname, y: window.scrollY, ...(liste ?? {}) });
    };
    // Bouton précédent du navigateur : même retour que le bouton de la fiche.
    const precedent = () => {
      if (lireOrigine()?.path === location.pathname) demanderRestauration();
    };
    document.addEventListener("click", clic, true);
    window.addEventListener("popstate", precedent);
    return () => {
      document.removeEventListener("click", clic, true);
      window.removeEventListener("popstate", precedent);
    };
  }, []);

  useEffect(() => {
    if (!restaurationDemandee()) return;
    const o = lireOrigine();
    if (!o || o.path !== pathname) return finirRestauration();
    // La liste rétablit d'abord ses filtres : on réessaie tant que la page n'est pas assez haute.
    let essais = 0;
    const descendre = () => {
      window.scrollTo({ top: o.y, left: 0, behavior: "instant" });
      if (Math.abs(window.scrollY - o.y) > 2 && essais++ < 20) setTimeout(descendre, 50);
      else finirRestauration();
    };
    requestAnimationFrame(descendre);
  }, [pathname]);

  return null;
}
