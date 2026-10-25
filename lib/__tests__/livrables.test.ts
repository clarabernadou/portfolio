import { describe, expect, it } from "vitest";
import { ACCEPT_LIVRABLES, estImage, formatLivrable, MIME_LIVRABLES } from "../livrables";

describe("formats de livrables", () => {
  it("reconnaît le format d'après l'adresse, même avec une page ou des paramètres", () => {
    expect(formatLivrable("/livrables/Livrables_UX_Designer_2.pdf#page=102")).toBe("PDF");
    expect(formatLivrable("https://x.public.blob.vercel-storage.com/livrables/p/maquette-Ab12.PNG")).toBe("Image");
    expect(formatLivrable("/livrables/rapport.docx?download=1")).toBe("Document");
    expect(formatLivrable("/livrables/soutenance.pptx")).toBe("Présentation");
    expect(formatLivrable("/livrables/demo.mp4")).toBe("Vidéo");
    expect(formatLivrable("/livrables/maquette.fig")).toBe("FIG");
    expect(formatLivrable(null)).toBe("Fichier");
    expect(formatLivrable("https://github.com/clarabernadou/ClaraBernadou_P7_Frontend_28032022")).toBe("GitHub");
    expect(formatLivrable("https://www.figma.com/design/abc/Maquette")).toBe("Figma");
  });

  it("utilise une image comme son propre aperçu", () => {
    expect(estImage("/livrables/ecran.jpg")).toBe(true);
    expect(estImage("/livrables/rapport.pdf")).toBe(false);
  });

  it("n'accepte ni HTML, ni SVG, ni script à l'envoi", () => {
    expect(MIME_LIVRABLES).toContain("application/pdf");
    expect(MIME_LIVRABLES).toContain("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(MIME_LIVRABLES.some((m) => /html|svg|javascript/.test(m))).toBe(false);
    expect(ACCEPT_LIVRABLES).toContain(".docx");
  });
});
