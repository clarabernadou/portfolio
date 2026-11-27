"use client";

import { useCallback, type KeyboardEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { css } from "@/lib/css";
import { useModal } from "@/lib/useModal";
import { ImageZoomable } from "./ImageZoomable";

// Fenêtre commune aux captures du site et aux livrables (choix de Clara, 30 oct. 2026) : image,
// PDF (lecteur du navigateur) ou vidéo, élément précédent / suivant, flèches du clavier et Échap.
// Même comportement que les autres fenêtres du site (useModal).
// Images : affichées en entier puis zoomables (ImageZoomable.tsx, commun avec la page IA).
export type ElementVisionneuse = { titre: string; type: "image" | "pdf" | "video"; src: string; alt?: string };

const ROND = `width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; flex-shrink: 0; aspect-ratio: 1 / 1`;
// Hauteur du cadre de l'image (part de la fenêtre).
const HAUTEUR_CADRE = 0.64;

export function Visionneuse({ id, elements, index, onIndex, noms }: { id: string; elements: ElementVisionneuse[]; index: number | null; onIndex: (i: number | null) => void; noms: { un: string; precedent: string; suivant: string } }) {
  const fermer = useCallback(() => onIndex(null), [onIndex]);
  useModal(index === null ? null : id, fermer);
  const n = elements.length;
  const cur = index === null ? null : elements[index];
  if (!cur) return null;
  const aller = (sens: 1 | -1) => onIndex(((index ?? 0) + sens + n) % n);
  const clavier = (e: KeyboardEvent) => {
    // Les flèches restent au lecteur PDF ou vidéo quand il a le focus.
    if ((e.target as HTMLElement).closest("iframe, video")) return;
    if (n > 1 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      aller(e.key === "ArrowRight" ? 1 : -1);
    }
  };
  const fond = (e: MouseEvent) => {
    if (e.target === e.currentTarget) fermer();
  };

  const fleche = (sens: 1 | -1) => (
    <button type={"button"} onClick={() => aller(sens)} aria-label={sens === 1 ? noms.suivant : noms.precedent} style={css(`${ROND}; position: absolute; top: 50%; ${sens === 1 ? "right" : "left"}: 12px; transform: translateY(-50%); z-index: 1; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre); box-shadow: var(--ombre-modale)`)}>
      <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
        <path d={sens === 1 ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
      </svg>
    </button>
  );
  const BOUTON = `${ROND}; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre)`;

  // Rendue à la racine du document (20 nov. 2026) : jamais rognée par une section (clip-path, overflow).
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className={"ex-modal"} onClick={fond}>
      <div id={id} className={"ex-dialog"} role={"dialog"} aria-modal={"true"} aria-labelledby={`${id}-titre`} onKeyDown={clavier} style={css(`max-width: 1100px; display: flex; flex-direction: column; gap: 16px`)}>
        <div style={css(`display: flex; justify-content: space-between; align-items: center; gap: 16px`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 2px; min-width: 0`)}>
            <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ardoise)`)}>{`${noms.un} ${index! + 1} sur ${n}`}</span>
            <span id={`${id}-titre`} style={css(`font-family: var(--font-titre); font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: var(--encre); text-wrap: balance`)}>
              {cur.titre}
            </span>
          </div>
          {/* Ouvrir dans un nouvel onglet, puis Fermer : deux icônes en haut à droite (demande de Clara, 19 nov. 2026). */}
          <div style={css(`display: flex; gap: 8px; flex-shrink: 0`)}>
            <a href={cur.src} target={"_blank"} rel={"noopener noreferrer"} aria-label={"Ouvrir dans un nouvel onglet"} title={"Ouvrir dans un nouvel onglet"} style={css(BOUTON)}>
              <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                <path d={"M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"} />
              </svg>
            </a>
            <button type={"button"} onClick={fermer} aria-label={"Fermer"} style={css(BOUTON)}>
              <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"}>
                <path d={"M6 6l12 12M18 6L6 18"} />
              </svg>
            </button>
          </div>
        </div>
        {/* Précédent / suivant posés sur le cadre, centrés en hauteur ; hors du cadre qui défile, ils restent en place une fois l'image zoomée. */}
        {cur.type === "image" ? (
          <ImageZoomable key={cur.src} src={cur.src} alt={cur.alt ?? ""} label={cur.titre} hauteur={HAUTEUR_CADRE} superpose={n > 1 && <>{fleche(-1)}{fleche(1)}</>} />
        ) : (
          <div style={css(`position: relative`)}>
            {n > 1 && fleche(-1)}
            {cur.type === "pdf" ? (
              <iframe key={cur.src} src={cur.src} title={cur.titre} style={css(`display: block; width: 100%; height: 72vh; border: 1px solid var(--bordure); border-radius: 16px; background: var(--fond-section)`)} />
            ) : (
              <video key={cur.src} src={cur.src} controls style={css(`display: block; width: 100%; max-height: 72vh; border-radius: 16px; background: var(--encre)`)} />
            )}
            {n > 1 && fleche(1)}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
