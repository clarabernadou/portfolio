import { describe, expect, it } from "vitest";
import { extraireProposition, promptAvis } from "../admin/avis-ia";

describe("avis de l'IA", () => {
  const ctx = { page: "Fiche projet « WatchedThis » · Projet personnel", champ: "Accroche", max: 140, infos: "Tags : React, Redux" };

  it("met dans le prompt le texte, son emplacement, sa limite et la règle de ne rien inventer", () => {
    const p = promptAvis("Suivi de films et séries.", ctx, "tech");
    expect(p).toContain("<<<TEXTE\nSuivi de films et séries.\nTEXTE>>>");
    expect(p).toContain("Fiche projet « WatchedThis »");
    expect(p).toContain("au plus 140 caractères");
    expect(p).toContain("Ne rien inventer");
    expect(p).toContain("lead développeur");
    expect(p).toContain("Tags : React, Redux");
  });

  it("change de point de vue selon le recruteur choisi", () => {
    expect(promptAvis("x", ctx, "design")).toContain("UX lead");
    expect(promptAvis("x", ctx, "hybride")).toContain("profils hybrides");
  });

  it("extrait la version proposée de la réponse recollée", () => {
    const reponse = "**Verdict** : correct.\n\n**Version proposée** :\n<<<PROPOSITION\nApplication de suivi de films et séries, développée seule en React.\nPROPOSITION>>>\n\n**Longueur** : 68";
    expect(extraireProposition(reponse)).toBe("Application de suivi de films et séries, développée seule en React.");
  });

  it("renvoie null quand les marqueurs manquent", () => {
    expect(extraireProposition("Voici une version : blabla")).toBeNull();
  });
});
