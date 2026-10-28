import { adminApiGuard } from "@/lib/auth";
import { db } from "@/lib/db";
import { consignesAvis, demandeAvis, SCHEMA_AVIS, type Avis, type ContexteAvis, type Mode, type Recruteur, type Sources } from "@/lib/admin/avis-ia";
import { resumeDepot } from "@/lib/admin/depot-ia";

// Avis de l'IA intégré à l'administration : Google Gemini, offre gratuite, avec la clé
// personnelle de Clara (GEMINI_API_KEY, jamais envoyée au navigateur). Réservé à sa session.
export const maxDuration = 60;

const MODELE = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const MODELE_SECOURS = process.env.GEMINI_MODEL_SECOURS || "gemini-3.5-flash-lite";
// GEMINI_API_URL ne sert qu'aux tests (faux serveur local).
const URL_GEMINI = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/interactions";

// Profil pour l'IA (Profil et CV → « Ce que l'IA doit savoir sur moi »), lu côté serveur.
async function profilIA(): Promise<string> {
  if (!process.env.DATABASE_URL) return "";
  const row = await db().singleton.findUnique({ where: { key: "profil" } });
  return ((row?.data as { noteIA?: string } | undefined)?.noteIA ?? "").slice(0, 8000);
}

// Pour le mode « Copier pour Claude » : le navigateur récupère le même profil (et, en mode
// « Compléter », le résumé du dépôt GitHub, que Claude ne pourrait pas lire seul).
export async function GET(request: Request) {
  const refus = await adminApiGuard(request);
  if (refus) return refus;
  const github = new URL(request.url).searchParams.get("github") ?? undefined;
  const [profil, depot] = await Promise.all([profilIA(), github ? resumeDepot(github) : Promise.resolve("")]);
  return Response.json({ profil, depot });
}

type Etape = { type?: string; content?: { type?: string; text?: string }[] };

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export async function POST(request: Request) {
  const refus = await adminApiGuard(request);
  if (refus) return refus;
  const cle = process.env.GEMINI_API_KEY;
  if (!cle) return Response.json({ error: "La clé Gemini n’est pas encore configurée (GEMINI_API_KEY). Utilise le mode « Copier pour Claude » en attendant.", sansCle: true }, { status: 503 });

  const corps = (await request.json().catch(() => null)) as { texte?: unknown; ctx?: Partial<Record<keyof ContexteAvis, unknown>>; recruteur?: unknown; mode?: unknown; notes?: unknown } | null;
  if (!corps) return Response.json({ error: "Requête illisible." }, { status: 400 });
  const recruteur: Recruteur = corps.recruteur === "tech" || corps.recruteur === "design" ? corps.recruteur : "hybride";
  const ctx: ContexteAvis = {
    page: texte(corps.ctx?.page, 300) || "Administration du portfolio",
    champ: texte(corps.ctx?.champ, 200) || "Texte",
    max: typeof corps.ctx?.max === "number" && corps.ctx.max > 0 ? Math.min(corps.ctx.max, 10000) : undefined,
    infos: texte(corps.ctx?.infos, 6000) || undefined,
  };
  const aRelire = texte(corps.texte, 8000);
  const mode: Mode = corps.mode === "completer" ? "completer" : "relire";
  const github = texte(corps.ctx?.github, 300);

  // Réponse envoyée au fil de l'eau (une ligne JSON par événement) : le panneau affiche l'étape
  // réelle (modèle principal, puis modèle de secours) et peut annuler la demande à tout moment.
  const flux = new TransformStream<string, string>();
  const ecrire = flux.writable.getWriter();
  const envoyer = (e: Record<string, unknown>) => ecrire.write(`${JSON.stringify(e)}\n`).catch(() => {});
  (async () => {
    try {
      // Le dépôt GitHub n'est lu qu'en mode « Compléter » (6 s au plus par appel).
      const [profil, depot] = await Promise.all([profilIA(), mode === "completer" && github ? resumeDepot(github) : Promise.resolve("")]);
      const sources: Sources = { notes: mode === "completer" ? texte(corps.notes, 3000) : "", depot };
      const resultat = await analyser(cle, ctx, recruteur, profil, aRelire, mode, sources, request.signal, (etape, modele, delai) => envoyer({ type: "etape", etape, modele, delai }));
      await envoyer(resultat);
    } catch {
      await envoyer({ type: "erreur", error: "L’analyse a échoué : réessaie dans un instant." });
    } finally {
      await ecrire.close().catch(() => {});
    }
  })();
  return new Response(flux.readable.pipeThrough(new TextEncoderStream()), {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}

type Evenement = Record<string, unknown> & { type: "resultat" | "erreur" };

async function analyser(
  cle: string,
  ctx: ContexteAvis,
  recruteur: Recruteur,
  profil: string,
  aRelire: string,
  mode: Mode,
  sources: Sources,
  annulation: AbortSignal,
  etape: (etape: "principal" | "secours", modele: string, delai: number) => void,
): Promise<Evenement> {
  // Modèle principal, puis modèle de secours plus léger si le premier est saturé (503,
  // fréquent sur l'offre gratuite) ou trop lent : le tout reste sous la limite de 60 s.
  const essais = [
    // Délais mesurés le 26 oct. 2026 : le modèle de secours répond en 20 à 25 s quand Gemini est
    // chargé, le principal peut dépasser 90 s. 24 + 32 s restent sous la limite de 60 s de Vercel.
    { model: MODELE, delai: 24_000, etape: "principal" as const },
    { model: MODELE_SECOURS, delai: 32_000, etape: "secours" as const },
  ];
  let reponse: Response | null = null;
  let modele = MODELE;
  for (const essai of essais) {
    if (annulation.aborted) return { type: "erreur", error: "Analyse annulée." };
    modele = essai.model;
    etape(essai.etape, essai.model, essai.delai);
    // Délai de coupure fait main : dans Next.js, AbortSignal.any / AbortSignal.timeout passés à fetch
    // n'interrompaient pas l'appel (constaté le 26 oct. 2026 : 100 s au lieu de 34 s).
    const ctrl = new AbortController();
    const arreter = () => ctrl.abort();
    const minuterie = setTimeout(arreter, essai.delai);
    annulation.addEventListener("abort", arreter);
    try {
      const appel = fetch(URL_GEMINI, {
        method: "POST",
        headers: { "x-goog-api-key": cle, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: essai.model,
          system_instruction: consignesAvis(ctx, recruteur, profil, mode),
          input: demandeAvis(aRelire, ctx, sources, mode),
          // Compléter : réflexion courte, pour répondre avant le délai malgré les sources plus longues.
          generation_config: { thinking_level: essai.model === MODELE && mode === "relire" ? "medium" : "low" },
          response_format: { type: "text", mime_type: "application/json", schema: SCHEMA_AVIS },
        }),
        signal: ctrl.signal,
      });
      // Filet de sécurité : la course rend la main au délai prévu même si fetch ignore le signal.
      const coupure = new Promise<never>((_, rejeter) => ctrl.signal.addEventListener("abort", () => rejeter(new Error("délai"))));
      reponse = await Promise.race([appel, coupure]);
      // Le corps est lu plus bas : on le lit ici, sous la même minuterie, pour qu'il ne puisse pas bloquer.
      const corps = await Promise.race([reponse.text(), coupure]);
      reponse = new Response(corps, { status: reponse.status, headers: reponse.headers });
    } catch {
      reponse = null; // délai dépassé (ou annulation) : on passe au modèle suivant
      continue;
    } finally {
      clearTimeout(minuterie);
      annulation.removeEventListener("abort", arreter);
    }
    if (reponse.status !== 503 && reponse.status !== 500) break;
    console.error("Gemini", essai.model, reponse.status, (await reponse.text().catch(() => "")).slice(0, 200));
  }

  const erreur = (error: string) => ({ type: "erreur" as const, error });
  if (annulation.aborted) return erreur("Analyse annulée.");
  if (!reponse || reponse.status === 503 || reponse.status === 500) return erreur("Gemini est saturé en ce moment (offre gratuite) : réessaie dans un instant, ou utilise l’option Claude.");
  if (reponse.status === 429) return erreur("Quota gratuit de Gemini atteint : réessaie dans une minute.");
  if (reponse.status === 401 || reponse.status === 403) {
    const detail = await reponse.text().catch(() => "");
    console.error("Gemini", modele, reponse.status, detail.slice(0, 300));
    // Clé neuve : Google active l'API sur le projet pendant quelques minutes.
    if (/has not been used|is disabled|SERVICE_DISABLED/i.test(detail))
      return erreur("L’API Gemini est encore en cours d’activation sur ton compte Google : réessaie dans quelques minutes. Si ça dure, active « Generative Language API » dans la console Google Cloud du projet de ta clé.");
    return erreur("Clé Gemini refusée : vérifie GEMINI_API_KEY dans Vercel.");
  }
  if (!reponse.ok) {
    console.error("Gemini", reponse.status, (await reponse.text().catch(() => "")).slice(0, 500));
    return erreur("L’analyse a échoué : réessaie dans un instant.");
  }

  const data = (await reponse.json().catch(() => null)) as { steps?: Etape[] } | null;
  const sortie = data?.steps?.filter((e) => e.type === "model_output").flatMap((e) => e.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  let avis: Avis;
  try {
    avis = JSON.parse(sortie ?? "") as Avis;
    if (typeof avis.proposition !== "string" || typeof avis.verdict !== "string") throw new Error("forme");
  } catch {
    console.error("Gemini : réponse inattendue", JSON.stringify(data).slice(0, 500));
    return erreur("La réponse de l’IA est incomplète : réessaie.");
  }
  return {
    type: "resultat",
    verdict: avis.verdict,
    pointsForts: Array.isArray(avis.pointsForts) ? avis.pointsForts.map(String) : [],
    aAmeliorer: Array.isArray(avis.aAmeliorer) ? avis.aAmeliorer.map((a) => ({ point: String(a?.point ?? ""), raison: String(a?.raison ?? "") })) : [],
    questions: Array.isArray(avis.questions) ? avis.questions.map(String).filter((q) => q && q.toLowerCase() !== "aucune") : [],
    proposition: avis.proposition.trim(),
    affirmationsNonSourcees: Array.isArray(avis.affirmationsNonSourcees) ? avis.affirmationsNonSourcees.map(String).filter(Boolean) : [],
    modele,
  } satisfies Avis & { modele: string; type: "resultat" };
}
