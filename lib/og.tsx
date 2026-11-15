import { ImageResponse } from "next/og";

// Images de partage (LinkedIn, Google, messageries), 1200 × 630, aux couleurs du site (dégradé Encre
// vers Nuit, Lilas). Depuis le 13 nov. 2026, chaque page a la sienne, avec son titre : son texte
// alternatif (og:image:alt) décrit donc vraiment l'image de la page (choix de Clara).
export const OG_TAILLE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

export const ogAlt = (titre: string, sousTitre: string) => `${titre} : ${sousTitre}. Portfolio de Clara Bernadou, développeuse full stack.`;

export function ogImage(titre: string, sousTitre: string) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "linear-gradient(160deg, #1A1033 0%, #2E1065 100%)", color: "#FFFFFF" }}>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#C4B5FD", letterSpacing: 4, textTransform: "uppercase" }}>Clara Bernadou · Portfolio</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: titre.length > 22 ? 72 : 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05 }}>{titre}</div>
          <div style={{ display: "flex", fontSize: 44, color: "#C4B5FD", lineHeight: 1.2 }}>{sousTitre}</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#FFFFFF" }}>Développeuse full stack · CDI dès mars 2027</div>
      </div>
    ),
    OG_TAILLE,
  );
}

// Fichier opengraph-image d'une page fixe : alt, taille, type et image.
export function ogPage(titre: string, sousTitre: string) {
  return { alt: ogAlt(titre, sousTitre), size: OG_TAILLE, contentType: OG_TYPE, image: () => ogImage(titre, sousTitre) };
}
