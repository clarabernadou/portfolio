import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RetourEvaluateur } from "@/components/proto/RetourEvaluateur";
import { colonnesEvaluation, EVALUATION_SOURCE, EVALUATION_VIDE, evaluationAffichee, lignes, lireEvaluation } from "../evaluation";

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
    expect(html).toContain("Soutenance : mai 2025");
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
    expect(html).toContain("Soutenance : juin 2024");
    expect(html).not.toContain("<h3");
    expect(html).not.toContain('role="list"');
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
