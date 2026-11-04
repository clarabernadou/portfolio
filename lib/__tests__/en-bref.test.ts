import { describe, expect, it } from "vitest";
import { avecCompteProjets, commenceParCadre, enBref, ligneFormation, phraseCadre } from "@/lib/data-shared";

const formations = [
  { intitule: "UX Design", projets: "Fin prévue en 2027", diplome: "Bac+3/4", statut: "En cours" as const },
  { intitule: "Full Stack - Java & Angular", projets: "", diplome: "Bac+5", statut: "Obtenu" as const },
  { intitule: "Application - JavaScript & React", projets: "", diplome: "Bac+3/4", statut: "Obtenu" as const },
  { intitule: "Développeur Web", projets: "", diplome: "Bac+2", statut: "Obtenu" as const },
];
const publics = [
  ...Array.from({ length: 11 }, () => ({ parcours: "Full Stack - Java & Angular" })),
  { parcours: "Développeur Web" },
  { parcours: "UX Design" },
  { parcours: "Projet personnel" },
];

describe("enBref", () => {
  it("compte les projets publiés, ceux de /projets", () => {
    expect(enBref(formations, publics).projets).toEqual({ valeur: "14", libelle: "projets" });
  });
  it("met en avant le plus haut diplôme obtenu et sa formation", () => {
    expect(enBref(formations, []).titres).toEqual({ valeur: "Bac+5", libelle: "Full Stack Java & Angular" });
  });
  it("ignore un diplôme en cours", () => {
    expect(enBref([{ ...formations[1], statut: "En cours" as const }, formations[3]], []).titres?.valeur).toBe("Bac+2");
  });
  it("masque les cases sans donnée", () => {
    expect(enBref([], [])).toEqual({ projets: null, titres: null });
  });
});

describe("avecCompteProjets", () => {
  const [ux, fs, react, web] = avecCompteProjets(formations, publics);
  it("donne à chaque formation le nombre de ses projets publiés, comme le filtre de /projets", () => {
    expect(fs.projets).toBe("11 projets");
    expect(web.projets).toBe("1 projet");
  });
  it("garde la mention saisie dans l'administration à la place du nombre", () => {
    expect(ux.projets).toBe("Fin prévue en 2027");
  });
  it("laisse la ligne vide sans projet publié, sans séparateur orphelin", () => {
    expect(react.projets).toBe("");
    expect(ligneFormation({ niveauComplet: "OpenClassrooms · Titre RNCP niveau 6", projets: react.projets })).toBe("OpenClassrooms · Titre RNCP niveau 6");
    expect(ligneFormation({ niveauComplet: "OpenClassrooms", projets: fs.projets })).toBe("OpenClassrooms · 11 projets");
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
