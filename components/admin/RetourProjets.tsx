"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { demanderRestauration, libelleRetour, lireOrigine } from "@/lib/retour-projets";
import { Icon } from "./icons";

// Bouton « Retour aux projets » des pages de modification (remplace le fil d'Ariane, 30 oct. 2026) :
// ramène à la liste telle qu'on l'avait laissée (recherche, filtres, tri, page et position).
export function RetourProjets() {
  const [origine, setOrigine] = useState<string | undefined>(undefined);
  // Lecture unique, au montage, du stockage de l'onglet : impossible pendant le rendu serveur, d'où l'effet.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOrigine(lireOrigine("admin")?.path), []);
  return (
    <Link className="adm-retour" href={origine ?? "/admin/projets"} onClick={() => demanderRestauration("admin")}>
      <Icon name="back" />
      {libelleRetour(origine?.split("?")[0] === "/admin" ? "/admin" : undefined)}
    </Link>
  );
}
