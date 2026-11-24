import { describe, expect, it } from "vitest";
import { colonnesEnBref, faitsEnBref, lireEnBref } from "@/lib/en-bref";

describe("bandeau « en bref »", () => {
  it("Cadre d'abord, puis seulement les champs remplis, dans l'ordre Rôle, Équipe, Durée", () => {
    expect(faitsEnBref("UX Design", { role: "UX designer", equipe: "", duree: "4 mois" })).toEqual([
      { libelle: "Cadre", valeur: "UX Design" },
      { libelle: "Rôle", valeur: "UX designer" },
      { libelle: "Durée", valeur: "4 mois" },
    ]);
    expect(faitsEnBref("Projet perso", undefined)).toEqual([{ libelle: "Cadre", valeur: "Projet perso" }]);
  });

  it("lecture des colonnes nulles", () => {
    expect(lireEnBref({ role: null, equipe: "En solo" })).toEqual({ role: "", equipe: "En solo", duree: "" });
  });

  it("enregistrement : espaces nettoyés, champ vide à null, limite refusée", () => {
    expect(colonnesEnBref({ role: "  Développeuse   front-end ", equipe: "", duree: "6 semaines" })).toEqual({
      ok: true,
      data: { role: "Développeuse front-end", equipe: null, duree: "6 semaines" },
    });
    const r = colonnesEnBref({ role: "x".repeat(81), equipe: "", duree: "" });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toBe("« Rôle » dépasse 80 caractères (81).");
    expect(colonnesEnBref({ duree: "x".repeat(41) }).ok).toBe(false);
  });
});
