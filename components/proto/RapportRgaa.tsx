"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import { Visionneuse } from "./Visionneuse";

// Rapport d'audit RGAA en PDF (/accessibilite, 20 nov. 2026) : ouvert dans la visionneuse du site, sans quitter
// la page ; la visionneuse garde le bouton « Ouvrir dans un nouvel onglet » pour l'imprimer ou le télécharger.
export function RapportRgaa({ src, libelle }: { src: string; libelle: string }) {
  const [ouvert, setOuvert] = useState<number | null>(null);
  return (
    <>
      <button type={"button"} onClick={() => setOuvert(0)} aria-haspopup={"dialog"} style={css(`padding: 10px 0; border: 0; background: none; font: inherit; font-weight: 700; color: var(--amethyste); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; text-align: left`)}>
        {libelle}
      </button>
      <Visionneuse id={"rapport-rgaa-fenetre"} elements={[{ titre: "Rapport d’audit RGAA", type: "pdf", src }]} index={ouvert} onIndex={setOuvert} noms={{ un: "Document", precedent: "Précédent", suivant: "Suivant" }} />
    </>
  );
}
