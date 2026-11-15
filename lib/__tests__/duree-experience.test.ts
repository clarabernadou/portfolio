import { describe, expect, it } from "vitest";
import { dureeAlternance } from "../data-shared";

// Date figée : 13 novembre 2026.
const nov2026 = new Date(2026, 10, 13);

describe("durée d'expérience de l'accueil", () => {
  it("TechUpClimate puis Digital4Better : 2 ans et 11 mois au 13 nov. 2026", () => {
    const exp = [{ periode: "mars 2025 – aujourd’hui" }, { periode: "décembre 2023 – mars 2025" }];
    expect(dureeAlternance(exp, nov2026)).toEqual({ ans: 2, mois: 11 });
  });
  it("ne compte pas deux fois un chevauchement", () => {
    const exp = [{ periode: "janv. 2025 – juin 2025" }, { periode: "mars 2025 – sept. 2025" }];
    expect(dureeAlternance(exp, nov2026)).toEqual({ ans: 0, mois: 8 });
  });
  it("ne compte pas un trou entre deux contrats", () => {
    const exp = [{ periode: "janv. 2024 – juil. 2024" }, { periode: "janvier 2025 – juillet 2025" }];
    expect(dureeAlternance(exp, nov2026)).toEqual({ ans: 1, mois: 0 });
  });
  it("accepte les mois abrégés et en toutes lettres", () => {
    expect(dureeAlternance([{ periode: "déc. 2023 – mars 2025" }], nov2026)).toEqual({ ans: 1, mois: 3 });
    expect(dureeAlternance([{ periode: "juillet 2025 – aujourd’hui" }], nov2026)).toEqual({ ans: 1, mois: 4 });
  });
});
