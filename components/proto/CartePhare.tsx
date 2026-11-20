import Link from "next/link";
import type { ReactNode } from "react";
import { css } from "@/lib/css";
import { EtiquettesCarte } from "./EtiquettesCarte";
import { etiquettesRestantes, etiquettesVisibles } from "@/lib/data-shared";

// Carte « projet phare » (20 nov. 2026) : gabarit de la carte J.A.R.V.I.S de /ia, repris pour les projets
// phares de /projets. Badge, titre, résumé (la phrase courte du projet), étiquettes, lien vers la fiche, et
// grand visuel dans un cadre : à droite sur ordinateur, en dessous sur mobile. Sans capture, le cadre reste
// vide (fond Brume), sans texte. Tout le bloc est cliquable (lien étiré) ; les liens externes passent au-dessus.
const ETIQUETTE = `padding: 4px 10px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; font-size: 14px; font-weight: 700`;

export function CartePhare({
  id,
  titre,
  resume,
  tags,
  href,
  image,
  niveauTitre = "h3",
  liens,
  infos,
  verticale = false,
}: {
  id: string;
  titre: string;
  resume: string;
  tags: string[];
  href: string;
  image: { url: string; alt: string } | null;
  niveauTitre?: "h2" | "h3";
  liens?: ReactNode;
  /** Cadre et date (« Projet personnel », « nov. 2026 · en cours »), à côté du badge (20 nov. 2026). */
  infos?: string[];
  /** Carte en colonne, sans visuel (les 2 phares sous la grande carte de /projets, 20 nov. 2026) ; sinon visuel à droite. */
  verticale?: boolean;
}) {
  const Titre = niveauTitre;
  const reste = etiquettesRestantes(tags);
  const visuel = (
      <div style={css(`height: 300px; border-radius: 18px; background: #F3EFFF; display: flex; justify-content: center; align-items: flex-start; padding-top: 24px; overflow: hidden; box-sizing: border-box`)}>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.url} alt={image.alt} loading={"lazy"} style={css(`width: 220px; height: auto; border-radius: 16px; box-shadow: 0 8px 24px rgba(26,16,51,0.18)`)} />
        )}
      </div>
  );
  return (
    <article style={css(verticale ? `position: relative; display: flex; flex-direction: column; gap: 22px; height: 100%; box-sizing: border-box; border-radius: 24px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 24px; overflow: hidden` : `position: relative; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 28px; align-items: center; border-radius: 24px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 24px; overflow: hidden`)}>
      <div style={css(`display: flex; flex-direction: column; gap: 12px; flex-grow: 1`)}>
        <div style={css(`display: flex; flex-direction: column; align-items: flex-start; gap: 8px`)}>
          <span style={css(`padding: 3px 9px; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; font-size: 13px; font-weight: 800; letter-spacing: 0.04em`)}>{"PROJET PHARE"}</span>
          {infos?.filter(Boolean).length ? <span style={css(`font-size: 14px; font-weight: 700; color: #5B5470`)}>{infos.filter(Boolean).join(" · ")}</span> : null}
        </div>
        <Titre id={`${id}-titre`} style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(26px, 3vw, 32px); font-weight: 800; letter-spacing: -0.03em`)}>
          {titre}
        </Titre>
        <p id={`${id}-desc`} style={css(`margin: 0; font-size: 17px; line-height: 1.55; color: #5B5470`)}>
          {resume}
        </p>
        {/* En colonne : étiquettes sur une seule ligne, puis « +N » (EtiquettesCarte). */}
        {verticale ? (
          <EtiquettesCarte tags={tags} label={"Technologies et livrables"} listeStyle={``} cadreStyle={``} />
        ) : (
        <ul role={"list"} aria-label={"Technologies et livrables"} className={"liste-nue"} style={css(`display: flex; gap: 6px; flex-wrap: wrap`)}>
          {etiquettesVisibles(tags).map((t) => (
            <li key={t} style={css(ETIQUETTE)}>
              {t}
            </li>
          ))}
          {reste > 0 && (
            <li style={css(ETIQUETTE)}>
              <span aria-hidden={"true"}>{`+${reste}`}</span>
              <span className={"visuellement-masque"}>{`et ${reste} autre${reste > 1 ? "s" : ""}`}</span>
            </li>
          )}
        </ul>
        )}
        <div style={css(`display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; margin-top: ${verticale ? "auto" : "4px"}`)}>
          <Link href={href} id={`${id}-suite`} className={"lien-etire"} aria-labelledby={`${id}-titre ${id}-suite`} aria-describedby={`${id}-desc`} style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6; text-decoration: none`)}>
            {"Voir le projet →"}
          </Link>
          {liens && <span style={css(`position: relative; z-index: 1; display: inline-flex; flex-wrap: wrap; gap: 4px 16px`)}>{liens}</span>}
        </div>
      </div>
      {!verticale && visuel}
    </article>
  );
}
