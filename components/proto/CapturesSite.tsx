"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { css } from "@/lib/css";
import type { ProjectCapture } from "@/lib/types";
import { filtreDepuisParam, filtresCaptures, PARAM_FILTRE } from "@/lib/captures-groupes";
import { Visionneuse } from "./Visionneuse";
import { legendeAffichee } from "@/lib/captures-legende";

// Section « Captures du site » de la fiche projet (choix de Clara, 29 oct. 2026) : vignettes,
// agrandies au clic dans la visionneuse commune aux livrables (Visionneuse.tsx).
// Sous-catégories (17 nov. 2026, lib/captures-groupes.ts) : à partir de 2 groupes, une rangée de
// filtres au-dessus des vignettes ; le filtre actif est dans l'adresse (?captures=…) et la
// visionneuse ne parcourt que ses captures. Sans groupe, ou avec un seul, rien ne change.
// Deux lignes au plus (choix de Clara, 20 nov. 2026) : au-delà, la dernière case est un collage des captures
// suivantes sous un voile sombre (« +7 autres captures ») ; un clic ouvre la visionneuse sur la première d'entre
// elles. Le nombre de colonnes est mesuré dans le navigateur : le rendu serveur (et la page sans JavaScript)
// montre toujours toutes les captures.
const LIGNES = 2;
const NOMS = { un: "Capture", precedent: "Capture précédente", suivant: "Capture suivante" };

const nombre = (k: number) => `${k} capture${k > 1 ? "s" : ""} affichée${k > 1 ? "s" : ""}`;

export function CapturesSite({ captures }: { captures: ProjectCapture[] }) {
  const [ouverte, setOuverte] = useState<number | null>(null);
  const filtres = useMemo(() => filtresCaptures(captures), [captures]);
  // Filtre actif (valeur du paramètre d'adresse) ; null pour « Tout ». Le rendu serveur, et donc
  // la page sans JavaScript, montre toujours toutes les captures.
  const [actif, setActif] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState("");

  useEffect(() => {
    if (!filtres) return;
    const valeur = new URLSearchParams(window.location.search).get(PARAM_FILTRE);
    // Lecture unique de l'adresse au chargement (indisponible pendant le rendu serveur), d'où l'effet.
    // Une valeur inconnue retombe sur « Tout ».
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActif(filtreDepuisParam(filtres, valeur)?.slug ?? null);
  }, [filtres]);

  const filtre = filtres?.find((f) => f.slug === actif) ?? null;
  const visibles = filtre ? filtre.indices.map((i) => captures[i]) : captures;
  const n = visibles.length;

  // Colonnes de la grille (null avant la première mesure : toutes les captures sont affichées).
  const grille = useRef<HTMLUListElement>(null);
  const [colonnes, setColonnes] = useState<number | null>(null);
  useEffect(() => {
    const ul = grille.current;
    if (!ul) return;
    const mesurer = () => setColonnes(getComputedStyle(ul).gridTemplateColumns.split(" ").filter(Boolean).length);
    mesurer();
    const ro = new ResizeObserver(mesurer);
    ro.observe(ul);
    return () => ro.disconnect();
  }, []);
  // Cases affichées : 2 lignes, au moins 4 cases (mobile, une colonne). Le collage n'apparaît que s'il
  // regroupe au moins 2 captures ; sinon tout est affiché.
  const cases = colonnes ? Math.max(colonnes * LIGNES, 4) : n;
  const collage = n > cases;
  const montrees = collage ? cases - 1 : n;
  const cachees = visibles.slice(montrees);

  const choisir = (slug: string | null) => {
    setActif(slug);
    setOuverte(null);
    const k = slug ? (filtres?.find((f) => f.slug === slug)?.indices.length ?? 0) : captures.length;
    setAnnonce(nombre(k));
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set(PARAM_FILTRE, slug);
    else url.searchParams.delete(PARAM_FILTRE);
    window.history.replaceState(window.history.state, "", url);
  };

  const bouton = (cle: string, libelle: string, k: number, on: boolean, slug: string | null) => (
    <button
      key={cle}
      type={"button"}
      aria-pressed={on}
      onClick={() => choisir(slug)}
      // Sur mobile, la rangée défile : le filtre qui reçoit le focus est amené en entier dans la
      // rangée, anneau compris (scroll-padding de .captures-filtres).
      onFocus={(e) => e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })}
      style={css(
        `flex: 0 0 auto; min-height: 44px; padding: 0 16px; border-radius: var(--r-pill); border: 1.5px solid var(--amethyste); font: inherit; font-size: 15px; font-weight: 700; white-space: nowrap; cursor: pointer; background: ${on ? "var(--amethyste)" : "var(--fond)"}; color: ${on ? "var(--fond)" : "var(--amethyste)"}`,
      )}
    >
      {`${libelle} (${k})`}
    </button>
  );

  return (
    <section style={css(`display: flex; flex-direction: column; gap: 1rem`)}>
      <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; text-wrap: balance`)}>
        {captures.length > 1 ? "Captures du site" : "Capture du site"}
      </h2>
      {filtres && (
        <>
          <div role={"group"} aria-label={"Filtrer les captures par sous-catégorie"} className={"captures-filtres"}>
            {bouton("tout", "Tout", captures.length, !filtre, null)}
            {filtres.map((f) => bouton(f.slug, f.libelle, f.indices.length, filtre?.slug === f.slug, f.slug))}
          </div>
          <p className={"visuellement-masque"} aria-live={"polite"}>
            {annonce}
          </p>
        </>
      )}
      <ul ref={grille} role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 1rem`)}>
        {visibles.slice(0, montrees).map((c, i) => {
          const vignette = (
            <button type={"button"} onClick={() => setOuverte(i)} aria-haspopup={"dialog"} aria-label={c.alt ? `Agrandir la capture ${i + 1} sur ${n} : ${c.alt}` : `Agrandir la capture ${i + 1} sur ${n}`} style={css(`height: 200px; padding: 0; border-radius: 18px; border: 1px solid var(--bordure); background: var(--fond-section); overflow: hidden; cursor: zoom-in`)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.url} alt={""} loading={"lazy"} style={css(`width: 100%; height: 100%; object-fit: cover; object-position: top; display: block`)} />
            </button>
          );
          const legende = legendeAffichee(c);
          return (
            <li key={c.url} className={filtres ? "captures-apparition" : undefined} style={css(`display: grid`)}>
              {/* Légende (23 nov. 2026) : image et légende dans un figure role="figure" dont l'aria-label reprend
                  le figcaption (RGAA 4.1.2, critère 1.9). Sans légende, la vignette seule, comme avant. */}
              {legende ? (
                <figure role={"figure"} aria-label={legende} style={css(`margin: 0; display: flex; flex-direction: column; gap: 8px`)}>
                  {vignette}
                  <figcaption style={css(`font-size: 15px; line-height: 1.5; color: var(--ardoise)`)}>{legende}</figcaption>
                </figure>
              ) : (
                vignette
              )}
            </li>
          );
        })}
        {collage && (
          <li key={"collage"} className={filtres ? "captures-apparition" : undefined} style={css(`display: grid`)}>
            <button type={"button"} onClick={() => setOuverte(montrees)} aria-haspopup={"dialog"} aria-label={`Voir les ${cachees.length} autres captures, à partir de la capture ${montrees + 1} sur ${n}`} style={css(`position: relative; height: 200px; padding: 0; border-radius: 18px; border: 1px solid var(--bordure); background: var(--fond-section); overflow: hidden; cursor: pointer`)}>
              {/* Collage des 4 premières captures cachées au plus, décoratif. */}
              <span aria-hidden={"true"} style={css(`position: absolute; inset: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 3px; background: var(--fond)`)}>
                {cachees.slice(0, 4).map((c, k, liste) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={c.url} src={c.url} alt={""} loading={"lazy"} style={css(`width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; ${liste.length === 3 && k === 0 ? "grid-row: span 2" : ""}${liste.length === 2 ? "grid-row: span 2" : ""}`)} />
                ))}
              </span>
              <span aria-hidden={"true"} style={css(`position: absolute; inset: 0; background: linear-gradient(135deg, color-mix(in srgb, var(--encre) 80%, transparent) 0%, color-mix(in srgb, var(--nuit) 72%, transparent) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: var(--fond)`)}>
                <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 40px; font-weight: 800; letter-spacing: -0.03em; line-height: 1`)}>{`+${cachees.length}`}</span>
                <span style={css(`font-size: 16px; font-weight: 700`)}>{"autres captures"}</span>
              </span>
            </button>
          </li>
        )}
      </ul>
      <Visionneuse id={"captures-fenetre"} elements={visibles.map((c, i) => ({ titre: c.alt || `Capture ${i + 1}`, type: "image", src: c.url, alt: c.alt }))} index={ouverte} onIndex={setOuverte} noms={NOMS} />
    </section>
  );
}
