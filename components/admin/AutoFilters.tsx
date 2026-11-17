"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Nombre de caractères à partir duquel la recherche se lance pendant la saisie.
const MIN_CARACTERES = 2;
// Pause après la dernière frappe avant de lancer la recherche.
const DELAI_MS = 300;

// Filtres de la liste des projets : chaque liste déroulante s'applique dès qu'elle
// change ; la recherche se lance seule pendant la saisie, dès 2 caractères (ou quand
// le champ est vidé), et toujours avec Entrée. L'adresse ne garde que les filtres
// utilisés. Sans JavaScript, Entrée envoie aussi le formulaire.
export function AutoFilters({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (minuteur.current) clearTimeout(minuteur.current);
  }, []);

  const appliquer = (form: HTMLFormElement, remplacer: boolean) => {
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(form)) if (typeof v === "string" && v.trim()) params.set(k, v.trim());
    const qs = params.toString();
    const url = qs ? `/admin/projets?${qs}` : "/admin/projets";
    // Pendant la saisie, l'adresse est remplacée : pas une entrée d'historique par lettre.
    if (remplacer) router.replace(url, { scroll: false });
    else router.push(url);
  };

  return (
    <form
      className="adm-filters"
      role="search"
      action="/admin/projets"
      onChange={(e) => e.target instanceof HTMLSelectElement && e.currentTarget.requestSubmit()}
      onInput={(e) => {
        const champ = e.target;
        if (!(champ instanceof HTMLInputElement) || champ.name !== "q") return;
        const form = e.currentTarget;
        if (minuteur.current) clearTimeout(minuteur.current);
        const n = champ.value.trim().length;
        if (n > 0 && n < MIN_CARACTERES) return;
        minuteur.current = setTimeout(() => appliquer(form, true), DELAI_MS);
      }}
      onSubmit={(e) => {
        e.preventDefault();
        if (minuteur.current) clearTimeout(minuteur.current);
        appliquer(e.currentTarget, false);
      }}
    >
      {children}
    </form>
  );
}
