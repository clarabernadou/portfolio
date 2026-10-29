"use client";

import { useEffect, useState } from "react";
import { demanderRestauration, ecrireEtatListe, libelleRetour, lireOrigine, restaurationDemandee } from "@/lib/retour-projets";
import { ProjetsView } from "./ProjetsView";
import type { Project } from "@/lib/types";
import { sortFeatured, type SiteProject } from "@/lib/data-shared";
import { estImage, formatLivrable } from "@/lib/livrables";

// Logique reprise du renderVals() de docs/passation/prototype-source/projets.source.html.
// Les projets viennent de la base (lib/data.ts), passés par la page serveur.
// Chemin du site (« assets/… ») ou adresse complète (fichier envoyé sur Vercel Blob).
const asset = (p: string) => (p.startsWith("/") || /^https?:\/\//.test(p) ? p : `/${p}`);

// Le focus est déplacé après le rendu suivant (RGAA 12.8 : il ne doit pas retomber sur la page).
const focusApres = (selecteur: string) => setTimeout(() => document.querySelector<HTMLElement>(selecteur)?.focus(), 0);

function card(p: Project) {
  return {
    ...p,
    ctx: p.context,
    hasGh: !!p.github,
    ghh: p.github,
    hasSite: !!p.site,
    siteh: p.site,
    href: `/projets/${p.id}`,
  };
}

function detail(p: Project) {
  return {
    ...p,
    hasPdf: !!p.pdf,
    pdfh: p.pdf,
    pdfFormat: formatLivrable(p.pdf),
    hasGh: !!p.github,
    ghh: p.github,
    hasFig: !!p.figma,
    figh: p.figma,
    hasSite: !!p.site,
    siteh: p.site,
    hasSteps: p.steps.length > 0,
    steps: p.steps.map((s) => {
      const fait = s.status === "Fait";
      return {
        label: s.label,
        state: s.status,
        mark: fait ? "✓" : "…",
        bg: fait ? "#6A4FB6" : "#FFFFFF",
        fg: fait ? "#FFFFFF" : "#6A4FB6",
      };
    }),
    hasCtx: !!p.context,
    ctx: p.context,
    hasSkills: p.skillsValidated.length > 0,
    skills: p.skillsValidated,
    hasVideos: !!p.videos?.length,
    hasCaptures: !!p.captures?.length,
    captures: (p.captures ?? []).map((c) => ({ ...c, url: asset(c.url) })),
    hasDocs: p.docs.length > 0,
    // Une image sert elle-même d'aperçu ; les autres formats sans aperçu affichent leur format.
    docs: p.docs.map((d) => ({ ...d, format: formatLivrable(d.href), thumb: d.thumb ? asset(d.thumb) : estImage(d.href) ? d.href : "" })),
  };
}

export function ProjetsListe({ projects: PROJECTS, featuredOrder, categories }: { projects: SiteProject[]; featuredOrder: string[]; categories: { types: string[]; cadres: string[] } }) {
  const TYPES = ["Tous", ...categories.types];
  // Un cadre sans projet public (tous privés ou en brouillon) n'est pas proposé en filtre.
  const PARS = ["Tous les parcours", ...categories.cadres.filter((c) => PROJECTS.some((p) => p.parcours === c))];
  const [type, setType] = useState("Tous");
  const [par, setPar] = useState("Tous les parcours");
  const [limit, setLimit] = useState(12);
  // Retour depuis une fiche : filtres et nombre de projets affichés tels qu'on les avait laissés.
  useEffect(() => {
    const o = lireOrigine("site");
    if (!restaurationDemandee("site") || o?.path !== "/projets") return;
    // Lecture unique, au montage, du stockage de l'onglet : impossible pendant le rendu serveur, d'où l'effet.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (o.type && TYPES.includes(o.type)) setType(o.type);
    if (o.par && PARS.includes(o.par)) setPar(o.par);
    if (o.limit) setLimit(o.limit);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une seule fois, à l'arrivée sur la liste
  }, []);
  useEffect(() => ecrireEtatListe({ type, par, limit }), [type, par, limit]);
  const byPar = PROJECTS.filter((p) => par === "Tous les parcours" || p.parcours === par);
  const shownRaw = byPar.filter((p) => type === "Tous" || (p.types as string[]).includes(type));
  const shown = shownRaw.slice(0, limit).map(card);
  const mk = (l: string, on: boolean, n: number, pick: () => void) => ({
    label: l,
    on,
    n,
    bg: on ? "#6A4FB6" : "#FFFFFF",
    fg: on ? "#FFFFFF" : "#6A4FB6",
    pick,
  });
  const rest = shownRaw.length - limit;

  const v = {
    isList: true,
    isDetail: false,
    honored: sortFeatured(PROJECTS, featuredOrder).map(card),
    vide: PROJECTS.length === 0,
    showHonor: type === "Tous" && par === "Tous les parcours" && PROJECTS.some((p) => p.featured),
    filtered: type !== "Tous" || par !== "Tous les parcours",
    reset: () => {
      setType("Tous");
      setPar("Tous les parcours");
      setLimit(12);
      // Le bouton disparaît : le focus va au premier filtre.
      focusApres('[aria-labelledby="f-type"] button');
    },
    countLabel: shownRaw.length + (shownRaw.length > 1 ? " projets" : " projet"),
    shownLabel:
      shown.length + (shown.length > 1 ? " projets affichés" : " projet affiché") + " sur " + shownRaw.length,
    moreLabel: "Afficher " + Math.min(12, rest) + (rest > 1 ? " projets" : " projet") + " de plus",
    hasMore: shownRaw.length > limit,
    more: () => {
      setLimit(limit + 12);
      // Le focus va au premier projet ajouté (le bouton disparaît après le dernier ajout).
      focusApres(`#carte-projet-${limit}`);
    },
    shown,
    types: TYPES.map((t) =>
      mk(t, type === t, byPar.filter((p) => t === "Tous" || (p.types as string[]).includes(t)).length, () => {
        setType(t);
        setLimit(12);
      }),
    ),
    pars: PARS.map((t) =>
      mk(t, par === t, PROJECTS.filter((p) => t === "Tous les parcours" || p.parcours === t).length, () => {
        setPar(t);
        setLimit(12);
      }),
    ),
  };
  return <ProjetsView v={v} />;
}

export function ProjetFiche({ id, projects: PROJECTS }: { id: string; projects: SiteProject[] }) {
  const [vid, setVid] = useState<number | null>(null);
  // Bouton retour : vers la page d'où l'on a ouvert la fiche (lue après le premier rendu, sinon la liste).
  const [origine, setOrigine] = useState<string | undefined>(undefined);
  // Lecture unique, au montage, du stockage de l'onglet : impossible pendant le rendu serveur, d'où l'effet.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOrigine(lireOrigine("site")?.path), []);

  const i = Math.max(0, PROJECTS.findIndex((p) => p.id === id));
  const cur = PROJECTS[i];
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];

  const v = {
    isList: false,
    isDetail: true,
    cur: detail(cur),
    curVideos: (cur.videos ?? []).map((vd) => ({
      ...vd,
      // Miniature YouTube servie depuis le site : rien n’est chargé chez YouTube avant le clic.
      thumb: `/films/${vd.youtubeId}.jpg`,
      embed: `https://www.youtube-nocookie.com/embed/${vd.youtubeId}?autoplay=1&rel=0`,
      // Les titres des films sont en anglais (RGAA 8.7).
      lang: "en",
      playing: vid === vd.n,
      notPlaying: vid !== vd.n,
      play: () => {
        setVid(vd.n);
        // Le bouton est remplacé par le lecteur : le focus passe au lecteur.
        focusApres(`#film-${vd.n}`);
      },
    })),
    backHref: origine ?? "/projets",
    backLabel: libelleRetour(origine),
    back: () => demanderRestauration("site"),
    prevHref: `/projets/${prev.id}`,
    nextHref: `/projets/${next.id}`,
    prevName: prev.name,
    nextName: next.name,
  };
  return <ProjetsView v={v} />;
}
