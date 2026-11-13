import { describe, expect, it } from "vitest";
import { dureeAlternance } from "../data-shared";

describe("durée d'expérience de l'accueil", () => {
  const nov2026 = new Date(2026, 10, 13);
  it("part de la plus ancienne expérience, mois en toutes lettres", () => {
    expect(dureeAlternance([{ periode: "mars 2025 – aujourd’hui" }, { periode: "décembre 2023 – mars 2025" }], nov2026)).toEqual({ ans: 2, mois: 11 });
  });
  it("accepte aussi les mois abrégés", () => {
    expect(dureeAlternance([{ periode: "déc. 2023 – mars 2025" }], nov2026)).toEqual({ ans: 2, mois: 11 });
    expect(dureeAlternance([{ periode: "juillet 2025 – aujourd’hui" }], nov2026)).toEqual({ ans: 1, mois: 4 });
  });
});
