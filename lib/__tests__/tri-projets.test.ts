import { describe, expect, it } from "vitest";
import { cleDate, trier } from "@/lib/admin/projects";

describe("cleDate", () => {
  it("lit le mois et l'année", () => {
    expect(cleDate("oct. 2026")).toBe(2026 * 12 + 9);
    expect(cleDate("août 2026")).toBe(2026 * 12 + 7);
    expect(cleDate("déc. 2021")).toBe(2021 * 12 + 11);
  });
  it("prend la plus récente des dates d'une période", () => {
    expect(cleDate("mars 2025 – juin 2026")).toBe(2026 * 12 + 5);
  });
  it("comprend les saisons et ignore les mentions qui suivent", () => {
    expect(cleDate("été 2026 · en cours")).toBe(2026 * 12 + 6);
    expect(cleDate("oct. 2026 · soutenance planifiée")).toBe(2026 * 12 + 9);
  });
  it("renvoie null sans année", () => {
    expect(cleDate("projet perso")).toBeNull();
  });
});

describe("trier", () => {
  const p = [
    { name: "Kasa", date: "mars 2023" },
    { name: "Avenirs", date: "oct. 2026" },
    { name: "WatchedThis", date: "projet perso" },
    { name: "écho", date: "juin 2024" },
  ];
  const noms = (l: typeof p) => l.map((x) => x.name);
  it("trie par nom, sans tenir compte des accents ni des majuscules", () => {
    expect(noms(trier(p, "nom"))).toEqual(["Avenirs", "écho", "Kasa", "WatchedThis"]);
    expect(noms(trier(p, "nom-desc"))).toEqual(["WatchedThis", "Kasa", "écho", "Avenirs"]);
  });
  it("trie par date dans les deux sens, les projets sans date à la fin", () => {
    expect(noms(trier(p, "date-desc"))).toEqual(["Avenirs", "écho", "Kasa", "WatchedThis"]);
    expect(noms(trier(p, "date"))).toEqual(["Kasa", "écho", "Avenirs", "WatchedThis"]);
  });
  it("garde l'ordre du site sans tri ou avec un tri inconnu", () => {
    expect(noms(trier(p, undefined))).toEqual(noms(p));
    expect(noms(trier(p, "nimporte"))).toEqual(noms(p));
  });
});
