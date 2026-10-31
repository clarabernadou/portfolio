"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { css } from "@/lib/css";

// Cartes « Démarche et livrables » de la fiche projet. Jusqu'à 4 livrables : la grille du prototype.
// Au-delà (choix de Clara, 29 oct. 2026) : une rangée qui défile (balayage, molette, clavier),
// avec des flèches précédents / suivants et la position annoncée aux lecteurs d'écran.
const SEUIL = 4;
const FLECHE = `width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre); display: inline-flex; align-items: center; justify-content: center; padding: 0; cursor: pointer`;

export function ListeLivrables({ total, children }: { total: number; children: ReactNode }) {
  const liste = useRef<HTMLUListElement>(null);
  const [vue, setVue] = useState({ premier: 1, dernier: Math.min(total, SEUIL), debut: true, fin: total <= SEUIL });

  // Cartes entièrement visibles dans la rangée, et rangée en butée à gauche ou à droite.
  const mesurer = useCallback(() => {
    const ul = liste.current;
    if (!ul) return;
    const g = ul.scrollLeft;
    const d = g + ul.clientWidth;
    const visibles = [...ul.children].flatMap((li, i) => {
      const el = li as HTMLElement;
      return el.offsetLeft >= g - 2 && el.offsetLeft + el.offsetWidth <= d + 2 ? [i + 1] : [];
    });
    if (!visibles.length) return;
    setVue({ premier: visibles[0], dernier: visibles[visibles.length - 1], debut: g <= 2, fin: d >= ul.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    const ul = liste.current;
    if (!ul || total <= SEUIL) return;
    mesurer();
    ul.addEventListener("scroll", mesurer, { passive: true });
    const ro = new ResizeObserver(mesurer);
    ro.observe(ul);
    return () => {
      ul.removeEventListener("scroll", mesurer);
      ro.disconnect();
    };
  }, [mesurer, total]);

  // Défile d'autant de cartes qu'il en tient à l'écran.
  const defiler = (sens: 1 | -1) => {
    const ul = liste.current;
    if (!ul || (sens < 0 ? vue.debut : vue.fin)) return;
    const pas = (vue.dernier - vue.premier + 1) * ((ul.firstElementChild as HTMLElement).offsetWidth + 16);
    const doux = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ul.scrollBy({ left: sens * pas, behavior: doux ? "smooth" : "auto" });
  };

  if (total <= SEUIL) {
    return (
      <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 1rem`)}>
        {children}
      </ul>
    );
  }
  return (
    <div style={css(`display: flex; flex-direction: column; gap: 12px`)}>
      {/* Marge intérieure de 6 px : l'anneau de focus des cartes n'est pas rogné par le défilement. */}
      <ul ref={liste} role={"list"} className={"liste-nue livrables-carrousel"} style={css(`position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: max(min(240px, 100%), calc((100% - 3rem) / 4)); gap: 1rem; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding: 6px; padding: 6px; margin: -6px; scrollbar-width: thin`)}>
        {children}
      </ul>
      <div style={css(`display: flex; align-items: center; justify-content: space-between; gap: 12px`)}>
        <p aria-live={"polite"} style={css(`margin: 0; font-size: 15px; font-weight: 600; color: var(--ardoise)`)}>
          {vue.premier === vue.dernier ? `Livrable ${vue.premier} sur ${total}` : `Livrables ${vue.premier} à ${vue.dernier} sur ${total}`}
        </p>
        <div style={css(`display: flex; gap: 8px`)}>
          <button type={"button"} onClick={() => defiler(-1)} aria-label={"Livrables précédents"} aria-disabled={vue.debut} style={css(`${FLECHE}; opacity: ${vue.debut ? 0.4 : 1}`)}>
            <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
              <path d={"M15 18l-6-6 6-6"} />
            </svg>
          </button>
          <button type={"button"} onClick={() => defiler(1)} aria-label={"Livrables suivants"} aria-disabled={vue.fin} style={css(`${FLECHE}; opacity: ${vue.fin ? 0.4 : 1}`)}>
            <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
              <path d={"M9 18l6-6-6-6"} />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
