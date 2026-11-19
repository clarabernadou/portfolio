"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { css } from "@/lib/css";

// Image affichée en entier dans un cadre, puis zoomable (demande de Clara, 17 nov. 2026), commune à la
// visionneuse des captures et livrables (Visionneuse.tsx) et aux exemples de la page IA (19 nov. 2026).
// Ajustée par défaut (jamais agrandie au-delà de sa taille réelle) ; zoom par − / + / « Ajuster », un clic
// sur l'image ou les touches + − 0 ; le cadre ne défile qu'une fois l'image zoomée.
// À monter avec key={src} : chaque image repart de la taille ajustée.

const ROND = `width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; flex-shrink: 0; aspect-ratio: 1 / 1; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre)`;
const ZOOMS = [1, 1.5, 2, 3, 4];
const inactif = (off: boolean) => `opacity: ${off ? 0.4 : 1}; cursor: ${off ? "default" : "pointer"}`;

export function ImageZoomable({ src, alt, label, hauteur, superpose }: { src: string; alt: string; label: string; hauteur: number; superpose?: ReactNode }) {
  const [taille, setTaille] = useState<{ w: number; h: number } | null>(null);
  const cadre = useRef<HTMLDivElement>(null);
  const [cadreW, setCadreW] = useState(0);
  const [niveau, setNiveau] = useState(0);
  // Point de l'image à garder au centre du cadre après un changement de zoom (proportions 0 à 1).
  const centre = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = cadre.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCadreW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = cadre.current;
    const c = centre.current;
    if (!el || !c) return;
    centre.current = null;
    el.scrollLeft = c.x * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = c.y * el.scrollHeight - el.clientHeight / 2;
  }, [niveau]);

  // Échelle « ajustée » : l'image entière dans le cadre, sans dépasser sa taille réelle.
  const ajuste = taille && cadreW ? Math.min(1, cadreW / taille.w, (hauteur * window.innerHeight) / taille.h) : 1;
  const zoome = niveau > 0 && !!taille;
  const changer = (nouveau: number, point?: { x: number; y: number }) => {
    const v = Math.max(0, Math.min(ZOOMS.length - 1, nouveau));
    if (v === niveau) return;
    const el = cadre.current;
    centre.current = point ?? (el && niveau > 0 ? { x: (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth, y: (el.scrollTop + el.clientHeight / 2) / el.scrollHeight } : { x: 0.5, y: 0.5 });
    setNiveau(v);
  };
  const clavier = (e: KeyboardEvent) => {
    if (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "0") {
      e.preventDefault();
      changer(e.key === "0" ? 0 : niveau + (e.key === "-" ? -1 : 1));
    }
  };
  const vh = `${hauteur * 100}vh`;

  return (
    <div onKeyDown={clavier} style={css(`display: flex; flex-direction: column; gap: 16px; min-height: 0`)}>
      <div style={css(`position: relative`)}>
        {superpose}
        {/* Zoomée, le cadre défile (tabindex : défilement au clavier, RGAA 12.13). */}
        <div
          ref={cadre}
          tabIndex={0}
          role={"region"}
          aria-label={label}
          style={css(
            zoome
              ? `height: ${vh}; overflow: auto; border-radius: 16px; border: 1px solid var(--bordure); background: var(--fond-section)`
              : `max-height: ${vh}; overflow: hidden; display: flex; justify-content: center; border-radius: 16px; border: 1px solid var(--bordure); background: var(--fond-section)`,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onLoad={(e) => setTaille({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              changer(zoome ? 0 : 2, { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
            }}
            style={css(
              zoome
                ? `display: block; width: ${Math.round(taille!.w * ajuste * ZOOMS[niveau])}px; max-width: none; height: auto; margin: 0 auto; cursor: zoom-out`
                : `display: block; width: auto; height: auto; max-width: 100%; max-height: ${vh}; margin: 0 auto; cursor: zoom-in`,
            )}
          />
        </div>
      </div>
      {/* Zoom centré sous le cadre : − niveau +, puis « Ajuster » en icône.
          aria-disabled plutôt que disabled : le bouton garde le focus quand il devient inactif. */}
      <div role={"group"} aria-label={"Zoom"} style={css(`display: flex; justify-content: center; align-items: center; gap: 8px`)}>
        <button type={"button"} onClick={() => changer(niveau - 1)} aria-disabled={niveau === 0} aria-label={"Dézoomer"} style={css(`${ROND}; ${inactif(niveau === 0)}`)}>
          <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"}>
            <path d={"M5 12h14"} />
          </svg>
        </button>
        <span aria-live={"polite"} style={css(`min-width: 72px; text-align: center; font-size: 15px; font-weight: 700; color: var(--encre)`)}>
          {zoome ? `${Math.round(ZOOMS[niveau] * 100)} %` : "Ajustée"}
        </span>
        <button type={"button"} onClick={() => changer(niveau + 1)} aria-disabled={niveau === ZOOMS.length - 1} aria-label={"Zoomer"} style={css(`${ROND}; ${inactif(niveau === ZOOMS.length - 1)}`)}>
          <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"}>
            <path d={"M12 5v14M5 12h14"} />
          </svg>
        </button>
        <button type={"button"} onClick={() => changer(0)} aria-disabled={!zoome} aria-label={"Ajuster"} title={"Ajuster à la fenêtre"} style={css(`${ROND}; margin-left: 8px; ${inactif(!zoome)}`)}>
          <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <path d={"M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"} />
          </svg>
        </button>
      </div>
    </div>
  );
}
