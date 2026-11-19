"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { css } from "@/lib/css";
import { ETIQUETTES_ACCUEIL } from "@/lib/data-shared";

// Étiquettes d'une carte de projet (accueil et /projets, 19 nov. 2026) : toujours sur une seule ligne.
// Autant d'étiquettes qu'il en tient dans la largeur de la carte, puis « +N » ; recalculé quand la largeur
// change. Le rendu serveur (et la page sans JavaScript) en montre 3 au plus. Les étiquettes masquées le sont
// aussi pour les lecteurs d'écran, qui entendent « et N autres ».
const TAG = `padding: 4px 10px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; font-size: 14px; font-weight: 700`;
const ECART = 6;

const plus = (n: number) => (
  <>
    <span aria-hidden={"true"}>{`+${n}`}</span>
    <span className={"visuellement-masque"}>{`et ${n} autre${n > 1 ? "s" : ""}`}</span>
  </>
);

export function EtiquettesCarte({ tags, tagStyle = TAG, listeStyle = `align-content: flex-end; min-height: 64px`, cadreStyle = `margin-top: auto`, label }: { tags: string[]; tagStyle?: string; listeStyle?: string; cadreStyle?: string; label?: string }) {
  const [n, setN] = useState(Math.min(tags.length, ETIQUETTES_ACCUEIL));
  const liste = useRef<HTMLUListElement>(null);
  const mesure = useRef<HTMLDivElement>(null);
  const style = `${tagStyle}; white-space: nowrap`;

  useLayoutEffect(() => {
    const ul = liste.current;
    const m = mesure.current;
    if (!ul || !m) return;
    const calculer = () => {
      const largeurs = [...m.children].map((el) => (el as HTMLElement).getBoundingClientRect().width);
      const plusW = largeurs.pop() ?? 0;
      const dispo = ul.clientWidth - 2; // marge contre les arrondis au demi-pixel
      let k = tags.length;
      const total = (k: number) => largeurs.slice(0, k).reduce((a, w) => a + w + ECART, 0) + (k < tags.length ? plusW : -ECART);
      while (k > 1 && total(k) > dispo) k--;
      setN(k);
    };
    calculer();
    const ro = new ResizeObserver(calculer);
    ro.observe(ul);
    return () => ro.disconnect();
  }, [tags]);

  const reste = tags.length - n;
  return (
    <div className={"etiquettes-cadre"} style={css(`position: relative; ${cadreStyle}`)}>
      {/* Mesure des largeurs (invisible, hors de l'accessibilité). */}
      <div ref={mesure} aria-hidden={"true"} style={css(`position: absolute; visibility: hidden; pointer-events: none; height: 0; overflow: hidden; display: flex; gap: ${ECART}px`)}>
        {tags.map((t) => (
          <span key={t} style={css(style)}>
            {t}
          </span>
        ))}
        <span style={css(style)}>{`+${tags.length}`}</span>
      </div>
      <ul ref={liste} role={"list"} aria-label={label} className={"liste-nue"} style={css(`display: flex; gap: ${ECART}px; flex-wrap: wrap; ${listeStyle}`)}>
        {tags.slice(0, n).map((t) => (
          <li key={t} style={css(style)}>
            {t}
          </li>
        ))}
        {reste > 0 && <li style={css(style)}>{plus(reste)}</li>}
      </ul>
    </div>
  );
}
