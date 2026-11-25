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

// Bandeau sur toutes les fiches (retour de Clara du 25 novembre 2026) : Type, Cadre et Date depuis l'en-tête, puis Rôle,
// Équipe et Durée quand ils sont remplis.
import { faitsFiche } from "@/lib/en-bref";
describe("faitsFiche", () => {
  it("existe sans Rôle, Équipe ni Durée, et les ajoute quand ils sont remplis", () => {
    expect(faitsFiche({ types: ["Développement"], parcours: "Bachelor UX", date: "mars 2025" }, undefined)).toEqual([
      { libelle: "Type", valeur: "Développement" },
      { libelle: "Cadre", valeur: "Bachelor UX" },
      { libelle: "Date", valeur: "mars 2025" },
    ]);
    expect(
      faitsFiche({ types: ["Développement", "UX / UI"], parcours: "", date: "2026 · en cours" }, { role: "Développeuse", equipe: "En solo", duree: "" }),
    ).toEqual([
      { libelle: "Types", valeur: "Développement, UX / UI" },
      { libelle: "Date", valeur: "2026 · en cours" },
      { libelle: "Rôle", valeur: "Développeuse" },
      { libelle: "Équipe", valeur: "En solo" },
    ]);
  });
});
