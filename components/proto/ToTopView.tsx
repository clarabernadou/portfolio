"use client";

import { Fragment } from "react";
import Link from "next/link";
import { css } from "@/lib/css";

// Généré depuis docs/passation/prototype-source/accueil.source.html
// (scripts/tools/gen.mjs) : markup et styles recopiés à l'identique.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function ToTopView({ v }: { v: any }) {
  return (
    <>
      {/* Fixe à l'écran (même place que l'ancien sticky) : le bouton est placé après le pied de page dans le code pour être atteint en dernier au clavier (RGAA 12.8). */}
      <div style={css(`position: fixed; right: 24px; bottom: 36px; z-index: 20; pointer-events: none`)}>
        {" "}
        <button type={"button"} onClick={v.toTop} aria-label={"Retour en haut de page"} style={css(`pointer-events: auto; width: 56px; height: 56px; border-radius: 50%; border: 0; cursor: pointer; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(26,16,51,0.18)`)}>
          <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.75"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <path d={"M12 19V5M5 12l7-7 7 7"} />
          </svg>
        </button>
        {" "}
      </div>
    </>
  );
}
