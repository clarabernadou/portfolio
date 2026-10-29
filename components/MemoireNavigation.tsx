"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { demanderRestauration, ecrireOrigine, espaceDe, estFiche, finirRestauration, lireEtatListe, lireOrigine, restaurationDemandee } from "@/lib/retour-projets";

// Mémorise d'où l'on ouvre une fiche projet (site public ou administration), puis y ramène
// (bouton retour de la fiche ou bouton précédent du navigateur) à la même position
// (lib/retour-projets.ts). Placé après ScrollToTop : la page s'ouvre en haut, sauf lors d'un retour.
const ici = () => location.pathname + location.search;

export function MemoireNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    // Clic sur un lien vers une fiche, depuis une page qui n'est pas elle-même une fiche
    // (passer d'une fiche à la suivante garde la page d'origine).
    const clic = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.origin !== location.origin || !estFiche(a.pathname) || estFiche(location.pathname)) return;
      const espace = espaceDe(a.pathname);
      if (espaceDe(location.pathname) !== espace) return;
      const liste = location.pathname === "/projets" ? lireEtatListe() : null;
      ecrireOrigine(espace, { path: ici(), y: window.scrollY, ...(liste ?? {}) });
    };
    // Bouton précédent du navigateur : même retour que le bouton de la fiche.
    const precedent = () => {
      const espace = espaceDe(location.pathname);
      if (lireOrigine(espace)?.path === ici()) demanderRestauration(espace);
    };
    document.addEventListener("click", clic, true);
    window.addEventListener("popstate", precedent);
    return () => {
      document.removeEventListener("click", clic, true);
      window.removeEventListener("popstate", precedent);
    };
  }, []);

  useEffect(() => {
    const espace = espaceDe(pathname);
    if (!restaurationDemandee(espace)) return;
    const o = lireOrigine(espace);
    if (!o || o.path !== ici()) return finirRestauration(espace);
    // La liste rétablit d'abord ses filtres : on réessaie tant que la page n'est pas assez haute.
    let essais = 0;
    const descendre = () => {
      window.scrollTo({ top: o.y, left: 0, behavior: "instant" });
      if (Math.abs(window.scrollY - o.y) > 2 && essais++ < 20) setTimeout(descendre, 50);
      else finirRestauration(espace);
    };
    requestAnimationFrame(descendre);
  }, [pathname]);

  return null;
}
