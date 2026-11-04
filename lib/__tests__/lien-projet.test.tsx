import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CarteProjet, NomProjet } from "@/components/proto/LienProjet";

const publics = ["portfolio"];

describe("liens vers un projet", () => {
  it("un projet publié est un lien", () => {
    expect(renderToStaticMarkup(<NomProjet id="portfolio" publics={publics}>Ce portfolio</NomProjet>)).toBe('<a href="/projets/portfolio">Ce portfolio</a>');
    const carte = renderToStaticMarkup(<CarteProjet id="portfolio" publics={publics} style="" suite={<span>Voir le projet →</span>}><h3>Ce portfolio</h3></CarteProjet>);
    expect(carte).toContain('href="/projets/portfolio"');
    expect(carte).toContain("Voir le projet →");
  });
  it("un projet non publié n'est jamais un lien et porte la mention « en cours de validation »", () => {
    expect(renderToStaticMarkup(<NomProjet id="repositionnement-fruggr" publics={publics}>Repositionnement de Fruggr</NomProjet>)).toBe("Repositionnement de Fruggr (en cours de validation)");
    const carte = renderToStaticMarkup(<CarteProjet id="repositionnement-fruggr" publics={publics} style="" suite={<span>Voir le projet →</span>}><h3>Saga</h3></CarteProjet>);
    expect(carte).not.toContain("<a");
    expect(carte).not.toContain("Voir le projet");
    expect(carte).toContain("En cours de validation");
  });
});
