import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RetourEvaluateur } from "@/components/proto/RetourEvaluateur";
import { colonnesEvaluation, datePrecise, EVALUATION_SOURCE, EVALUATION_VIDE, evaluationAffichee, ligneSoutenance, lignes, lireEvaluation, moisDeSoutenance } from "../evaluation";

const rendu = (e: Parameters<typeof RetourEvaluateur>[0]["evaluation"]) => renderToStaticMarkup(<RetourEvaluateur evaluation={e} />);

describe("retour de l'évaluateur : rendu conditionnel", () => {
  it("n'affiche rien quand tous les champs sont vides, absents ou blancs", () => {
    expect(rendu(null)).toBe("");
    expect(rendu(undefined)).toBe("");
    expect(rendu(EVALUATION_VIDE)).toBe("");
    expect(rendu({ mois: "  ", pointsForts: "\n\n", axes: "", remarque: " " })).toBe("");
    expect(evaluationAffichee(lireEvaluation({ evaluationMois: null, evaluationPointsForts: null }))).toBeNull();
  });

  it("affiche le titre h2, un h3 par champ rempli et la mention de source", () => {
    const html = rendu({ mois: "mai 2025", pointsForts: "Code clair et commenté.", axes: "", remarque: "Présentation fluide." });
    expect(html).toContain('<h2 id="retour-evaluateur"');
    expect(html).toContain("Retour de l’évaluateur</h2>");
    expect(html).toContain("Soutenance réalisée en mai 2025");
    expect(html).toContain(">Points forts</h3>");
    expect(html).toContain(">Remarque sur la soutenance</h3>");
    expect(html).not.toContain("Axes d’amélioration");
    expect(html).toContain(EVALUATION_SOURCE);
    expect(html.indexOf(EVALUATION_SOURCE)).toBeGreaterThan(html.lastIndexOf("</ul>"));
  });

  it("une ligne donne un paragraphe, plusieurs lignes une liste (puces de tête retirées)", () => {
    const une = rendu({ ...EVALUATION_VIDE, pointsForts: "Bonne maîtrise de React." });
    expect(une).toContain("<p");
    expect(une).not.toContain("<li style=\"margin");
    const plusieurs = rendu({ ...EVALUATION_VIDE, pointsForts: "- Tests complets\n\n• Code lisible\nBonne gestion du temps", axes: "Documenter l’API\nAjouter des tests de bout en bout" });
    expect(plusieurs.match(/<li style="margin/g)).toHaveLength(5);
    expect(plusieurs).toContain(">Tests complets</li>");
    expect(plusieurs).toContain(">Code lisible</li>");
  });

  it("le mois seul suffit à afficher le bloc, sans carte vide", () => {
    const html = rendu({ ...EVALUATION_VIDE, mois: "juin 2024" });
    expect(html).toContain("Soutenance réalisée en juin 2024");
    expect(html).not.toContain("<h3");
    expect(html).not.toContain('role="list"');
    // Mention de la source seulement s'il y a au moins une carte (25 nov. 2026).
    expect(html).not.toContain(EVALUATION_SOURCE);
  });

  it("mention reproduite telle quelle, jamais « reformulée »", () => {
    expect(EVALUATION_SOURCE).toBe("Évaluation de soutenance OpenClassrooms, reproduite telle quelle.");
    expect(rendu({ ...EVALUATION_VIDE, remarque: "Bien." })).not.toContain("reformul");
  });

  it("date de soutenance : précise ou mois seul, rien ne casse sur l'existant", () => {
    expect(ligneSoutenance("2026-10-20")).toBe("Soutenance réalisée le 20 octobre 2026");
    expect(ligneSoutenance("2026-10-01")).toBe("Soutenance réalisée le 1er octobre 2026");
    expect(ligneSoutenance("octobre 2026")).toBe("Soutenance réalisée en octobre 2026");
    expect(datePrecise("2026-02-30")).toBeNull();
    expect(moisDeSoutenance("2026-10-20")).toBe("octobre 2026");
    expect(moisDeSoutenance("juin 2023")).toBe("juin 2023");
  });

  it("disposition : Points forts et Axes côte à côte, Remarque en pleine largeur ; une liste seule, pleine largeur", () => {
    const tous = rendu({ ...EVALUATION_VIDE, pointsForts: "A", axes: "B", remarque: "C" });
    expect(tous).toContain("eval-grille eval-paire");
    expect(tous).toContain('class="eval-remarque"');
    expect(tous.indexOf("Points forts")).toBeLessThan(tous.indexOf("Axes d’amélioration"));
    expect(tous.indexOf("Axes d’amélioration")).toBeLessThan(tous.indexOf("Remarque sur la soutenance"));
    expect(rendu({ ...EVALUATION_VIDE, axes: "B", remarque: "C" })).toMatch(/class="liste-nue eval-grille"/);
    expect(rendu({ ...EVALUATION_VIDE, pointsForts: "A" })).toMatch(/class="liste-nue eval-grille"/);
    expect(rendu({ ...EVALUATION_VIDE, pointsForts: "A", axes: "B" })).toContain("eval-grille eval-paire");
    expect(rendu({ ...EVALUATION_VIDE, remarque: "C" })).toMatch(/class="liste-nue eval-grille"/);
  });

  it("découpe les lignes", () => {
    expect(lignes(" a \n\n- b\r\n•  c ")).toEqual(["a", "b", "c"]);
  });
});

describe("retour de l'évaluateur : enregistrement", () => {
  it("nettoie les champs et enregistre null pour un champ vide", () => {
    const r = colonnesEvaluation({ mois: " mai 2025 ", pointsForts: "Clair", axes: "  ", remarque: "" });
    expect(r).toEqual({ ok: true, data: { evaluationMois: "mai 2025", evaluationPointsForts: "Clair", evaluationAxes: null, evaluationRemarque: null } });
  });

  it("refuse un champ au-delà de sa limite (600, 600, 400, 40)", () => {
    expect(colonnesEvaluation({ pointsForts: "a".repeat(600), remarque: "b".repeat(400), mois: "c".repeat(40) }).ok).toBe(true);
    expect(colonnesEvaluation({ pointsForts: "a".repeat(601) })).toMatchObject({ ok: false, error: expect.stringContaining("Points forts") });
    expect(colonnesEvaluation({ axes: "a".repeat(601) }).ok).toBe(false);
    expect(colonnesEvaluation({ remarque: "a".repeat(401) }).ok).toBe(false);
    expect(colonnesEvaluation({ mois: "a".repeat(41) }).ok).toBe(false);
  });
});
