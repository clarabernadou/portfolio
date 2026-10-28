import { describe, expect, it } from "vitest";
import { extraireFiche, extraireProposition, memeTexte, normaliserFiche, promptAvis, promptFiche } from "../admin/avis-ia";

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

  describe("fiche entière", () => {
    const fiche = {
      objet: "projet" as const,
      page: "Fiche projet « Booki »",
      champs: [
        { cle: "accroche", champ: "Accroche", max: 140, role: "une phrase", valeur: "Page d'accueil." },
        { cle: "contexte", champ: "Contexte", max: 500, role: "un paragraphe", valeur: "" },
      ],
      tags: ["HTML", "CSS"],
    };

    it("ne demande que les champs fournis, avec leur limite", () => {
      const p = promptFiche(fiche, "tech");
      expect(p).toContain("<<<ACCROCHE\nPage d'accueil.\nACCROCHE>>>");
      expect(p).toContain("<<<CONTEXTE\n(champ vide)\nCONTEXTE>>>");
      expect(p).toContain("au plus 500 caractères");
      expect(p).not.toContain("<<<CARTE");
      expect(p).toContain("Ne rien inventer");
      expect(p).toContain("<<<TAGS");
    });

    it("garde les propositions des champs demandés et écarte les tags déjà présents", () => {
      const avis = normaliserFiche(
        {
          verdict: "Court.",
          pointsForts: [],
          aAmeliorer: [],
          questions: ["Aucune"],
          champs: [
            { cle: "accroche", proposition: " Intégration. ", nonSourcees: [] },
            { cle: "contexte", proposition: "Détail.", nonSourcees: ["Responsive"] },
            { cle: "carte", proposition: "Hors sujet", nonSourcees: [] },
          ],
          tagsProposes: ["css", "Flexbox", "Flexbox"],
        },
        fiche,
      );
      expect(avis?.champs).toEqual({ accroche: { proposition: "Intégration.", nonSourcees: [] }, contexte: { proposition: "Détail.", nonSourcees: ["Responsive"] } });
      expect(avis?.tagsProposes).toEqual(["Flexbox"]);
      expect(avis?.questions).toEqual([]);
    });

    it("refuse une réponse sans aucune proposition", () => {
      expect(normaliserFiche({ verdict: "x", champs: [{ cle: "accroche", proposition: "" }] }, fiche)).toBeNull();
    });

    it("extrait les propositions et les tags d'une réponse de Claude recollée", () => {
      const r = extraireFiche("**Propositions**\n<<<ACCROCHE\nIntégration HTML et CSS.\nACCROCHE>>>\n<<<TAGS\nFlexbox, HTML\nTAGS>>>", fiche);
      expect(r).toEqual({ champs: { accroche: { proposition: "Intégration HTML et CSS.", nonSourcees: [] } }, tagsProposes: ["Flexbox"] });
      expect(extraireFiche("rien", fiche)).toBeNull();
    });

    it("ne compte pas comme une proposition un simple point final ou une autre apostrophe", () => {
      expect(memeTexte("Refonte de la page d’accueil", "Refonte de la page d'accueil.")).toBe(true);
      expect(memeTexte("Refonte de la page", "Refonte de la navigation")).toBe(false);
    });

    it("pour une expérience : une proposition par puce, sans tags", () => {
      const exp = { objet: "experience" as const, page: "Expérience « Fruggr »", champs: [{ cle: "puce-1-2", champ: "Bloc 1 · puce 2", max: 220, role: "une puce", valeur: "Refonte." }] };
      const p = promptFiche(exp, "hybride");
      expect(p).toContain("<<<PUCE-1-2\nRefonte.\nPUCE-1-2>>>");
      expect(p).toContain("n'ajoute aucune puce");
      expect(p).not.toContain("<<<TAGS");
      expect(extraireFiche("<<<PUCE-1-2\nRefonte de la navigation.\nPUCE-1-2>>>\n<<<TAGS\nReact\nTAGS>>>", exp)).toEqual({ champs: { "puce-1-2": { proposition: "Refonte de la navigation.", nonSourcees: [] } }, tagsProposes: [] });
    });
  });
});
