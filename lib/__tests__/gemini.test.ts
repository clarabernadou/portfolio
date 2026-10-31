import { describe, expect, it } from "vitest";
import { heureDeParis, lireQuota, lireSse, messageQuota, prochainMinuitPacifique } from "@/lib/admin/gemini";

describe("prochainMinuitPacifique", () => {
  it("donne minuit en Californie, heure d'été (UTC-7)", () => {
    expect(prochainMinuitPacifique(new Date("2026-10-31T10:00:00Z")).toISOString()).toBe("2026-11-01T07:00:00.000Z");
  });
  it("donne minuit en Californie, heure d'hiver (UTC-8)", () => {
    expect(prochainMinuitPacifique(new Date("2026-12-15T10:00:00Z")).toISOString()).toBe("2026-12-16T08:00:00.000Z");
  });
  it("passe au lendemain juste après minuit", () => {
    expect(prochainMinuitPacifique(new Date("2026-11-01T07:00:01Z")).toISOString()).toBe("2026-11-02T08:00:00.000Z");
  });
});

describe("lireQuota", () => {
  const maintenant = new Date("2026-10-31T13:00:00Z");
  it("reconnaît le quota du jour", () => {
    const q = lireQuota('{"error":{"details":[{"violations":[{"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"}]}]}}', maintenant);
    expect(q).toEqual({ type: "jour", reprise: new Date("2026-11-01T07:00:00Z") });
    expect(messageQuota(q, maintenant)).toContain("demain à 8 h 00");
  });
  it("reconnaît la limite par minute et son délai", () => {
    const q = lireQuota('{"details":[{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"37.2s"}]}', maintenant);
    expect(q).toEqual({ type: "minute", reprise: new Date("2026-10-31T13:00:38Z") });
    expect(messageQuota(q, maintenant)).toContain("à 14 h 00 min 38 s");
  });
  it("donne les deux heures possibles quand Google ne précise rien", () => {
    const q = lireQuota('{"error":{"code":429}}', maintenant);
    expect(q.type).toBe("inconnu");
    expect(messageQuota(q, maintenant)).toMatch(/à 14 h 01.*demain à 8 h 00/);
  });
});

describe("heureDeParis", () => {
  it("indique la date au-delà de demain", () => {
    expect(heureDeParis(new Date("2026-11-03T08:00:00Z"), new Date("2026-10-31T13:00:00Z"))).toBe("le 3 nov. à 9 h 00");
  });
});

describe("lireSse", () => {
  it("rend les événements complets et garde le reste", () => {
    const { evenements, reste } = lireSse('event: step.delta\ndata: {"index":0,"delta":{"type":"text","text":"Bon"}}\n\nevent: done\ndata: [DONE]\n\nevent: step.st');
    expect(evenements).toEqual([{ event: "step.delta", data: { index: 0, delta: { type: "text", text: "Bon" } } }]);
    expect(reste).toBe("event: step.st");
  });
});
