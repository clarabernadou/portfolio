import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CapturesSite } from "@/components/proto/CapturesSite";
import { erreurLegende, LEGENDE_MAX, legendeAffichee } from "../captures-legende";

describe("légende des captures", () => {
  it("n'affiche rien pour une légende vide ou une image décorative", () => {
    expect(legendeAffichee({ legende: "  " })).toBeNull();
    expect(legendeAffichee({})).toBeNull();
    expect(legendeAffichee({ legende: "Budget du mois", decorative: true })).toBeNull();
    expect(legendeAffichee({ legende: "  Budget du mois " })).toBe("Budget du mois");
  });

  it("refuse une légende de plus de 160 caractères", () => {
    expect(erreurLegende([{ legende: "a".repeat(LEGENDE_MAX) }])).toBeNull();
    expect(erreurLegende([{ legende: "ok" }, { legende: "a".repeat(LEGENDE_MAX + 1) }])).toContain("capture 2");
    expect(erreurLegende([{ legende: "a".repeat(LEGENDE_MAX + 1), decorative: true }])).toBeNull();
  });

  it("relie la légende à l'image (figure, aria-label, figcaption), le texte alternatif inchangé", () => {
    const html = renderToStaticMarkup(
      <CapturesSite captures={[{ url: "/a.png", alt: "Écran Budget", legende: "Le budget du mois" }, { url: "/b.png", alt: "Écran TCG" }, { url: "/c.png", alt: "", decorative: true, legende: "Ne doit pas s'afficher" }]} />,
    );
    expect(html).toContain('<figure role="figure" aria-label="Le budget du mois"');
    expect(html).toContain(">Le budget du mois</figcaption>");
    expect(html).toContain('aria-label="Agrandir la capture 1 sur 3 : Écran Budget"');
    expect(html.match(/<figure/g)).toHaveLength(1);
    expect(html).not.toContain("Ne doit pas s");
  });
});
