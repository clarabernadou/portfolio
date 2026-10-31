"use client";

import { useCallback, useState, type KeyboardEvent, type MouseEvent } from "react";
import { css } from "@/lib/css";
import { useModal } from "@/lib/useModal";

// Fenêtre commune aux captures du site et aux livrables (choix de Clara, 30 oct. 2026) : image,
// PDF (lecteur du navigateur) ou vidéo, élément précédent / suivant, flèches du clavier et Échap.
// Même comportement que les autres fenêtres du site (useModal). Une capture de téléphone (portrait,
// 1 300 px de large au plus) s'affiche à la taille d'un écran de téléphone, pas étirée.
export type ElementVisionneuse = { titre: string; type: "image" | "pdf" | "video"; src: string; alt?: string };

const ROND = `width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; flex-shrink: 0; aspect-ratio: 1 / 1`;
const LARGEUR_TELEPHONE = 440;

export function Visionneuse({ id, elements, index, onIndex, noms }: { id: string; elements: ElementVisionneuse[]; index: number | null; onIndex: (i: number | null) => void; noms: { un: string; precedent: string; suivant: string } }) {
  const fermer = useCallback(() => onIndex(null), [onIndex]);
  useModal(index === null ? null : id, fermer);
  // Format de chaque image, mesuré au chargement (capture de téléphone ou d'écran large).
  const [etroites, setEtroites] = useState<Record<string, boolean>>({});
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
  const etroite = etroites[cur.src];

  return (
    <div className={"ex-modal"} onClick={fond}>
      <div id={id} className={"ex-dialog"} role={"dialog"} aria-modal={"true"} aria-labelledby={`${id}-titre`} onKeyDown={clavier} style={css(`max-width: 1100px; display: flex; flex-direction: column; gap: 16px`)}>
        <div style={css(`display: flex; justify-content: space-between; align-items: center; gap: 16px`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 2px; min-width: 0`)}>
            <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ardoise)`)}>{`${noms.un} ${index! + 1} sur ${n}`}</span>
            <span id={`${id}-titre`} style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: var(--encre); text-wrap: balance`)}>
              {cur.titre}
            </span>
          </div>
          <button type={"button"} onClick={fermer} aria-label={"Fermer"} style={css(`${ROND}; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre)`)}>
            <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"}>
              <path d={"M6 6l12 12M18 6L6 18"} />
            </svg>
          </button>
        </div>
        {cur.type === "pdf" ? (
          <iframe key={cur.src} src={cur.src} title={cur.titre} style={css(`display: block; width: 100%; height: 72vh; border: 1px solid var(--bordure); border-radius: 16px; background: var(--fond-section)`)} />
        ) : cur.type === "video" ? (
          <video key={cur.src} src={cur.src} controls style={css(`display: block; width: 100%; max-height: 72vh; border-radius: 16px; background: var(--encre)`)} />
        ) : (
          // Cadre défilant pour les pages longues : tabindex pour le faire défiler au clavier (RGAA 12.13).
          <div tabIndex={0} role={"region"} aria-label={cur.titre} style={css(`max-height: 72vh; overflow-y: auto; border-radius: 16px; border: 1px solid var(--bordure); background: var(--fond-section)`)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={cur.src}
              src={cur.src}
              alt={cur.alt ?? ""}
              onLoad={(e) => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                setEtroites((x) => ({ ...x, [cur.src]: h > w && w <= 1300 }));
              }}
              style={css(`display: block; width: 100%; height: auto; margin: 0 auto; max-width: ${etroite ? `${LARGEUR_TELEPHONE}px` : "none"}`)}
            />
          </div>
        )}
        <div style={css(`display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap`)}>
          {n > 1 ? (
            <button type={"button"} onClick={() => aller(-1)} aria-label={noms.precedent} style={css(`${ROND}; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre)`)}>
              <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                <path d={"M15 18l-6-6 6-6"} />
              </svg>
            </button>
          ) : (
            <span />
          )}
          <a href={cur.src} target={"_blank"} rel={"noopener noreferrer"} style={css(`min-height: 44px; display: inline-flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 700; color: var(--amethyste)`)}>
            {"Ouvrir dans un nouvel onglet"}
            <svg width={"14"} height={"14"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
              <path d={"M7 17L17 7M9 7h8v8"} />
            </svg>
          </a>
          {n > 1 ? (
            <button type={"button"} onClick={() => aller(1)} aria-label={noms.suivant} style={css(`${ROND}; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre)`)}>
              <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                <path d={"M9 18l6-6-6-6"} />
              </svg>
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
