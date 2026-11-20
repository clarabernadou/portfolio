"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { css } from "@/lib/css";

// Cartes « Démarche et livrables » de la fiche projet. Jusqu'à 4 livrables : la grille du prototype.
// Au-delà (choix de Clara, 29 oct. 2026) : une rangée qui défile (balayage, molette, clavier),
// avec des flèches précédents / suivants et la position annoncée aux lecteurs d'écran.
const SEUIL = 4;
const FLECHE = `width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--encre); background: #FFFFFF; color: var(--encre); display: inline-flex; align-items: center; justify-content: center; padding: 0; cursor: pointer`;

// Réutilisé pour les recommandations de l'accueil (20 nov. 2026) : 3 cartes par vue, flèches à partir de 4.
type Noms = { un: string; plusieurs: string; precedents: string; suivants: string };
const NOMS_LIVRABLES: Noms = { un: "Livrable", plusieurs: "livrables", precedents: "Livrables précédents", suivants: "Livrables suivants" };

export function ListeLivrables({ total, children, parVue = SEUIL, largeurMin = 240, noms = NOMS_LIVRABLES }: { total: number; children: ReactNode; parVue?: number; largeurMin?: number; noms?: Noms }) {
  const liste = useRef<HTMLUListElement>(null);
  // Avant la première mesure (rendu serveur), on ne sait pas combien de cartes tiennent à l'écran :
  // le texte annonce seulement le total (« 7 livrables »), jamais une plage fausse (13 nov. 2026).
  const [vue, setVue] = useState({ premier: 1, dernier: Math.min(total, parVue), debut: true, fin: total <= parVue, mesure: false });

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
    setVue({ premier: visibles[0], dernier: visibles[visibles.length - 1], debut: g <= 2, fin: d >= ul.scrollWidth - 2, mesure: true });
  }, []);

  useEffect(() => {
    const ul = liste.current;
    if (!ul || total <= parVue) return;
    mesurer();
    ul.addEventListener("scroll", mesurer, { passive: true });
    const ro = new ResizeObserver(mesurer);
    ro.observe(ul);
    return () => {
      ul.removeEventListener("scroll", mesurer);
      ro.disconnect();
    };
  }, [mesurer, total, parVue]);

  // Défile d'autant de cartes qu'il en tient à l'écran.
  const defiler = (sens: 1 | -1) => {
    const ul = liste.current;
    if (!ul || (sens < 0 ? vue.debut : vue.fin)) return;
    const pas = (vue.dernier - vue.premier + 1) * ((ul.firstElementChild as HTMLElement).offsetWidth + 16);
    const doux = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ul.scrollBy({ left: sens * pas, behavior: doux ? "smooth" : "auto" });
  };

  if (total <= parVue) {
    return (
      <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fill, minmax(min(${largeurMin}px, 100%), 1fr)); gap: 1rem`)}>
        {children}
      </ul>
    );
  }
  return (
    <div style={css(`display: flex; flex-direction: column; gap: 12px`)}>
      {/* Marge intérieure de 6 px : l'anneau de focus des cartes n'est pas rogné par le défilement. */}
      {/* Rangée atteignable au clavier (flèches gauche et droite pour défiler), même sans carte cliquable (skills). */}
      <ul ref={liste} role={"list"} tabIndex={0} aria-label={`${noms.plusieurs.charAt(0).toUpperCase()}${noms.plusieurs.slice(1)}, rangée qui défile`} className={"liste-nue livrables-carrousel"} style={css(`position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: max(min(${largeurMin}px, 100%), calc((100% - ${parVue - 1}rem) / ${parVue})); gap: 1rem; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding: 6px; padding: 6px 6px 18px; margin: -6px -6px 0; scrollbar-width: thin`)}>
        {children}
      </ul>
      <div style={css(`display: flex; align-items: center; justify-content: space-between; gap: 12px`)}>
        <p aria-live={"polite"} style={css(`margin: 0; font-size: 15px; font-weight: 600; color: var(--ardoise)`)}>
          {!vue.mesure ? `${total} ${noms.plusieurs}` : vue.premier === vue.dernier ? `${noms.un} ${vue.premier} sur ${total}` : `${noms.plusieurs.charAt(0).toUpperCase()}${noms.plusieurs.slice(1)} ${vue.premier} à ${vue.dernier} sur ${total}`}
        </p>
        <div style={css(`display: flex; gap: 8px`)}>
          <button type={"button"} onClick={() => defiler(-1)} aria-label={noms.precedents} aria-disabled={vue.debut} style={css(`${FLECHE}; opacity: ${vue.debut ? 0.4 : 1}`)}>
            <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
              <path d={"M15 18l-6-6 6-6"} />
            </svg>
          </button>
          <button type={"button"} onClick={() => defiler(1)} aria-label={noms.suivants} aria-disabled={vue.fin} style={css(`${FLECHE}; opacity: ${vue.fin ? 0.4 : 1}`)}>
            <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
              <path d={"M9 18l6-6-6-6"} />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
