import { describe, expect, it } from "vitest";
import { enBref } from "@/lib/data-shared";

const formations = [
  { projets: "8 projets validés sur 11", diplome: "Bac+3/4", statut: "En cours" as const, annees: "2025 – 2027" },
  { projets: "13 projets réalisés", diplome: "Bac+5", statut: "Obtenu" as const, annees: "2023 – 2025" },
  { projets: "14 projets réalisés", diplome: "Bac+3/4", statut: "Obtenu" as const, annees: "2022 – 2023" },
  { projets: "7 projets réalisés", diplome: "Bac+2", statut: "Obtenu" as const, annees: "2021 – 2022" },
];

describe("enBref", () => {
  it("additionne les projets des formations (premier nombre) et les projets hors formation", () => {
    expect(enBref(formations, { horsFormation: 7 }).projets).toEqual({ valeur: "49", libelle: "projets" });
  });
  it("résume les titres, du plus bas au plus haut niveau, avec ceux en cours et le début", () => {
    expect(enBref(formations, { horsFormation: 0 }, "oct. 2021").titres).toEqual({
      valeur: "4 titres",
      libelle: "RNCP, du Bac+2 au Bac+5, dont 1 en cours · en formation depuis oct. 2021",
    });
  });
  it("prend l'année de la première formation sans date de début précise", () => {
    expect(enBref(formations, { horsFormation: 0 }).titres?.libelle).toMatch(/en formation depuis 2021$/);
  });
  it("masque les cases sans donnée", () => {
    expect(enBref([], { horsFormation: 0 })).toEqual({ projets: null, titres: null });
  });
});
