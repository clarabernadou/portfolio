import { describe, expect, it } from "vitest";
import { isAdminGithubId } from "../admin-id";

describe("isAdminGithubId", () => {
  it("accepte uniquement l'identifiant numérique configuré", () => {
    expect(isAdminGithubId(92588607, "92588607")).toBe(true);
    expect(isAdminGithubId("92588607", "92588607")).toBe(true);
    expect(isAdminGithubId(12345, "92588607")).toBe(false);
  });

  it("refuse un nom d'utilisateur, un e-mail ou une valeur vide", () => {
    expect(isAdminGithubId("clarabernadou", "92588607")).toBe(false);
    expect(isAdminGithubId("clarabernadou56690@gmail.com", "92588607")).toBe(false);
    expect(isAdminGithubId(undefined, "92588607")).toBe(false);
    expect(isAdminGithubId(null, "92588607")).toBe(false);
  });

  it("refuse tout le monde si ADMIN_GITHUB_ID est absent ou invalide", () => {
    expect(isAdminGithubId(92588607, undefined)).toBe(false);
    expect(isAdminGithubId(92588607, "")).toBe(false);
    expect(isAdminGithubId("clarabernadou", "clarabernadou")).toBe(false);
  });
});
