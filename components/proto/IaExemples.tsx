"use client";

import { useCallback, useState, type KeyboardEvent, type MouseEvent } from "react";
import { css } from "@/lib/css";
import { useModal } from "@/lib/useModal";
import type { IaExamples } from "@/lib/types";

// Bouton « Voir un exemple » et fenêtre d'exemples d'une routine (README §18), avec le
// markup et les styles du prototype (ia.source.html, .ex-modal). Les onglets n'apparaissent
// que s'il y a plusieurs exemples. Même comportement que la fenêtre des recommandations (useModal).
const ONGLET = `min-height: 40px; padding: 0 18px; border-radius: 999px; border: 0; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`;

export function IaExemples({ ex, routine, id }: { ex: IaExamples; routine: string; id: string }) {
  const [tab, setTab] = useState<number | null>(null);
  const close = useCallback(() => setTab(null), []);
  useModal(tab === null ? null : id, close);
  const onglets = ex.items.length > 1;
  const backdrop = (e: MouseEvent) => {
    if (e.target === e.currentTarget) close();
  };
  // Onglets : flèches gauche et droite, Début et Fin (motif ARIA « tabs »).
  const clavier = (e: KeyboardEvent) => {
    if (tab === null) return;
    const n = ex.items.length;
    const cible = { ArrowRight: (tab + 1) % n, ArrowLeft: (tab - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (cible === undefined) return;
    e.preventDefault();
    setTab(cible);
    document.getElementById(`${id}-onglet-${cible}`)?.focus();
  };

  return (
    <>
      <button type={"button"} onClick={() => setTab(0)} aria-haspopup={"dialog"} style={css(`align-self: flex-start; margin-top: 6px; min-height: 40px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #1A1033; background: #FFFFFF; color: #1A1033; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)}>
        {"Voir un exemple"}
      </button>
      {tab !== null && (
        <div className={"ex-modal"} onClick={backdrop}>
          <div id={id} className={"ex-dialog"} role={"dialog"} aria-modal={"true"} aria-labelledby={`${id}-titre`} style={css(`display: flex; flex-direction: column; gap: 16px`)}>
            <div style={css(`display: flex; justify-content: space-between; align-items: flex-start; gap: 16px`)}>
              <div style={css(`display: flex; flex-direction: column; gap: 2px`)}>
                <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>{`Routine · ${routine}`}</span>
                <span id={`${id}-titre`} style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #1A1033`)}>{ex.title}</span>
              </div>
              <button type={"button"} onClick={close} aria-label={"Fermer les exemples"} style={css(`width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #1A1033; background: #FFFFFF; color: #1A1033; display: inline-flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; flex-shrink: 0; aspect-ratio: 1 / 1`)}>
                <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"}>
                  <path d={"M6 6l12 12M18 6L6 18"} />
                </svg>
              </button>
            </div>
            {onglets && (
            <div role={"tablist"} aria-label={"Choisir un exemple"} onKeyDown={clavier} style={css(`display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; background: #F3EFFF; align-self: flex-start`)}>
              {ex.items.map((it, i) => (
                <button key={it.tab} id={`${id}-onglet-${i}`} type={"button"} role={"tab"} aria-selected={tab === i} aria-controls={`${id}-panneau-${i}`} tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)} style={css(`${ONGLET}; background: ${tab === i ? "#6A4FB6" : "transparent"}; color: ${tab === i ? "#FFFFFF" : "#6A4FB6"}`)}>
                  {it.tab}
                </button>
              ))}
            </div>
            )}
            {ex.items.map((it, i) =>
              tab === i ? (
                <div key={it.tab} {...(onglets ? { id: `${id}-panneau-${i}`, role: "tabpanel", "aria-labelledby": `${id}-onglet-${i}` } : {})} style={css(`display: flex; flex-direction: column; gap: 12px`)}>
                  <p style={css(`margin: 0; font-size: 16px; line-height: 1.55; color: #5B5470`)}>{it.caption}</p>
                  {/* Cadre défilant : tabindex pour le faire défiler au clavier (RGAA 12.13). */}
                  <div tabIndex={0} role={"region"} aria-label={`Capture : ${it.tab}`} style={css(`max-height: 62vh; overflow-y: auto; border-radius: 16px; border: 1px solid #E4DCF7; background: #F3EFFF`)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.image} alt={it.alt} style={css(`display: block; width: 100%; height: auto`)} />
                  </div>
                </div>
              ) : null,
            )}
            <p style={css(`margin: 0; font-size: 14px; line-height: 1.5; font-style: italic; color: #5B5470`)}>{ex.note}</p>
          </div>
        </div>
      )}
    </>
  );
}
