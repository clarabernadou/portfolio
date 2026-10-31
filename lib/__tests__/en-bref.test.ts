import { describe, expect, it } from "vitest";
import { commenceParCadre, enBref, phraseCadre } from "@/lib/data-shared";

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

describe("phraseCadre", () => {
  const formations = [{ intitule: "Développeur Web", nomOfficiel: "Développeur Web d'OpenClassrooms" }, { intitule: "UX Design" }];
  it("donne la même formule pour chaque formation, avec son nom officiel", () => {
    expect(phraseCadre("Développeur Web", formations)).toBe("Projet réalisé dans le cadre de la formation Développeur Web d'OpenClassrooms.");
    expect(phraseCadre("UX Design", formations)).toBe("Projet réalisé dans le cadre de la formation UX Design.");
  });
  it("couvre les cadres hors formation", () => {
    expect(phraseCadre("En entreprise", formations, "Fruggr")).toBe("Projet réalisé dans le cadre de mon alternance chez Fruggr.");
    expect(phraseCadre("Projet personnel", formations)).toBe("Projet personnel, mené seule.");
    expect(phraseCadre("Audit indépendant", formations)).toBe("Audit réalisé en indépendant.");
    expect(phraseCadre("Autre", formations)).toBeNull();
  });
  it("reconnaît un contexte qui commence déjà par la phrase", () => {
    expect(commenceParCadre("Projet personnel,  mené seule. Suite", "Projet personnel, mené seule.")).toBe(true);
    expect(commenceParCadre("Projet réalisé dans le cadre de la formation Développeur Web d’OpenClassrooms. J'ai", "Projet réalisé dans le cadre de la formation Développeur Web d'OpenClassrooms.")).toBe(true);
    expect(commenceParCadre("Dans le cadre de ma formation", "Projet personnel, mené seule.")).toBe(false);
  });
});
