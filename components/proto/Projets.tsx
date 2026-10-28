"use client";

import { useState } from "react";
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
    showHonor: type === "Tous" && par === "Tous les parcours",
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
    prevHref: `/projets/${prev.id}`,
    nextHref: `/projets/${next.id}`,
    prevName: prev.name,
    nextName: next.name,
  };
  return <ProjetsView v={v} />;
}
