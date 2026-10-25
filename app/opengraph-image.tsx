import { ImageResponse } from "next/og";

// Image de partage (LinkedIn, Google, messageries) de toutes les pages : 1200 × 630,
// aux couleurs du site (dégradé Encre vers Nuit, Lilas). Générée au build.
export const alt = "Clara Bernadou, développeuse front-end & UI/UX designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "linear-gradient(160deg, #1A1033 0%, #2E1065 100%)", color: "#FFFFFF" }}>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#C4B5FD", letterSpacing: 4, textTransform: "uppercase" }}>Portfolio</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>Clara Bernadou</div>
          <div style={{ display: "flex", fontSize: 44, color: "#C4B5FD", lineHeight: 1.2 }}>Développeuse front-end & UI/UX designer</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#FFFFFF" }}>React · TypeScript · Figma · CDI dès mars 2027</div>
      </div>
    ),
    size,
  );
}
