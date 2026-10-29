"use client";

import { useCallback, useState, type KeyboardEvent, type MouseEvent } from "react";
import { css } from "@/lib/css";
import { useModal } from "@/lib/useModal";
import type { ProjectCapture } from "@/lib/types";

// Section « Captures du site » de la fiche projet (choix de Clara, 29 oct. 2026) : vignettes,
// agrandies au clic dans une fenêtre (même comportement que les exemples de la page IA : useModal),
// avec image précédente / suivante, flèches du clavier et Échap.
const ID = "captures-fenetre";
const ROND = `width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; flex-shrink: 0; aspect-ratio: 1 / 1`;

export function CapturesSite({ captures }: { captures: ProjectCapture[] }) {
  const [ouverte, setOuverte] = useState<number | null>(null);
  const fermer = useCallback(() => setOuverte(null), []);
  useModal(ouverte === null ? null : ID, fermer);
  const n = captures.length;
  const aller = (sens: 1 | -1) => setOuverte((i) => (i === null ? i : (i + sens + n) % n));
  const clavier = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      aller(e.key === "ArrowRight" ? 1 : -1);
    }
  };
  const fond = (e: MouseEvent) => {
    if (e.target === e.currentTarget) fermer();
  };
  const cur = ouverte === null ? null : captures[ouverte];

  return (
    <section style={css(`display: flex; flex-direction: column; gap: 1rem`)}>
      <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; text-wrap: balance`)}>
        {"Captures du site"}
      </h2>
      <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 1rem`)}>
        {captures.map((c, i) => (
          <li key={c.url} style={css(`display: grid`)}>
            <button type={"button"} onClick={() => setOuverte(i)} aria-haspopup={"dialog"} aria-label={`Agrandir la capture ${i + 1} sur ${n} : ${c.alt}`} style={css(`height: 200px; padding: 0; border-radius: 18px; border: 1px solid var(--bordure); background: var(--fond-section); overflow: hidden; cursor: zoom-in`)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.url} alt={""} loading={"lazy"} style={css(`width: 100%; height: 100%; object-fit: cover; object-position: top; display: block`)} />
            </button>
          </li>
        ))}
      </ul>
      {cur && (
        <div className={"ex-modal"} onClick={fond}>
          <div id={ID} className={"ex-dialog"} role={"dialog"} aria-modal={"true"} aria-labelledby={`${ID}-titre`} onKeyDown={clavier} style={css(`max-width: 1100px; display: flex; flex-direction: column; gap: 16px`)}>
            <div style={css(`display: flex; justify-content: space-between; align-items: center; gap: 16px`)}>
              <span id={`${ID}-titre`} style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: var(--encre)`)}>
                {`Capture ${ouverte! + 1} sur ${n}`}
              </span>
              <button type={"button"} onClick={fermer} aria-label={"Fermer les captures"} style={css(`${ROND}; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre)`)}>
                <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"}>
                  <path d={"M6 6l12 12M18 6L6 18"} />
                </svg>
              </button>
            </div>
            {/* Cadre défilant pour les pages longues : tabindex pour le faire défiler au clavier (RGAA 12.13). */}
            <div tabIndex={0} role={"region"} aria-label={`Capture ${ouverte! + 1}`} style={css(`max-height: 70vh; overflow-y: auto; border-radius: 16px; border: 1px solid var(--bordure); background: var(--fond-section)`)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cur.url} alt={cur.alt} style={css(`display: block; width: 100%; height: auto`)} />
            </div>
            {n > 1 && (
              <div style={css(`display: flex; justify-content: space-between; gap: 12px`)}>
                <button type={"button"} onClick={() => aller(-1)} aria-label={"Capture précédente"} style={css(`${ROND}; border: 1.5px solid var(--amethyste); background: #FFFFFF; color: var(--amethyste)`)}>
                  <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                    <path d={"M15 18l-6-6 6-6"} />
                  </svg>
                </button>
                <button type={"button"} onClick={() => aller(1)} aria-label={"Capture suivante"} style={css(`${ROND}; border: 1.5px solid var(--amethyste); background: #FFFFFF; color: var(--amethyste)`)}>
                  <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                    <path d={"M9 18l6-6-6-6"} />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
