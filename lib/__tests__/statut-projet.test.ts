import { describe, expect, it } from "vitest";
import { messageEnregistrement, statusAEnregistrer, statutFiche } from "../admin/statut-projet";

// Statut enregistré selon le bouton, puis statut et message affichés.
const apres = (bouton: "published" | "draft", visible: boolean, existant: string | null) => {
  const status = statusAEnregistrer(bouton, visible, existant);
  const statut = statutFiche(status, visible);
  return { statut, message: messageEnregistrement(statut) };
};

describe("statut d'une fiche après enregistrement", () => {
  it("une fiche Privé reste Privé avec les deux boutons", () => {
    expect(apres("published", false, "published")).toEqual({ statut: "prive", message: "Fiche enregistrée, statut : Privé" });
    expect(apres("draft", false, "published")).toEqual({ statut: "prive", message: "Fiche enregistrée, statut : Privé" });
  });

  it("« Projet publié. » seulement pour une fiche publique", () => {
    expect(apres("published", true, "published")).toEqual({ statut: "publie", message: "Projet publié." });
    expect(apres("published", true, "draft")).toEqual({ statut: "publie", message: "Projet publié." });
    expect(apres("published", true, null)).toEqual({ statut: "publie", message: "Projet publié." });
  });

  it("« Enregistrer le brouillon » garde son effet hors fiche Privé", () => {
    expect(apres("draft", true, "published")).toEqual({ statut: "brouillon", message: "Brouillon enregistré." });
    expect(apres("draft", true, "draft")).toEqual({ statut: "brouillon", message: "Brouillon enregistré." });
    // Brouillon masqué, ou nouveau projet masqué : reste un brouillon.
    expect(apres("draft", false, "draft").statut).toBe("brouillon");
    expect(apres("draft", false, null).statut).toBe("brouillon");
  });

  it("« Publier » sur un brouillon masqué donne une fiche Privé, annoncée comme telle", () => {
    expect(apres("published", false, "draft")).toEqual({ statut: "prive", message: "Fiche enregistrée, statut : Privé" });
  });
});
