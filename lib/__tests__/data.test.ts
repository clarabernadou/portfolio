import { describe, expect, it } from "vitest";
import { getAllProjects, getFeaturedProjects, getHomeProjects } from "../projects";
import { getIaContent } from "../ia";
import { experiences } from "../content/experiences";
import { formations } from "../content/formations";
import { recommendations } from "../content/recommendations";

// Vérifications de la couche de données (étape 3, README §3/§7).
describe("couche de données", () => {
  it("compte 40 projets, 3 phares, 9 à l’accueil", () => {
    expect(getAllProjects()).toHaveLength(40);
    expect(getFeaturedProjects()).toHaveLength(3);
    expect(getHomeProjects()).toHaveLength(9);
  });

  it("les projets phares sont Ce portfolio, WatchedThis, IntuitLearn", () => {
    const ids = getFeaturedProjects().map((p) => p.id).sort();
    expect(ids).toEqual(["intuitlearn", "portfolio", "watchedthis"].sort());
  });

  it("charge le contenu IA (6 skills, 3 routines)", () => {
    const ia = getIaContent();
    expect(ia.skills).toHaveLength(6);
    expect(ia.routines).toHaveLength(3);
  });

  it("charge 2 expériences, 4 formations, 3 recommandations", () => {
    expect(experiences).toHaveLength(2);
    expect(formations).toHaveLength(4);
    expect(recommendations).toHaveLength(3);
  });

  it("résout les liens d’entreprise des expériences", () => {
    for (const exp of experiences) {
      expect(exp.entrepriseHref).not.toBe("#");
    }
  });
});
