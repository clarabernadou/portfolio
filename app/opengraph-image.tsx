import { ImageResponse } from "next/og";
import { OG_TAILLE } from "@/lib/og";

// Image de partage de l'accueil (et des pages sans image propre) : 1200 × 630, aux couleurs du site.
export const alt = "Clara Bernadou, développeuse full stack : portfolio. React, TypeScript, Node.js, CDI dès mars 2027.";
export const size = OG_TAILLE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "linear-gradient(160deg, #1A1033 0%, #2E1065 100%)", color: "#FFFFFF" }}>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#C4B5FD", letterSpacing: 4, textTransform: "uppercase" }}>Portfolio</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>Clara Bernadou</div>
          <div style={{ display: "flex", fontSize: 44, color: "#C4B5FD", lineHeight: 1.2 }}>Développeuse full stack</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#FFFFFF" }}>React · TypeScript · Node.js · CDI dès mars 2027</div>
      </div>
    ),
    size,
  );
}
