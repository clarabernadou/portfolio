"use client";

import { useRouter } from "next/navigation";

// Filtres de la liste des projets : chaque liste déroulante s'applique dès qu'elle
// change ; la recherche s'applique avec Entrée. L'adresse ne garde que les filtres
// utilisés. Sans JavaScript, Entrée envoie aussi le formulaire.
export function AutoFilters({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <form
      className="adm-filters"
      role="search"
      action="/admin/projets"
      onChange={(e) => e.target instanceof HTMLSelectElement && e.currentTarget.requestSubmit()}
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        for (const [k, v] of new FormData(e.currentTarget)) if (typeof v === "string" && v.trim()) params.set(k, v.trim());
        const qs = params.toString();
        router.push(qs ? `/admin/projets?${qs}` : "/admin/projets");
      }}
    >
      {children}
    </form>
  );
}
