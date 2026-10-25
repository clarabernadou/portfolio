import { beforeAll, describe, expect, it } from "vitest";

// Critère de réception n° 1 : un compte GitHub autre que celui de Clara revient au site
// sans message ; le compte de Clara est accepté (identifiant numérique, jamais le nom).
describe("connexion à l'administration (rappel signIn d'Auth.js)", () => {
  let signIn: (p: { account: { provider: string } | null; profile?: { id?: number; login?: string } }) => Promise<string | boolean>;
  beforeAll(async () => {
    process.env.ADMIN_GITHUB_ID = "92588607";
    const { authOptions } = await import("../auth");
    signIn = authOptions.callbacks!.signIn as unknown as typeof signIn;
  });

  it("accepte le compte de Clara", async () => {
    expect(await signIn({ account: { provider: "github" }, profile: { id: 92588607, login: "clarabernadou" } })).toBe(true);
  });

  it("renvoie tout autre compte vers l'accueil, sans page d'erreur", async () => {
    expect(await signIn({ account: { provider: "github" }, profile: { id: 1, login: "quelquun" } })).toBe("/");
  });

  it("refuse un compte qui reprendrait le nom d'utilisateur de Clara", async () => {
    expect(await signIn({ account: { provider: "github" }, profile: { id: 2, login: "clarabernadou" } })).toBe("/");
  });

  it("refuse tout autre fournisseur", async () => {
    expect(await signIn({ account: { provider: "google" }, profile: { id: 92588607 } })).toBe("/");
  });
});
