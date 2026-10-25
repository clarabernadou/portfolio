import { describe, expect, it } from "vitest";
import { experiences } from "../content/experiences";
import { fromBloc, toBloc } from "../admin/experiences";

describe("puces d'expérience : écran ⇄ base", () => {
  it("réenregistrer sans rien changer redonne exactement les puces du CV", () => {
    for (const e of experiences) {
      for (const b of e.blocs) {
        const back = fromBloc(toBloc(b));
        expect(back.bulletsEssentiel).toEqual(b.bulletsEssentiel);
        expect(back.bulletsComplet).toEqual(b.bulletsComplet);
        expect(back.name).toEqual(b.name);
        expect(back.technologies ?? []).toEqual(b.technologies ?? []);
      }
    }
  });

  it("une puce commune aux deux versions porte les deux drapeaux", () => {
    const b = toBloc({ bulletsEssentiel: ["A", "C"], bulletsComplet: ["B", "C", "D"] });
    expect(b.puces).toEqual([
      { text: "B", essentiel: false, complet: true },
      { text: "A", essentiel: true, complet: false },
      { text: "C", essentiel: true, complet: true },
      { text: "D", essentiel: false, complet: true },
    ]);
  });
});
