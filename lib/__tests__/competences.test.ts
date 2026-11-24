import { describe, expect, it } from "vitest";
import { ajouterCompetence, cleCompetence, verifierCompetences } from "@/lib/competences";

describe("ajout d'une compétence mise en pratique", () => {
  it("nouvelle compétence : ajoutée et cochée, sans toucher aux existantes", () => {
    const r = ajouterCompetence("  Concevoir   une API REST ", ["Intégrer une maquette"], ["Intégrer une maquette", "Gérer une base de données"]);
    expect(r).toEqual({ ok: true, cochees: ["Intégrer une maquette", "Concevoir une API REST"], message: "« Concevoir une API REST » ajoutée et cochée." });
  });

  it("doublon refusé sans tenir compte de la casse, des accents ni du point final", () => {
    expect(cleCompetence("Gérer une base de données.")).toBe(cleCompetence("GERER UNE BASE DE DONNEES"));
    const r = ajouterCompetence("gerer une base de donnees", ["Gérer une base de données"], []);
    expect(r.ok).toBe(false);
    expect(r.message).toBe("« Gérer une base de données » est déjà cochée.");
  });

  it("compétence déjà proposée mais non cochée : cochée sous son écriture existante", () => {
    const r = ajouterCompetence("intégrer UNE maquette", [], ["Intégrer une maquette"]);
    expect(r.ok && r.cochees).toEqual(["Intégrer une maquette"]);
  });

  it("vide ou plus de 80 caractères : refusé", () => {
    expect(ajouterCompetence("   ", [], []).ok).toBe(false);
    expect(ajouterCompetence("x".repeat(81), [], []).message).toBe("80 caractères au plus (81).");
    expect(ajouterCompetence("x".repeat(80), [], []).ok).toBe(true);
  });
});

describe("contrôle à l'enregistrement", () => {
  it("doublons retirés, première écriture gardée", () => {
    expect(verifierCompetences(["Gérer une base de données", "gerer une base de donnees", " ", "Intégrer une maquette"])).toEqual({ ok: true, data: ["Gérer une base de données", "Intégrer une maquette"] });
  });
  it("plus de 80 caractères : refusé", () => {
    expect(verifierCompetences(["x".repeat(81)]).ok).toBe(false);
  });
});
