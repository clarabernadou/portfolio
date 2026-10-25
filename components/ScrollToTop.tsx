"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// Chaque nouvelle page s'ouvre en haut (demande de Clara), site public et administration.
// Seul un lien vers une ancre (#…) garde sa position. Les filtres, qui ne changent que
// les paramètres de l'adresse, ne font pas remonter la page.
export function ScrollToTop() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
