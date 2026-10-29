"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import type { ProjectCapture } from "@/lib/types";
import { Visionneuse } from "./Visionneuse";

// Section « Captures du site » de la fiche projet (choix de Clara, 29 oct. 2026) : vignettes,
// agrandies au clic dans la visionneuse commune aux livrables (Visionneuse.tsx).
const NOMS = { un: "Capture", precedent: "Capture précédente", suivant: "Capture suivante" };

export function CapturesSite({ captures }: { captures: ProjectCapture[] }) {
  const [ouverte, setOuverte] = useState<number | null>(null);
  const n = captures.length;

  return (
    <section style={css(`display: flex; flex-direction: column; gap: 1rem`)}>
      <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; text-wrap: balance`)}>
        {"Captures du site"}
      </h2>
      <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 1rem`)}>
        {captures.map((c, i) => (
          <li key={c.url} style={css(`display: grid`)}>
            <button type={"button"} onClick={() => setOuverte(i)} aria-haspopup={"dialog"} aria-label={`Agrandir la capture ${i + 1} sur ${n} : ${c.alt}`} style={css(`height: 200px; padding: 0; border-radius: 18px; border: 1px solid var(--bordure); background: var(--fond-section); overflow: hidden; cursor: zoom-in`)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.url} alt={""} loading={"lazy"} style={css(`width: 100%; height: 100%; object-fit: cover; object-position: top; display: block`)} />
            </button>
          </li>
        ))}
      </ul>
      <Visionneuse id={"captures-fenetre"} elements={captures.map((c) => ({ titre: c.alt, type: "image", src: c.url, alt: c.alt }))} index={ouverte} onIndex={setOuverte} noms={NOMS} />
    </section>
  );
}
