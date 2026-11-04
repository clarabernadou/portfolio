import { describe, expect, it } from "vitest";
import { champsRemplis, lireRetour, pistesRetour, prioriteRecruteur, retourComplet } from "@/lib/retour";

const base = { types: ["Développement"], featured: false, onHome: false, docs: 0, github: false, site: false };

describe("lireRetour", () => {
  it("rend un retour vide pour une colonne absente ou mal formée", () => {
    expect(lireRetour(null)).toEqual({ difficultes: "", appris: "", ameliorations: "" });
    expect(lireRetour({ difficultes: 3, appris: "Oui" })).toEqual({ difficultes: "", appris: "Oui", ameliorations: "" });
  });
  it("compte les champs remplis, sans les espaces seuls", () => {
    const r = lireRetour({ difficultes: "CORS", appris: "  ", ameliorations: "Tests" });
    expect(champsRemplis(r)).toBe(2);
    expect(retourComplet(r)).toBe(false);
    expect(retourComplet({ ...r, appris: "JWT" })).toBe(true);
  });
});

describe("prioriteRecruteur", () => {
  it("place l'entreprise avant un projet personnel, lui-même avant une formation", () => {
    const entreprise = prioriteRecruteur({ ...base, parcours: "En entreprise", date: "été 2026" }).score;
    const perso = prioriteRecruteur({ ...base, parcours: "Projet personnel", date: "sept.–nov. 2023" }).score;
    const formation = prioriteRecruteur({ ...base, parcours: "UX Design", date: "oct. 2026", featured: false }).score;
    expect(entreprise).toBeGreaterThan(perso);
    expect(perso).toBeGreaterThan(formation);
  });
  it("fait passer un projet phare et récent devant un ancien de la même formation", () => {
    const ancien = prioriteRecruteur({ ...base, parcours: "Développeur Web", date: "nov. 2021" });
    const recent = prioriteRecruteur({ ...base, parcours: "Développeur Web", date: "juin 2022", featured: true, github: true });
    expect(recent.score).toBeGreaterThan(ancien.score);
    expect(recent.raisons).toEqual(["Formation Développeur Web", "Projet phare", "Code à montrer"]);
  });
});

describe("pistesRetour", () => {
  const maintenant = new Date("2026-11-04");
  it("pose des questions liées aux technologies du projet, au plus 4 par champ", () => {
    const p = pistesRetour({ tags: ["Angular", "Spring Boot", "Jest", "MySQL", "CSS"], types: ["Développement"], parcours: "Full Stack - Java & Angular", date: "nov. 2024" }, maintenant);
    expect(p.difficultes.some((q) => q.includes("RxJS"))).toBe(true);
    for (const liste of Object.values(p)) expect(liste.length).toBeLessThanOrEqual(4);
    // La question générale reste toujours en dernier.
    expect(p.difficultes.at(-1)).toContain("le plus de temps");
  });
  it("demande le recul sur un projet de plus de 2 ans, et rappelle la confidentialité en entreprise", () => {
    expect(pistesRetour({ tags: [], types: [], parcours: "Développeur Web", date: "nov. 2021" }, maintenant).ameliorations[0]).toContain("niveau actuel");
    expect(pistesRetour({ tags: [], types: [], parcours: "En entreprise", date: "été 2026 · en cours" }, maintenant).difficultes[0]).toContain("confidentiel");
  });
});
