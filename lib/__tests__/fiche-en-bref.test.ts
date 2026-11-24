import { describe, expect, it } from "vitest";
import { colonnesEnBref, faitsEnBref, lireEnBref } from "@/lib/en-bref";

describe("bandeau « en bref »", () => {
  it("seulement les champs remplis, dans l'ordre Rôle, Équipe, Durée ; aucun : pas de bandeau", () => {
    expect(faitsEnBref({ role: "UX designer", equipe: "", duree: "4 mois" })).toEqual([
      { libelle: "Rôle", valeur: "UX designer" },
      { libelle: "Durée", valeur: "4 mois" },
    ]);
    expect(faitsEnBref(undefined)).toEqual([]);
    expect(faitsEnBref({ role: "  ", equipe: "", duree: "" })).toEqual([]);
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
