import { describe, expect, it } from "vitest";
import { DEBUT_EXPERIENCE, dureeAlternance, dureeDepuis } from "../data-shared";

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

describe("durée depuis le 4 décembre 2023 (27 nov. 2026)", () => {
  it("2 ans et 11 mois le 27 nov. 2026, 3 ans le 4 déc. 2026, pas la veille", () => {
    expect(dureeDepuis(DEBUT_EXPERIENCE, new Date(2026, 10, 27))).toEqual({ ans: 2, mois: 11 });
    expect(dureeDepuis(DEBUT_EXPERIENCE, new Date(2026, 11, 3))).toEqual({ ans: 2, mois: 11 });
    expect(dureeDepuis(DEBUT_EXPERIENCE, new Date(2026, 11, 4))).toEqual({ ans: 3, mois: 0 });
    expect(dureeDepuis(DEBUT_EXPERIENCE, new Date(2027, 2, 15))).toEqual({ ans: 3, mois: 3 });
  });
  it("avant le premier mois complet : rien", () => {
    expect(dureeDepuis(DEBUT_EXPERIENCE, new Date(2023, 11, 20))).toBeNull();
  });
});
