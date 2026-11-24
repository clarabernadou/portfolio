import { describe, expect, it } from "vitest";
import { coteAuContexte, hauteurCompetences, hauteurContexte } from "@/lib/fiche-disposition";

const phrase = (n: number) => "x".repeat(n);
// Contexte type : une ligne d'introduction et un paragraphe de 4 lignes (241 px mesurés à 1280 px).
const CTX = `${phrase(70)}\n\n${phrase(300)}`;

describe("estimations calibrées sur les fiches en ligne (1280 px)", () => {
  it("contexte et compétences", () => {
    expect(hauteurContexte(CTX)).toBe(241);
    expect(hauteurCompetences([phrase(55)])).toBe(170); // Les Bambinets
    expect(hauteurCompetences([phrase(41), phrase(47)])).toBe(204); // Bobapp
  });
});

describe("colonne de droite à côté du contexte", () => {
  it("compétences plus courtes que le contexte : côte à côte", () => {
    expect(coteAuContexte({ ctx: CTX, etapes: [], competences: [phrase(36), phrase(70)] })).toBe(true);
  });

  it("compétences plus hautes que le contexte (Groupomania, 5 compétences) : pleine largeur", () => {
    expect(coteAuContexte({ ctx: CTX, etapes: [], competences: [phrase(21), phrase(36), phrase(33), phrase(25), phrase(30)] })).toBe(false);
  });

  it("plus de 6 éléments : toujours pleine largeur", () => {
    expect(coteAuContexte({ ctx: phrase(3000), etapes: Array(7).fill("Étape"), competences: [] })).toBe(false);
  });

  it("sans contexte ou sans liste : rien à côté", () => {
    expect(coteAuContexte({ ctx: "", etapes: ["Étape"], competences: [] })).toBe(false);
    expect(coteAuContexte({ ctx: CTX, etapes: [], competences: [] })).toBe(false);
  });

  it("le gras et l'italique ne comptent pas dans la longueur", () => {
    expect(hauteurContexte(`**${phrase(84)}**`)).toBe(hauteurContexte(phrase(84)));
  });
});
