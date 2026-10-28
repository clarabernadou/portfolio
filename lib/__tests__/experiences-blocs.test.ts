import { describe, expect, it } from "vitest";
import { experiences } from "../content/experiences";
import { fromBloc, toBloc } from "../admin/experiences";

describe("puces d'expérience : écran ⇄ base", () => {
  it("réenregistrer sans rien changer redonne exactement les puces du CV", () => {
    for (const e of experiences) {
      for (const b of e.blocs) {
        const back = fromBloc(toBloc(b));
        expect(back.bulletsEssentiel).toEqual(b.bulletsEssentiel);
        expect(back.name).toEqual(b.name);
      }
    }
  });

  it("ignore les puces vides et les espaces superflus", () => {
    expect(fromBloc({ name: " Équipe ", period: "", puces: [" A ", "", "B"] })).toEqual({ name: "Équipe", bulletsEssentiel: ["A", "B"] });
  });

  it("ne garde de l'ancienne version complète que les puces du CV", () => {
    const ancien = { bulletsEssentiel: ["A"], bulletsComplet: ["A", "B"], technologies: ["React"] } as unknown as Parameters<typeof toBloc>[0];
    expect(fromBloc(toBloc(ancien))).toEqual({ bulletsEssentiel: ["A"] });
  });
});
