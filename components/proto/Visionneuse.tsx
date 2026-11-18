"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { css } from "@/lib/css";
import { useModal } from "@/lib/useModal";

// Fenêtre commune aux captures du site et aux livrables (choix de Clara, 30 oct. 2026) : image,
// PDF (lecteur du navigateur) ou vidéo, élément précédent / suivant, flèches du clavier et Échap.
// Même comportement que les autres fenêtres du site (useModal).
// Images (demande de Clara, 17 nov. 2026) : affichées en entier par défaut (ajustées au cadre,
// jamais agrandies au-delà de leur taille réelle), puis zoom par les boutons − / + / « Ajuster »,
// un clic sur l'image ou les touches + − 0 ; le cadre ne défile qu'une fois l'image zoomée.
export type ElementVisionneuse = { titre: string; type: "image" | "pdf" | "video"; src: string; alt?: string };

const ROND = `width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; flex-shrink: 0; aspect-ratio: 1 / 1`;
// Hauteur du cadre de l'image, et niveaux de zoom (multiples de la taille ajustée).
const HAUTEUR_CADRE = 0.64;
const ZOOMS = [1, 1.5, 2, 3, 4];

export function Visionneuse({ id, elements, index, onIndex, noms }: { id: string; elements: ElementVisionneuse[]; index: number | null; onIndex: (i: number | null) => void; noms: { un: string; precedent: string; suivant: string } }) {
  const fermer = useCallback(() => onIndex(null), [onIndex]);
  useModal(index === null ? null : id, fermer);
  // Taille réelle de chaque image, mesurée au chargement, et largeur du cadre.
  const [tailles, setTailles] = useState<Record<string, { w: number; h: number }>>({});
  const cadre = useRef<HTMLDivElement>(null);
  const [cadreW, setCadreW] = useState(0);
  // Niveau de zoom (indice dans ZOOMS) de l'image affichée ; revient à « ajusté » à chaque image.
  const [zoom, setZoom] = useState({ src: "", niveau: 0 });
  // Point de l'image à garder au centre du cadre après un changement de zoom (proportions 0 à 1).
  const centre = useRef<{ x: number; y: number } | null>(null);
  const n = elements.length;
  const cur = index === null ? null : elements[index];
  const src = cur?.type === "image" ? cur.src : null;

  useEffect(() => {
    const el = cadre.current;
    if (!src || !el) return;
    const ro = new ResizeObserver(() => setCadreW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [src]);

  const niveau = zoom.src === src ? zoom.niveau : 0;
  useLayoutEffect(() => {
    const el = cadre.current;
    const c = centre.current;
    if (!el || !c) return;
    centre.current = null;
    el.scrollLeft = c.x * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = c.y * el.scrollHeight - el.clientHeight / 2;
  }, [niveau, src]);

  if (!cur) return null;
  const aller = (sens: 1 | -1) => onIndex(((index ?? 0) + sens + n) % n);
  const taille = tailles[cur.src];
  // Échelle « ajustée » : l'image entière dans le cadre, sans dépasser sa taille réelle.
  const ajuste = taille && cadreW ? Math.min(1, cadreW / taille.w, (HAUTEUR_CADRE * window.innerHeight) / taille.h) : 1;
  const zoome = niveau > 0 && !!taille;
  // Niveau affiché par rapport à l'image ajustée (150 %, 200 %…), plus parlant que la taille du fichier.
  const pourcent = Math.round(ZOOMS[niveau] * 100);
  const changerZoom = (nouveau: number, point?: { x: number; y: number }) => {
    const v = Math.max(0, Math.min(ZOOMS.length - 1, nouveau));
    if (v === niveau || !src) return;
    const el = cadre.current;
    centre.current = point ?? (el && niveau > 0 ? { x: (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth, y: (el.scrollTop + el.clientHeight / 2) / el.scrollHeight } : { x: 0.5, y: 0.5 });
    setZoom({ src, niveau: v });
  };
  const clavier = (e: KeyboardEvent) => {
    // Les flèches restent au lecteur PDF ou vidéo quand il a le focus.
    if ((e.target as HTMLElement).closest("iframe, video")) return;
    if (src && (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "0")) {
      e.preventDefault();
      changerZoom(e.key === "0" ? 0 : niveau + (e.key === "-" ? -1 : 1));
      return;
    }
    if (n > 1 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      aller(e.key === "ArrowRight" ? 1 : -1);
    }
  };
  const fond = (e: MouseEvent) => {
    if (e.target === e.currentTarget) fermer();
  };

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
          // Image entière par défaut ; zoomée, le cadre défile (tabindex : défilement au clavier, RGAA 12.13).
          <div
            ref={cadre}
            tabIndex={0}
            role={"region"}
            aria-label={cur.titre}
            style={css(
              zoome
                ? `height: ${HAUTEUR_CADRE * 100}vh; overflow: auto; border-radius: 16px; border: 1px solid var(--bordure); background: var(--fond-section)`
                : `max-height: ${HAUTEUR_CADRE * 100}vh; overflow: hidden; display: flex; justify-content: center; border-radius: 16px; border: 1px solid var(--bordure); background: var(--fond-section)`,
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={cur.src}
              src={cur.src}
              alt={cur.alt ?? ""}
              onLoad={(e) => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                setTailles((x) => ({ ...x, [cur.src]: { w, h } }));
              }}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                changerZoom(zoome ? 0 : 2, { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
              }}
              style={css(
                zoome
                  ? `display: block; width: ${Math.round(taille!.w * ajuste * ZOOMS[niveau])}px; max-width: none; height: auto; margin: 0 auto; cursor: zoom-out`
                  : `display: block; width: auto; height: auto; max-width: 100%; max-height: ${HAUTEUR_CADRE * 100}vh; margin: 0 auto; cursor: zoom-in`,
              )}
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
          <span style={css(`display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px 16px`)}>
          {src && (
            <span role={"group"} aria-label={"Zoom"} style={css(`display: inline-flex; align-items: center; gap: 8px`)}>
              <button type={"button"} onClick={() => changerZoom(niveau - 1)} aria-disabled={niveau === 0} aria-label={"Dézoomer"} style={css(`${ROND}; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre); opacity: ${niveau === 0 ? 0.4 : 1}; cursor: ${niveau === 0 ? "default" : "pointer"}`)}>
                <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"}>
                  <path d={"M5 12h14"} />
                </svg>
              </button>
              <span aria-live={"polite"} style={css(`min-width: 64px; text-align: center; font-size: 15px; font-weight: 700; color: var(--encre)`)}>
                {zoome ? `${pourcent} %` : "Ajustée"}
              </span>
              <button type={"button"} onClick={() => changerZoom(niveau + 1)} aria-disabled={niveau === ZOOMS.length - 1} aria-label={"Zoomer"} style={css(`${ROND}; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre); opacity: ${niveau === ZOOMS.length - 1 ? 0.4 : 1}; cursor: ${niveau === ZOOMS.length - 1 ? "default" : "pointer"}`)}>
                <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"}>
                  <path d={"M12 5v14M5 12h14"} />
                </svg>
              </button>
              {/* aria-disabled plutôt que disabled : le bouton garde le focus quand il devient inactif. */}
              <button type={"button"} onClick={() => changerZoom(0)} aria-disabled={!zoome} style={css(`min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre); font: inherit; font-size: 15px; font-weight: 700; opacity: ${zoome ? 1 : 0.4}; cursor: ${zoome ? "pointer" : "default"}`)}>
                {"Ajuster"}
              </button>
            </span>
          )}
          <a href={cur.src} target={"_blank"} rel={"noopener noreferrer"} style={css(`min-height: 44px; display: inline-flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 700; color: var(--amethyste)`)}>
            {"Ouvrir dans un nouvel onglet"}
            <svg width={"14"} height={"14"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
              <path d={"M7 17L17 7M9 7h8v8"} />
            </svg>
          </a>
          </span>
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
