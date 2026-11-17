import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CapturesSite } from "@/components/proto/CapturesSite";
import { cleGroupe, filtreDepuisParam, filtresCaptures, groupesDistincts, harmoniserGroupes, normaliserGroupe, slugGroupe } from "@/lib/captures-groupes";

const cap = (n: number, groupe?: string) => ({ url: `/c${n}.png`, alt: `Capture ${n}`, ...(groupe === undefined ? {} : { groupe }) });

describe("normalisation", () => {
  it("retire les espaces en trop et ignore la casse et les accents dans la clé", () => {
    expect(normaliserGroupe("  Module   Budget ")).toBe("Module Budget");
    expect(normaliserGroupe(undefined)).toBe("");
    expect(cleGroupe("Écrans  MOBILE")).toBe(cleGroupe("ecrans mobile"));
    expect(slugGroupe("Écrans mobile / UI")).toBe("ecrans-mobile-ui");
  });

  it("harmonise l'écriture sur la première apparition et retire les groupes vides", () => {
    const r = harmoniserGroupes([cap(1, "Budget"), cap(2, "  budget "), cap(3, "BUDGET"), cap(4, "   "), cap(5)]);
    expect(r.map((c) => c.groupe)).toEqual(["Budget", "Budget", "Budget", undefined, undefined]);
    expect("groupe" in r[3]).toBe(false);
    expect(r[4]).toEqual(cap(5));
  });

  it("propose les groupes distincts dans l'ordre d'apparition", () => {
    expect(groupesDistincts([cap(1, "Courses"), cap(2), cap(3, "Budget"), cap(4, "courses")])).toEqual(["Courses", "Budget"]);
  });
});

describe("filtres", () => {
  it("aucun groupe : pas de filtres", () => {
    expect(filtresCaptures([cap(1), cap(2), cap(3)])).toBeNull();
    expect(filtresCaptures([])).toBeNull();
  });

  it("un seul groupe, même avec des captures sans groupe : pas de filtres", () => {
    expect(filtresCaptures([cap(1, "Budget"), cap(2, "budget ")])).toBeNull();
    expect(filtresCaptures([cap(1, "Budget"), cap(2)])).toBeNull();
  });

  it("plusieurs groupes : ordre de première apparition, ordre manuel des captures et comptage", () => {
    const f = filtresCaptures([cap(1, "TCG"), cap(2, "Budget"), cap(3, "tcg"), cap(4, "Budget"), cap(5, "TCG")])!;
    expect(f.map((x) => x.libelle)).toEqual(["TCG", "Budget"]);
    expect(f.map((x) => x.indices)).toEqual([[0, 2, 4], [1, 3]]);
    expect(f.map((x) => x.slug)).toEqual(["tcg", "budget"]);
  });

  it("captures sans groupe mélangées : rattachées à « Autres », en dernier", () => {
    const f = filtresCaptures([cap(1), cap(2, "Wishlist"), cap(3), cap(4, "Courses")])!;
    expect(f.map((x) => [x.libelle, x.indices.length])).toEqual([
      ["Wishlist", 1],
      ["Courses", 1],
      ["Autres", 2],
    ]);
    expect(f[2].indices).toEqual([0, 2]);
  });

  it("un groupe nommé « Autres » reçoit les captures sans groupe", () => {
    const f = filtresCaptures([cap(1, "autres"), cap(2, "Budget"), cap(3)])!;
    expect(f.map((x) => [x.libelle, x.indices])).toEqual([
      ["autres", [0, 2]],
      ["Budget", [1]],
    ]);
  });

  it("deux libellés de même adresse reçoivent des adresses distinctes", () => {
    const f = filtresCaptures([cap(1, "UI/UX"), cap(2, "UI UX")])!;
    expect(f.map((x) => x.slug)).toEqual(["ui-ux", "ui-ux-2"]);
  });

  it("paramètre d'adresse : connu, inconnu ou absent", () => {
    const f = filtresCaptures([cap(1, "TCG"), cap(2, "Budget")]);
    expect(filtreDepuisParam(f, "budget")?.libelle).toBe("Budget");
    expect(filtreDepuisParam(f, "inconnu")).toBeNull();
    expect(filtreDepuisParam(f, null)).toBeNull();
    expect(filtreDepuisParam(null, "budget")).toBeNull();
  });
});

// Non-régression : rendu de la galerie avant l'ajout des sous-catégories (17 nov. 2026),
// enregistré avec l'ancien composant dans __fixtures__.
describe("galerie sans sous-catégorie", () => {
  const caps = [
    { url: "/a.png", alt: "Accueil de l’application" },
    { url: "/b.png", alt: "", decorative: true },
    { url: "/c.png", alt: "Formulaire de connexion" },
  ];
  const fixture = (nom: string) => readFileSync(`lib/__tests__/__fixtures__/${nom}`, "utf8").trimEnd();

  it("s'affiche à l'identique, sans groupe", () => {
    expect(renderToStaticMarkup(<CapturesSite captures={caps} />)).toBe(fixture("captures-sans-groupe.html"));
    expect(renderToStaticMarkup(<CapturesSite captures={[caps[0]]} />)).toBe(fixture("capture-unique.html"));
  });

  it("s'affiche à l'identique avec un seul groupe", () => {
    expect(renderToStaticMarkup(<CapturesSite captures={caps.map((c) => ({ ...c, groupe: "Module Budget" }))} />)).toBe(fixture("captures-sans-groupe.html"));
  });

  it("affiche les filtres à partir de 2 groupes, toutes les captures visibles au rendu serveur", () => {
    const html = renderToStaticMarkup(<CapturesSite captures={[{ ...caps[0], groupe: "Budget" }, { ...caps[1], groupe: "TCG" }, caps[2]]} />);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain(">Tout (3)</button>");
    expect(html).toContain(">Budget (1)</button>");
    expect(html).toContain(">Autres (1)</button>");
    expect(html.match(/Agrandir la capture/g)).toHaveLength(3);
  });
});
