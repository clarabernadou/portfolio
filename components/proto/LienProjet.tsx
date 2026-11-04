import Link from "next/link";
import type { ReactNode } from "react";
import { css } from "@/lib/css";

// Lien vers une fiche projet depuis une autre page (4 nov. 2026) : un projet pas encore publié
// (brouillon ou privé, en attente de validation) n'est jamais un lien, pour qu'aucun visiteur ne tombe
// sur une page vide. Il redevient un lien dès sa publication.
export const ETIQUETTE_VALIDATION = `align-self: flex-start; padding: 3px 9px; border-radius: 6px; background: #F3EFFF; color: #1A1033; font-size: 13px; font-weight: 700`;

/** Carte cliquable si le projet est publié ; sinon la même carte, inerte, avec l'étiquette « En cours de validation ». */
export function CarteProjet({ id, publics, style, suite, children }: { id: string; publics: string[]; style: string; suite: ReactNode; children: ReactNode }) {
  if (publics.includes(id))
    return (
      <Link href={`/projets/${id}`} style={css(style)}>
        {children}{" "}
        {suite}
      </Link>
    );
  return (
    <div style={css(style)}>
      {children}{" "}
      <span style={css(ETIQUETTE_VALIDATION)}>{"En cours de validation"}</span>
    </div>
  );
}

/** Nom d'un projet dans un texte : lien s'il est publié, sinon texte simple suivi de « (en cours de validation) ». */
export function NomProjet({ id, publics, children }: { id: string; publics: string[]; children: string }) {
  return publics.includes(id) ? <Link href={`/projets/${id}`}>{children}</Link> : <>{`${children} (en cours de validation)`}</>;
}
