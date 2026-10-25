"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { css } from "@/lib/css";
import { useModal } from "@/lib/useModal";
import type { SiteReco } from "@/lib/data-shared";

// Cartes « Ils me recommandent » et fenêtre « Lire en entier » de l'accueil, rendues
// depuis les données (étape 9) avec le markup et les styles du prototype (AccueilView).
const LIEN_RECOS = "https://www.linkedin.com/in/clarabernadou/details/recommendations/";

function Role({ r }: { r: SiteReco }) {
  if (!r.entrepriseHref || !r.lienTexte || !r.poste.includes(r.lienTexte)) return <>{r.poste}</>;
  const [avant, ...apres] = r.poste.split(r.lienTexte);
  return (
    <>
      {avant}
      <a href={r.entrepriseHref} target={"_blank"} rel={"noopener noreferrer"} style={css(`color: inherit; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px`)}>
        {r.lienTexte}
      </a>
      {apres.join(r.lienTexte)}
    </>
  );
}

export function Recommandations({ items }: { items: SiteReco[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useModal(open === null ? null : `reco-full-${open}`, close);
  const backdrop = (e: MouseEvent) => {
    if (e.target === e.currentTarget) close();
  };
  const r = open === null ? null : items[open];

  return (
    <>
      <div style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 1.25rem; align-items: stretch`)}>
        {items.map((it, i) => (
          <figure key={it.auteur} style={css(`margin: 0; border-radius: 22px; border: 1px solid #E4DCF7; padding: 26px; display: flex; flex-direction: column; gap: 18px; height: 100%; box-sizing: border-box`)}>
            <blockquote style={css(`margin: 0; flex-grow: 1; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 21px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.35`)}>{it.citationCourte}</blockquote>
            <figcaption style={css(`display: flex; flex-direction: column; gap: 12px`)}>
              <div style={css(`display: flex; align-items: center; gap: 12px`)}>
                <span aria-hidden={"true"} style={css(`width: 46px; height: 46px; border-radius: 50%; background: #F3EFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; flex-shrink: 0`)}>
                  {it.initiales}
                </span>{" "}
                <div style={css(`display: flex; flex-direction: column; gap: 2px; min-width: 0`)}>
                  {it.linkedin ? (
                    <a href={it.linkedin} target={"_blank"} rel={"noopener noreferrer"} style={css(`display: inline-flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 800; color: #1A1033; text-decoration: none`)}>
                      {it.auteur}
                      <span style={css(`color: #6A4FB6; display: inline-flex`)}>
                        <svg width={"16"} height={"16"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                          <rect x={"3"} y={"3"} width={"18"} height={"18"} rx={"4"} />
                          <path d={"M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"} />
                        </svg>
                      </span>
                      <span style={css(`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)`)}>{", profil LinkedIn"}</span>
                    </a>
                  ) : (
                    <span style={css(`display: inline-flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 800; color: #1A1033; text-decoration: none`)}>{it.auteur}</span>
                  )}
                  <span style={css(`font-size: 14px; color: #5B5470`)}>
                    <Role r={it} />
                  </span>
                </div>
              </div>{" "}
              <span style={css(`align-self: flex-start; padding: 5px 10px; border-radius: 8px; background: #F3EFFF; color: #6A4FB6; font-size: 13px; font-weight: 700`)}>{it.relation}</span>
            </figcaption>
            <div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding-top: 14px; border-top: 1px solid #E4DCF7`)}>
              <button type={"button"} aria-expanded={open === i} aria-controls={`reco-full-${i}`} onClick={() => setOpen(open === i ? null : i)} style={css(`min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #B9A8EC; background: #FFFFFF; color: #6A4FB6; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)}>
                <span>{open === i ? "Masquer" : "Lire en entier"}</span>
              </button>
              {it.lettrePdf && (
                <a href={it.lettrePdf} target={"_blank"} rel={"noopener noreferrer"} style={css(`font-size: 14px; font-weight: 700`)}>
                  {"Lettre · PDF"}
                </a>
              )}
              {it.voirLinkedin && (
                <a href={LIEN_RECOS} target={"_blank"} rel={"noopener noreferrer"} style={css(`font-size: 14px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px`)}>
                  {"Voir sur LinkedIn"}
                  <span aria-hidden={"true"}>{"↗"}</span>
                </a>
              )}
            </div>
          </figure>
        ))}
      </div>
      {r && open !== null && (
        <div className={"reco-modal"} onClick={backdrop}>
          <div id={`reco-full-${open}`} className={"reco-dialog"} role={"dialog"} aria-modal={"true"} aria-label={`Recommandation complète de ${r.auteur}`} style={css(`display: flex; flex-direction: column; gap: 12px`)}>
            <div style={css(`display: flex; justify-content: space-between; align-items: flex-start; gap: 16px`)}>
              <div style={css(`display: flex; flex-direction: column; gap: 2px`)}>
                <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>{"Recommandation complète"}</span>
                <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #1A1033`)}>{r.auteur}</span>
              </div>
              <button type={"button"} onClick={close} aria-label={`Fermer la recommandation de ${r.auteur}`} style={css(`width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #1A1033; background: #FFFFFF; color: #1A1033; display: inline-flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; flex-shrink: 0; aspect-ratio: 1 / 1`)}>
                <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"}>
                  <path d={"M6 6l12 12M18 6L6 18"} />
                </svg>
              </button>
            </div>
            {r.texteIntegral.map((para, k) => (
              <p key={k} style={css(`margin: 0; font-size: 17px; line-height: 1.7; color: #1A1033`)}>
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
