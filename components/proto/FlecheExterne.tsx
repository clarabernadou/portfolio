import { css } from "@/lib/css";

// Indicateur d'un lien qui sort du site ou ouvre un nouvel onglet (20 nov. 2026) : flèche ↗ décorative, et
// « (nouvel onglet) » pour les lecteurs d'écran. Règle de CLAUDE.md : la flèche est réservée à ces liens.
export function FlecheExterne({ taille = 14, onglet = true }: { taille?: number; onglet?: boolean }) {
  return (
    <>
      <svg width={String(taille)} height={String(taille)} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} style={css(`flex-shrink: 0; display: inline-block; vertical-align: -0.1em; margin-left: 4px`)}>
        <path d={"M7 17L17 7M9 7h8v8"} />
      </svg>
      {onglet && <span className={"visuellement-masque"}>{" (nouvel onglet)"}</span>}
    </>
  );
}
