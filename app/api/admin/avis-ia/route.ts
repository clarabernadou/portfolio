import { adminApiGuard } from "@/lib/auth";
import { consignesAvis, demandeAvis, SCHEMA_AVIS, type Avis, type ContexteAvis, type Recruteur } from "@/lib/admin/avis-ia";

// Avis de l'IA intégré à l'administration : Google Gemini, offre gratuite, avec la clé
// personnelle de Clara (GEMINI_API_KEY, jamais envoyée au navigateur). Réservé à sa session.
export const maxDuration = 60;

const MODELE = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const MODELE_SECOURS = process.env.GEMINI_MODEL_SECOURS || "gemini-3.5-flash-lite";
// GEMINI_API_URL ne sert qu'aux tests (faux serveur local).
const URL_GEMINI = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/interactions";

type Etape = { type?: string; content?: { type?: string; text?: string }[] };

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export async function POST(request: Request) {
  const refus = await adminApiGuard(request);
  if (refus) return refus;
  const cle = process.env.GEMINI_API_KEY;
  if (!cle) return Response.json({ error: "La clé Gemini n’est pas encore configurée (GEMINI_API_KEY). Utilise le mode « Copier pour Claude » en attendant.", sansCle: true }, { status: 503 });

  const corps = (await request.json().catch(() => null)) as { texte?: unknown; ctx?: Partial<Record<keyof ContexteAvis, unknown>>; recruteur?: unknown } | null;
  if (!corps) return Response.json({ error: "Requête illisible." }, { status: 400 });
  const recruteur: Recruteur = corps.recruteur === "tech" || corps.recruteur === "design" ? corps.recruteur : "hybride";
  const ctx: ContexteAvis = {
    page: texte(corps.ctx?.page, 300) || "Administration du portfolio",
    champ: texte(corps.ctx?.champ, 200) || "Texte",
    max: typeof corps.ctx?.max === "number" && corps.ctx.max > 0 ? Math.min(corps.ctx.max, 10000) : undefined,
    infos: texte(corps.ctx?.infos, 6000) || undefined,
  };
  const aRelire = texte(corps.texte, 8000);

  // Modèle principal, puis modèle de secours plus léger si le premier est saturé (503,
  // fréquent sur l'offre gratuite) ou trop lent : le tout reste sous la limite de 60 s.
  const essais = [
    { model: MODELE, delai: 30_000 },
    { model: MODELE_SECOURS, delai: 22_000 },
  ];
  let reponse: Response | null = null;
  let modele = MODELE;
  for (const essai of essais) {
    modele = essai.model;
    try {
      reponse = await fetch(URL_GEMINI, {
        method: "POST",
        headers: { "x-goog-api-key": cle, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: essai.model,
          system_instruction: consignesAvis(ctx, recruteur),
          input: demandeAvis(aRelire, ctx),
          generation_config: { thinking_level: "low" },
          response_format: { type: "text", mime_type: "application/json", schema: SCHEMA_AVIS },
        }),
        signal: AbortSignal.timeout(essai.delai),
      });
    } catch {
      reponse = null; // délai dépassé : on passe au modèle suivant
      continue;
    }
    if (reponse.status !== 503 && reponse.status !== 500) break;
    console.error("Gemini", essai.model, reponse.status, (await reponse.text().catch(() => "")).slice(0, 200));
  }

  if (!reponse || reponse.status === 503 || reponse.status === 500) return Response.json({ error: "Gemini est saturé en ce moment (offre gratuite) : réessaie dans un instant, ou utilise l’option Claude." }, { status: 503 });
  if (reponse.status === 429) return Response.json({ error: "Quota gratuit de Gemini atteint : réessaie dans une minute." }, { status: 429 });
  if (reponse.status === 401 || reponse.status === 403) {
    const detail = await reponse.text().catch(() => "");
    console.error("Gemini", modele, reponse.status, detail.slice(0, 300));
    // Clé neuve : Google active l'API sur le projet pendant quelques minutes.
    if (/has not been used|is disabled|SERVICE_DISABLED/i.test(detail))
      return Response.json({ error: "L’API Gemini est encore en cours d’activation sur ton compte Google : réessaie dans quelques minutes. Si ça dure, active « Generative Language API » dans la console Google Cloud du projet de ta clé." }, { status: 503 });
    return Response.json({ error: "Clé Gemini refusée : vérifie GEMINI_API_KEY dans Vercel." }, { status: 502 });
  }
  if (!reponse.ok) {
    console.error("Gemini", reponse.status, (await reponse.text().catch(() => "")).slice(0, 500));
    return Response.json({ error: "L’analyse a échoué : réessaie dans un instant." }, { status: 502 });
  }

  const data = (await reponse.json().catch(() => null)) as { steps?: Etape[] } | null;
  const sortie = data?.steps?.filter((e) => e.type === "model_output").flatMap((e) => e.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  let avis: Avis;
  try {
    avis = JSON.parse(sortie ?? "") as Avis;
    if (typeof avis.proposition !== "string" || typeof avis.verdict !== "string") throw new Error("forme");
  } catch {
    console.error("Gemini : réponse inattendue", JSON.stringify(data).slice(0, 500));
    return Response.json({ error: "La réponse de l’IA est incomplète : réessaie." }, { status: 502 });
  }
  return Response.json({
    verdict: avis.verdict,
    pointsForts: Array.isArray(avis.pointsForts) ? avis.pointsForts.map(String) : [],
    aAmeliorer: Array.isArray(avis.aAmeliorer) ? avis.aAmeliorer.map((a) => ({ point: String(a?.point ?? ""), raison: String(a?.raison ?? "") })) : [],
    questions: Array.isArray(avis.questions) ? avis.questions.map(String).filter((q) => q && q.toLowerCase() !== "aucune") : [],
    proposition: avis.proposition.trim(),
    modele,
  } satisfies Avis & { modele: string });
}
