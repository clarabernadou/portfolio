import { adminApiGuard } from "@/lib/auth";
import { db } from "@/lib/db";
import { CLE_CHAMP, consignesAvis, consignesFiche, demandeAvis, demandeFiche, normaliserFiche, SCHEMA_AVIS, SCHEMA_FICHE, type Avis, type ContexteAvis, type FicheIA, type Mode, type Recruteur, type Sources } from "@/lib/admin/avis-ia";
import { resumeDepot } from "@/lib/admin/depot-ia";
import { lireQuota, lireSse, messageQuota } from "@/lib/admin/gemini";

// Avis de l'IA intégré à l'administration : Google Gemini, offre gratuite, avec la clé
// personnelle de Clara (GEMINI_API_KEY, jamais envoyée au navigateur). Réservé à sa session.
// 300 s : limite de Vercel sur l'offre gratuite (fonctions « fluid compute »).
export const maxDuration = 300;

const MODELE = process.env.GEMINI_MODEL || "gemini-3.8-flash";
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

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export async function POST(request: Request) {
  const refus = await adminApiGuard(request);
  if (refus) return refus;
  const cle = process.env.GEMINI_API_KEY;
  if (!cle) return Response.json({ error: "La clé Gemini n’est pas encore configurée (GEMINI_API_KEY). Utilise le mode « Copier pour Claude » en attendant.", sansCle: true }, { status: 503 });

  const corps = (await request.json().catch(() => null)) as {
    texte?: unknown;
    ctx?: Partial<Record<keyof ContexteAvis, unknown>>;
    recruteur?: unknown;
    mode?: unknown;
    notes?: unknown;
    cible?: unknown;
    fiche?: { objet?: unknown; page?: unknown; infos?: unknown; github?: unknown; champs?: unknown; tags?: unknown };
  } | null;
  if (!corps) return Response.json({ error: "Requête illisible." }, { status: 400 });
  const recruteur: Recruteur = corps.recruteur === "tech" || corps.recruteur === "design" ? corps.recruteur : "hybride";
  const ctx: ContexteAvis = {
    page: texte(corps.ctx?.page, 300) || "Administration du portfolio",
    champ: texte(corps.ctx?.champ, 200) || "Texte",
    max: typeof corps.ctx?.max === "number" && corps.ctx.max > 0 ? Math.min(corps.ctx.max, 10000) : undefined,
    infos: texte(corps.ctx?.infos, 6000) || undefined,
  };
  const aRelire = texte(corps.texte, 8000);
  // « fiche » : toute une fiche (projet ou expérience) en un appel. Les champs viennent du
  // navigateur : clés, longueurs et nombre sont bornés avant d'entrer dans le prompt.
  const champsRecus = Array.isArray(corps.fiche?.champs) ? (corps.fiche.champs as Record<string, unknown>[]).slice(0, 40) : [];
  const fiche: FicheIA | null =
    corps.cible === "fiche" && corps.fiche
      ? {
          objet: corps.fiche.objet === "experience" ? "experience" : "projet",
          page: texte(corps.fiche.page, 300) || "Fiche du portfolio",
          infos: texte(corps.fiche.infos, 6000) || undefined,
          champs: champsRecus
            .filter((c) => typeof c?.cle === "string" && CLE_CHAMP.test(c.cle))
            .map((c) => ({ cle: c.cle as string, champ: texte(c.champ, 120) || (c.cle as string), max: typeof c.max === "number" && c.max > 0 ? Math.min(c.max, 2000) : 500, role: texte(c.role, 300), valeur: texte(c.valeur, 4000) })),
          tags: Array.isArray(corps.fiche.tags) ? corps.fiche.tags.slice(0, 40).map((t) => texte(t, 60)).filter(Boolean) : undefined,
        }
      : null;
  if (fiche && fiche.champs.length === 0) return Response.json({ error: "Aucun texte à relire." }, { status: 400 });
  const mode: Mode = fiche || corps.mode === "completer" ? "completer" : "relire";
  const github = fiche ? texte(corps.fiche?.github, 300) : texte(corps.ctx?.github, 300);

  // Réponse envoyée au fil de l'eau (une ligne JSON par événement) : le panneau affiche l'étape
  // réelle (connexion, réflexion, rédaction, attente si Gemini est saturé) et peut annuler à tout moment.
  const flux = new TransformStream<string, string>();
  const ecrire = flux.writable.getWriter();
  const envoyer = (e: Record<string, unknown>) => ecrire.write(`${JSON.stringify(e)}\n`).catch(() => {});
  (async () => {
    try {
      // Le dépôt GitHub n'est lu qu'en mode « Compléter » (6 s au plus par appel).
      const [profil, depot] = await Promise.all([profilIA(), mode === "completer" && github ? resumeDepot(github) : Promise.resolve("")]);
      const sources: Sources = { notes: mode === "completer" ? texte(corps.notes, 3000) : "", depot };
      const demande: Demande = fiche
        ? { system: consignesFiche(fiche.objet, recruteur, profil), input: demandeFiche(fiche, sources), schema: SCHEMA_FICHE, reflexion: "low", attendus: attendusFiche(fiche) }
        : { system: consignesAvis(ctx, recruteur, profil, mode), input: demandeAvis(aRelire, ctx, sources, mode), schema: SCHEMA_AVIS, reflexion: mode === "relire" ? "medium" : "low", attendus: (ctx.max ?? (mode === "completer" ? 600 : aRelire.length)) + 900 };
      const r = await analyser(cle, demande, request.signal, envoyer);
      if (r.type === "erreur") await envoyer(r);
      else if (fiche) {
        const avis = normaliserFiche(r.json, fiche);
        if (!avis) console.error("Gemini : fiche inattendue", JSON.stringify(r.json).slice(0, 500));
        await envoyer(avis ? { type: "resultat", ...avis, modele: r.modele } : { type: "erreur", error: "La réponse de l’IA est incomplète : réessaie." });
      } else await envoyer(normaliserAvis(r.json, r.modele));
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

// Longueur probable de la réponse JSON (textes proposés, avis, questions), pour la jauge.
const attendusFiche = (f: FicheIA) => f.champs.reduce((n, c) => n + Math.min(c.max, Math.max(150, c.valeur.length * 1.3)) + 120, 1200);

type Demande = { system: string; input: string; schema: object; reflexion: "low" | "medium"; attendus: number };
type Brut = { type: "brut"; json: unknown; modele: string } | { type: "erreur"; error: string };
type Envoyer = (e: Record<string, unknown>) => void;

// Un seul modèle (décision de Clara, 31 oct. 2026 : le modèle de secours, plus léger, perdait le
// cadre des textes). S'il est saturé, on attend et on lui redemande, tant que le délai de la
// fonction le permet (300 s sur Vercel, offre gratuite). La réponse arrive au fil de l'eau : la
// jauge suit les étapes et les caractères réellement reçus.
const LIMITE = 270_000;
const DELAI_CONNEXION = 45_000;
const PAUSES = [3_000, 8_000, 15_000, 30_000, 45_000];
const attendre = (ms: number, annulation: AbortSignal) =>
  new Promise<void>((ok) => {
    const t = setTimeout(ok, ms);
    annulation.addEventListener("abort", () => (clearTimeout(t), ok()), { once: true });
  });

type Essai = { type: "ok"; texte: string } | { type: "relancer"; raison: string } | { type: "quota"; corps: string } | { type: "fatal"; brut: Response | null; detail: string };

async function analyser(cle: string, demande: Demande, annulation: AbortSignal, envoyer: Envoyer): Promise<Brut> {
  const debut = Date.now();
  const erreur = (error: string) => ({ type: "erreur" as const, error });
  for (let n = 0; ; n++) {
    if (annulation.aborted) return erreur("Analyse annulée.");
    const r = await essai(cle, demande, annulation, envoyer, debut + LIMITE);
    if (annulation.aborted) return erreur("Analyse annulée.");
    if (r.type === "ok") {
      try {
        return { type: "brut", json: JSON.parse(r.texte), modele: MODELE };
      } catch {
        console.error("Gemini : réponse inattendue", r.texte.slice(0, 500));
        return erreur("La réponse de l’IA est incomplète : réessaie.");
      }
    }
    let pause = PAUSES[Math.min(n, PAUSES.length - 1)];
    let raison = r.type === "relancer" ? r.raison : "";
    if (r.type === "quota") {
      const q = lireQuota(r.corps, new Date());
      console.error("Gemini 429", r.corps.slice(0, 500));
      // Limite par minute : on attend l'heure donnée par Google et on redemande, si le délai le permet.
      if (q.type !== "minute" || q.reprise.getTime() + 30_000 > debut + LIMITE) return erreur(messageQuota(q, new Date()));
      pause = Math.max(1_000, q.reprise.getTime() - Date.now());
      raison = "quota";
    }
    if (r.type === "fatal") return fatal(r.brut, r.detail);
    // Plus assez de temps pour un nouvel essai : on le dit franchement.
    if (Date.now() + pause + 30_000 > debut + LIMITE)
      return erreur(`Gemini est saturé depuis ${Math.round((Date.now() - debut) / 1000)} s (offre gratuite) : réessaie dans quelques minutes, ou utilise l’option Claude.`);
    envoyer({ type: "etape", etape: "attente", raison, essai: n + 2, reprise: new Date(Date.now() + pause).toISOString() });
    await attendre(pause, annulation);
  }
}

async function essai(cle: string, demande: Demande, annulation: AbortSignal, envoyer: Envoyer, finMax: number): Promise<Essai> {
  envoyer({ type: "etape", etape: "connexion", modele: MODELE });
  // Délai de coupure fait main : dans Next.js, AbortSignal.any / AbortSignal.timeout passés à fetch
  // n'interrompaient pas l'appel (constaté le 26 oct. 2026).
  const ctrl = new AbortController();
  const arreter = () => ctrl.abort();
  annulation.addEventListener("abort", arreter);
  const coupure = new Promise<never>((_, rejeter) => ctrl.signal.addEventListener("abort", () => rejeter(new Error("délai"))));
  coupure.catch(() => {});
  let minuterie = setTimeout(arreter, Math.min(DELAI_CONNEXION, finMax - Date.now()));
  try {
    const appel = fetch(URL_GEMINI, {
      method: "POST",
      headers: { "x-goog-api-key": cle, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODELE,
        system_instruction: demande.system,
        input: demande.input,
        stream: true,
        generation_config: { thinking_level: demande.reflexion },
        response_format: { type: "text", mime_type: "application/json", schema: demande.schema },
      }),
      signal: ctrl.signal,
    });
    let reponse: Response;
    try {
      reponse = await Promise.race([appel, coupure]);
    } catch {
      return { type: "relancer", raison: "lent" };
    }
    if (reponse.status === 429) return { type: "quota", corps: await reponse.text().catch(() => "") };
    if ([500, 502, 503, 504].includes(reponse.status)) {
      console.error("Gemini", reponse.status, (await reponse.text().catch(() => "")).slice(0, 300));
      return { type: "relancer", raison: "sature" };
    }
    if (!reponse.ok || !reponse.body) return { type: "fatal", brut: reponse, detail: await reponse.text().catch(() => "") };

    // Connecté : la suite a jusqu'à la limite de la fonction.
    clearTimeout(minuterie);
    minuterie = setTimeout(arreter, finMax - Date.now());
    envoyer({ type: "etape", etape: "reflexion" });
    const lecteur = reponse.body.pipeThrough(new TextDecoderStream()).getReader();
    let tampon = "";
    let texte = "";
    let sortie = new Set<number>();
    let signale = 0;
    for (;;) {
      let lu: ReadableStreamReadResult<string>;
      try {
        lu = await Promise.race([lecteur.read(), coupure]);
      } catch {
        lecteur.cancel().catch(() => {});
        return texte ? { type: "fatal", brut: null, detail: "délai" } : { type: "relancer", raison: "lent" };
      }
      if (lu.done) break;
      const { evenements, reste } = lireSse(tampon + lu.value);
      tampon = reste;
      for (const { event, data } of evenements) {
        if (event === "error") {
          const corps = JSON.stringify(data);
          if (/exhausted|quota|429/i.test(corps)) return { type: "quota", corps };
          if (!texte && /unavailable|overloaded|internal|timeout|deadline/i.test(corps)) return { type: "relancer", raison: "sature" };
          return { type: "fatal", brut: null, detail: corps };
        }
        const step = data.step as { type?: string } | undefined;
        if (event === "step.start" && step?.type === "model_output") {
          sortie = new Set([...sortie, Number(data.index)]);
          envoyer({ type: "etape", etape: "redaction" });
        }
        const delta = data.delta as { type?: string; text?: string } | undefined;
        if (event === "step.delta" && delta?.type === "text" && typeof delta.text === "string" && (sortie.size === 0 || sortie.has(Number(data.index)))) {
          texte += delta.text;
          // Au plus un signal tous les 200 caractères : assez pour une jauge fluide.
          if (texte.length - signale >= 200) {
            signale = texte.length;
            envoyer({ type: "progres", recus: texte.length, attendus: demande.attendus });
          }
        }
      }
    }
    if (!texte) return { type: "relancer", raison: "sature" };
    envoyer({ type: "progres", recus: texte.length, attendus: texte.length });
    return { type: "ok", texte };
  } finally {
    clearTimeout(minuterie);
    annulation.removeEventListener("abort", arreter);
  }
}

function fatal(reponse: Response | null, detail: string): Brut {
  const erreur = (error: string) => ({ type: "erreur" as const, error });
  console.error("Gemini", reponse?.status, detail.slice(0, 500));
  if (detail === "délai") return erreur("Gemini a commencé à répondre mais n’a pas fini à temps : réessaie, ou utilise l’option Claude.");
  if (reponse?.status === 401 || reponse?.status === 403) {
    // Clé neuve : Google active l'API sur le projet pendant quelques minutes.
    if (/has not been used|is disabled|SERVICE_DISABLED/i.test(detail))
      return erreur("L’API Gemini est encore en cours d’activation sur ton compte Google : réessaie dans quelques minutes. Si ça dure, active « Generative Language API » dans la console Google Cloud du projet de ta clé.");
    return erreur("Clé Gemini refusée : vérifie GEMINI_API_KEY dans Vercel.");
  }
  return erreur("L’analyse a échoué : réessaie dans un instant.");
}

function normaliserAvis(brut: unknown, modele: string) {
  const avis = brut as Avis;
  if (typeof avis?.proposition !== "string" || typeof avis.verdict !== "string") {
    console.error("Gemini : avis inattendu", JSON.stringify(brut).slice(0, 500));
    return { type: "erreur", error: "La réponse de l’IA est incomplète : réessaie." };
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
