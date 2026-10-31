"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { extraireProposition, promptAvis, RECRUTEURS, type Avis, type ContexteAvis, type Mode, type Recruteur } from "@/lib/admin/avis-ia";
import { Icon } from "./icons";

// Bouton « Avis de l'IA » des champs de texte (lib/admin/avis-ia.ts) : relire le texte, ou le
// compléter en un court paragraphe détaillé à partir des sources (fiche, profil, notes, dépôt
// GitHub). Mode intégré : l'analyse de Google Gemini s'affiche dans le panneau. Mode de secours :
// prompt à copier dans Claude, réponse à recoller. Dans les 2 cas, rien n'est enregistré sans Clara.
// Les briques exportées servent aussi au panneau « Compléter la fiche » (CompleterFicheIA.tsx).

type Page = Pick<ContexteAvis, "page" | "infos" | "github">;
const IaContexte = createContext<Page | null>(null);

/** Décrit la page en cours (et les autres champs utiles) pour tous les boutons qu'elle contient. */
export function IaPage({ page, infos, github, children }: Page & { children: ReactNode }) {
  return <IaContexte.Provider value={{ page, infos, github }}>{children}</IaContexte.Provider>;
}

const CLE_RECRUTEUR = "admin-avis-ia-recruteur";

type NomEtape = "envoi" | "connexion" | "reflexion" | "redaction" | "attente";
/** Étape réelle envoyée par l'API, avec les caractères reçus pendant la rédaction. */
type Etape = { etape: NomEtape; debut: number; recus?: number; attendus?: number; reprise?: number; raison?: string; essai?: number };
export type EtatAnalyse<T> = { type: "vide" } | { type: "chargement"; etape: Etape } | { type: "erreur"; message: string } | { type: "avis"; avis: T & { modele?: string } };

// Libellés des étapes réelles envoyées par l'API (app/api/admin/avis-ia/route.ts).
const LIBELLE_ETAPE: Record<NomEtape, string> = {
  envoi: "Préparation de la demande…",
  connexion: "Envoi du texte à Gemini…",
  reflexion: "Gemini relit ton texte et réfléchit…",
  redaction: "Gemini rédige sa proposition…",
  attente: "Gemini est saturé : nouvel essai programmé…",
};
export const LIBELLE_COMPLETER: Record<NomEtape, string> = {
  ...LIBELLE_ETAPE,
  envoi: "Lecture de tes sources (notes, dépôt GitHub)…",
  reflexion: "Gemini lit tes sources et réfléchit…",
  redaction: "Gemini rédige une version plus détaillée…",
};

/** Profil de recruteur choisi, mémorisé dans le navigateur. */
export function useRecruteur() {
  const [recruteur, setRecruteur] = useState<Recruteur>("hybride");
  const relire = () => {
    try {
      const r = localStorage.getItem(CLE_RECRUTEUR);
      if (r === "hybride" || r === "tech" || r === "design") setRecruteur(r);
    } catch {
      /* stockage indisponible : on garde le profil par défaut */
    }
  };
  const choisir = (r: Recruteur) => {
    setRecruteur(r);
    try {
      localStorage.setItem(CLE_RECRUTEUR, r);
    } catch {
      /* préférence non mémorisée */
    }
  };
  return { recruteur, choisir, relire };
}

/** Appel à l'API au fil de l'eau (étapes, puis résultat ou erreur), annulable. */
export function useAnalyse<T>() {
  const [etat, setEtat] = useState<EtatAnalyse<T>>({ type: "vide" });
  const requete = useRef<AbortController | null>(null);

  const lancer = async (corps: object) => {
    const ctrl = new AbortController();
    requete.current = ctrl;
    setEtat({ type: "chargement", etape: { etape: "envoi", debut: Date.now() } });
    try {
      const r = await fetch("/api/admin/avis-ia", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps), signal: ctrl.signal });
      // Erreurs immédiates (clé absente, session expirée) : réponse JSON classique.
      if (!r.ok || !r.body || !r.headers.get("content-type")?.includes("ndjson")) {
        const data = await r.json().catch(() => ({}));
        setEtat({ type: "erreur", message: data.error ?? (r.status === 401 ? "Ta session a expiré : reconnecte-toi." : "L’analyse a échoué.") });
        return { sansCle: !!data.sansCle };
      }
      // Sinon, une ligne JSON par événement : étapes, puis résultat ou erreur.
      const lecteur = r.body.pipeThrough(new TextDecoderStream()).getReader();
      let tampon = "";
      for (;;) {
        const { value, done } = await lecteur.read();
        if (done) break;
        tampon += value;
        const lignes = tampon.split("\n");
        tampon = lignes.pop() ?? "";
        for (const ligne of lignes.filter(Boolean)) {
          const e = JSON.parse(ligne);
          if (e.type === "etape")
            setEtat({ type: "chargement", etape: { etape: e.etape, debut: Date.now(), reprise: e.reprise ? Date.parse(e.reprise) : undefined, raison: e.raison, essai: e.essai } });
          else if (e.type === "progres")
            setEtat((avant) => (avant.type === "chargement" ? { type: "chargement", etape: { ...avant.etape, etape: "redaction", recus: e.recus, attendus: e.attendus } } : avant));
          else if (e.type === "resultat") setEtat({ type: "avis", avis: e as T & { modele?: string } });
          else if (e.type === "erreur") setEtat({ type: "erreur", message: e.error });
        }
      }
    } catch {
      if (ctrl.signal.aborted) return {};
      setEtat({ type: "erreur", message: "Connexion impossible : réessaie dans un instant." });
    } finally {
      if (requete.current === ctrl) requete.current = null;
    }
    return {};
  };

  const arreter = () => {
    requete.current?.abort();
    requete.current = null;
  };
  const annuler = () => {
    arreter();
    setEtat({ type: "erreur", message: "Analyse annulée. Tu peux la relancer quand tu veux." });
  };
  return { etat, lancer, annuler, arreter, reinit: () => setEtat({ type: "vide" }) };
}

/** La fenêtre modale bloque le défilement de la page (CLAUDE.md, accessibilité) ; la fermer arrête l'analyse. */
export function useModale(dialog: RefObject<HTMLDialogElement | null>, auFermer: () => void) {
  const rappel = useRef(auFermer);
  useEffect(() => {
    rappel.current = auFermer;
  });
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const fermer = () => {
      document.documentElement.classList.remove("adm-modale-ouverte");
      rappel.current();
    };
    const obs = new MutationObserver(() => document.documentElement.classList.toggle("adm-modale-ouverte", d.open));
    obs.observe(d, { attributes: true, attributeFilter: ["open"] });
    d.addEventListener("close", fermer);
    return () => {
      obs.disconnect();
      d.removeEventListener("close", fermer);
      fermer();
    };
  }, [dialog]);
}

/** Profil pour l'IA (privé) et résumé du dépôt GitHub, lus à l'ouverture pour le prompt Claude. */
export function useSourcesClaude() {
  const [sources, setSources] = useState({ profil: "", depot: "" });
  const charger = (github?: string) =>
    fetch(`/api/admin/avis-ia${github ? `?github=${encodeURIComponent(github)}` : ""}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: { profil?: string; depot?: string }) => setSources({ profil: d.profil ?? "", depot: d.depot ?? "" }))
      .catch(() => setSources({ profil: "", depot: "" }));
  return { ...sources, charger };
}

/** Quand le résultat arrive, le focus va à son titre : le lecteur d'écran l'annonce et la page y défile. */
export function useFocusResultat(pret: boolean) {
  const titre = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (pret) titre.current?.focus();
  }, [pret]);
  return titre;
}

export function ChoixRecruteur({ recruteur, onChoisir }: { recruteur: Recruteur; onChoisir: (r: Recruteur) => void }) {
  return (
    <fieldset className="adm-ia-recruteur">
      <legend className="adm-label">Point de vue du recruteur</legend>
      <div>
        {RECRUTEURS.map((r) => (
          <button key={r.id} type="button" className="adm-btn" aria-pressed={recruteur === r.id} onClick={() => onChoisir(r.id)}>
            {r.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function NotesIA({ id, valeur, onChange, champRef }: { id: string; valeur: string; onChange: (v: string) => void; champRef?: RefObject<HTMLTextAreaElement | null> }) {
  return (
    <div className="adm-ia-notes">
      <label className="adm-label" htmlFor={id}>
        Tes notes pour l’IA <span className="adm-help">(facultatif)</span>
      </label>
      <textarea
        ref={champRef}
        id={id}
        className="adm-textarea"
        rows={4}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${id}-aide`}
        placeholder="Par exemple : ce que tu as fait, tes choix, une difficulté, le résultat."
      />
      <p className="adm-help" id={`${id}-aide`}>
        En vrac, sans mise en forme. C’est la seule source pour ce que la fiche ne dit pas ; rien n’est enregistré.
      </p>
    </div>
  );
}

// ── Blocs du résultat ───────────────────────────────────────────────────────────────────
// Chaque partie a son propre bloc, son titre et sa couleur : la proposition (ce qu'on peut
// accepter), ce qui est à vérifier, les questions de l'IA, puis l'avis du recruteur (critique).

export function TitreResultat({ titreRef, modele }: { titreRef: RefObject<HTMLHeadingElement | null>; modele?: string }) {
  return (
    <div className="adm-ia-resultat-tete">
      <h3 className="adm-h2" ref={titreRef} tabIndex={-1}>
        Résultat
      </h3>
      {modele && (
        <p className="adm-help">
          Par {modele}
        </p>
      )}
    </div>
  );
}

function TitreBloc({ icone, children, id }: { icone: Parameters<typeof Icon>[0]["name"]; children: ReactNode; id?: string }) {
  return (
    <h4 className="adm-ia-bloc-titre" id={id}>
      <Icon name={icone} size={16} />
      {children}
    </h4>
  );
}

/** Informations de la proposition absentes des sources : à vérifier avant d'accepter. */
export function BlocAVerifier({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="adm-ia-alerte">
      <TitreBloc icone="warning">À vérifier avant d’accepter</TitreBloc>
      <p className="adm-help">Ces informations ne viennent d’aucune de tes sources :</p>
      <ul>
        {items.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    </div>
  );
}

export function BlocQuestions({ questions, onRepondre }: { questions: string[]; onRepondre?: () => void }) {
  const id = useId();
  if (!questions.length) return null;
  return (
    <section className="adm-ia-bloc adm-ia-bloc--questions" aria-labelledby={id}>
      <TitreBloc icone="search" id={id}>
        Questions pour toi
      </TitreBloc>
      <p className="adm-help">Réponds-y dans tes notes, puis relance : l’IA pourra en dire plus sans rien inventer.</p>
      <ol>
        {questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>
      {onRepondre && (
        <div className="adm-ia-actions">
          <button type="button" className="adm-btn adm-btn--outline" onClick={onRepondre}>
            <Icon name="edit" />
            Répondre dans mes notes
          </button>
        </div>
      )}
    </section>
  );
}

type Critique = Pick<Avis, "verdict" | "pointsForts" | "aAmeliorer">;

/** L'avis critique du recruteur, replié quand l'objectif est d'abord la proposition. */
export function BlocAvisRecruteur({ avis, recruteur, ouvert }: { avis: Critique; recruteur: Recruteur; ouvert: boolean }) {
  const r = RECRUTEURS.find((x) => x.id === recruteur) ?? RECRUTEURS[0];
  return (
    <details className="adm-ia-bloc adm-ia-bloc--avis" open={ouvert}>
      <summary>
        <Icon name="user" size={16} />
        Avis du recruteur · {r.label}
      </summary>
      <div className="adm-ia-avis">
        <section>
          <h5 className="adm-label">Verdict</h5>
          <p>{avis.verdict}</p>
        </section>
        {avis.pointsForts.length > 0 && (
          <section>
            <h5 className="adm-label">Points forts</h5>
            <ul>
              {avis.pointsForts.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        )}
        {avis.aAmeliorer.length > 0 && (
          <section>
            <h5 className="adm-label">À améliorer</h5>
            <ol>
              {avis.aAmeliorer.map((a) => (
                <li key={a.point}>
                  <b>{a.point}</b> {a.raison}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </details>
  );
}

/** Mode de secours : copier le prompt dans Claude, recoller sa réponse. */
export function OptionClaude({ prompt, ouvert, onOuvert, reponse, onReponse, idBase, introuvable, children }: { prompt: string; ouvert: boolean; onOuvert: (o: boolean) => void; reponse: string; onReponse: (v: string) => void; idBase: string; introuvable: ReactNode; children?: ReactNode }) {
  // Le message « Prompt copié » ne vaut que pour le prompt copié : il disparaît si le prompt change.
  const [copiePour, setCopiePour] = useState<{ etat: "ok" | "manuel"; prompt: string } | null>(null);
  const copie = copiePour?.prompt === prompt ? copiePour.etat : "";
  const setCopie = (etat: "ok" | "manuel") => setCopiePour({ etat, prompt });
  const [voirPrompt, setVoirPrompt] = useState(false);
  const copierEtOuvrir = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopie("ok");
    } catch {
      setCopie("manuel");
      setVoirPrompt(true);
    }
    window.open("https://claude.ai/new", "_blank", "noopener,noreferrer");
  };
  return (
    <details className="adm-ia-claude" open={ouvert} onToggle={(e) => onOuvert(e.currentTarget.open)}>
      <summary>Autre option : copier le prompt pour Claude</summary>
      <ol className="adm-ia-etapes">
        <li>
          <b>Copier le prompt et ouvrir Claude</b>
          <div className="adm-ia-actions">
            <button type="button" className="adm-btn adm-btn--outline" onClick={copierEtOuvrir}>
              <Icon name="external" />
              Copier et ouvrir Claude
              <span className="adm-sr"> (nouvel onglet)</span>
            </button>
            <button type="button" className="adm-btn adm-btn--link" aria-expanded={voirPrompt} onClick={() => setVoirPrompt((v) => !v)}>
              {voirPrompt ? "Masquer le prompt" : "Voir le prompt"}
            </button>
          </div>
          <p className="adm-help" role="status">
            {copie === "ok" && "Prompt copié : colle-le dans la conversation Claude (Cmd + V)."}
            {copie === "manuel" && "La copie automatique a échoué : sélectionne le prompt ci-dessous et copie-le."}
          </p>
          {voirPrompt && <textarea className="adm-textarea adm-ia-prompt" readOnly rows={10} value={prompt} aria-label="Prompt pour Claude" onFocus={(e) => e.currentTarget.select()} />}
        </li>
        <li>
          <label className="adm-label" htmlFor={`${idBase}-reponse`}>
            <b>Coller la réponse de Claude</b>
          </label>
          <textarea id={`${idBase}-reponse`} className="adm-textarea" rows={6} value={reponse} onChange={(e) => onReponse(e.target.value)} placeholder="Colle ici toute la réponse, avec les propositions." />
          {introuvable && <p className="adm-error">{introuvable}</p>}
        </li>
      </ol>
      {children}
    </details>
  );
}

// ── Panneau d'un champ ──────────────────────────────────────────────────────────────────

export function AvisIA({ champ, valeur, max, onReplace }: { champ: string; valeur: string; max?: number; onReplace: (v: string) => void }) {
  const page = useContext(IaContexte);
  const dialog = useRef<HTMLDialogElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const titreId = useId();
  const { recruteur, choisir, relire } = useRecruteur();
  const { etat, lancer, annuler, arreter, reinit } = useAnalyse<Avis>();
  const claude = useSourcesClaude();
  const [modeClaude, setModeClaude] = useState(false);
  const [reponse, setReponse] = useState("");
  const [mode, setMode] = useState<Mode>("relire");
  const [notes, setNotes] = useState("");
  const completer = mode === "completer";
  const titreResultat = useFocusResultat(etat.type === "avis");
  useModale(dialog, arreter);

  const ctx: ContexteAvis = { page: page?.page ?? "Administration du portfolio", infos: page?.infos, github: page?.github || undefined, champ, max };
  const prompt = promptAvis(valeur, ctx, recruteur, claude.profil, mode, completer ? { notes, depot: claude.depot } : {});
  const propositionClaude = reponse ? extraireProposition(reponse) : null;

  const ouvrir = () => {
    relire();
    reinit();
    setReponse("");
    dialog.current?.showModal();
    claude.charger(page?.github);
  };

  const analyser = async () => {
    const r = await lancer({ texte: valeur, ctx, recruteur, mode, notes: completer ? notes : "" });
    if (r.sansCle) setModeClaude(true);
  };

  const remplacer = (v: string) => {
    onReplace(v);
    dialog.current?.close();
  };

  return (
    <>
      <button type="button" className="adm-ia-btn" onClick={ouvrir}>
        <Icon name="sparkle" size={14} />
        Avis de l’IA
        <span className="adm-sr"> sur « {champ} »</span>
      </button>
      <dialog ref={dialog} className="adm-ia" aria-labelledby={titreId}>
        <div className="adm-ia-tete">
          <h2 className="adm-h2" id={titreId}>
            Avis de l’IA · {champ}
          </h2>
          <button type="button" className="adm-icon-btn" aria-label="Fermer" onClick={() => dialog.current?.close()}>
            ×
          </button>
        </div>

        <div className="adm-ia-reglages">
          <fieldset className="adm-ia-recruteur">
            <legend className="adm-label">Que veux-tu faire ?</legend>
            <div>
              {(
                [
                  ["relire", "Relire"],
                  ["completer", "Compléter"],
                ] as const
              ).map(([m, l]) => (
                <button key={m} type="button" className="adm-btn" aria-pressed={mode === m} onClick={() => (setMode(m), reinit())}>
                  {l}
                </button>
              ))}
            </div>
          </fieldset>
          {completer && (
            <>
              <p className="adm-help">
                L’IA rédige un court paragraphe plus détaillé à partir de la fiche, de ton profil{page?.github ? ", du code de ton dépôt GitHub" : ""} et de tes notes. Elle n’invente rien : ce qui ne vient pas de ces sources est signalé.
              </p>
              <NotesIA id={`${titreId}-notes`} valeur={notes} onChange={setNotes} champRef={notesRef} />
            </>
          )}
          <ChoixRecruteur recruteur={recruteur} onChoisir={(r) => (choisir(r), reinit())} />
          <div className="adm-ia-actions">
            <button type="button" className="adm-btn" onClick={analyser} disabled={etat.type === "chargement"} aria-describedby={`${titreId}-gemini`}>
              <Icon name="sparkle" />
              {etat.type === "chargement" ? (completer ? "Rédaction en cours…" : "Analyse en cours…") : etat.type === "avis" ? (completer ? "Relancer la rédaction" : "Relancer l’analyse") : completer ? "Compléter avec l’IA" : "Analyser avec l’IA"}
            </button>
          </div>
          <p className="adm-help" id={`${titreId}-gemini`}>
            Analyse par Google Gemini (offre gratuite) : le texte et son contexte{completer ? ", tes notes et le code de ton dépôt GitHub public" : ""} sont envoyés à Google, qui peut s’en servir pour améliorer ses services.
          </p>
        </div>

        <div aria-live="polite">
          {etat.type === "chargement" && <Progression etape={etat.etape} libelles={completer ? LIBELLE_COMPLETER : LIBELLE_ETAPE} onAnnuler={annuler} />}
          {etat.type === "erreur" && (
            <p className="adm-error" role="alert">
              {etat.message}
            </p>
          )}
        </div>
        {etat.type === "avis" && (
          <div className="adm-ia-resultat">
            <TitreResultat titreRef={titreResultat} modele={etat.avis.modele} />
            <Proposition titre="Version proposée" actuel={valeur} texte={etat.avis.proposition} max={max} onReplace={remplacer}>
              <BlocAVerifier items={etat.avis.affirmationsNonSourcees ?? []} />
            </Proposition>
            <BlocQuestions questions={etat.avis.questions} onRepondre={completer ? () => notesRef.current?.focus() : undefined} />
            <BlocAvisRecruteur avis={etat.avis} recruteur={recruteur} ouvert={!completer} />
          </div>
        )}

        <OptionClaude
          prompt={prompt}
          ouvert={modeClaude}
          onOuvert={setModeClaude}
          reponse={reponse}
          onReponse={setReponse}
          idBase={titreId}
          introuvable={reponse && !propositionClaude ? "Je ne trouve pas la version proposée : vérifie que la réponse collée contient bien les lignes « <<<PROPOSITION » et « PROPOSITION>>> »." : null}
        >
          {propositionClaude && <Proposition titre="Version proposée par Claude" actuel={valeur} texte={propositionClaude} max={max} onReplace={remplacer} />}
        </OptionClaude>
      </dialog>
    </>
  );
}

// Jauge (31 oct. 2026) : uniquement des données réelles envoyées par l'API. Pendant la réflexion,
// Gemini ne dit pas où il en est : la jauge reste fixe et l'affiche. Pendant la rédaction, elle suit
// les caractères reçus, comparés à la longueur probable de la réponse (sans jamais afficher 100 %).
const heure = (t: number) => new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const RAISON_ATTENTE: Record<string, string> = {
  sature: "Gemini est saturé (offre gratuite)",
  lent: "Gemini ne répond pas",
  quota: "Limite de demandes par minute atteinte",
};

export function Progression({ etape, libelles, onAnnuler }: { etape: Etape; libelles: Record<NomEtape, string>; onAnnuler: () => void }) {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [debutTotal] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setMaintenant(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  const secondes = (depuis: number) => Math.max(0, Math.floor((maintenant - depuis) / 1000));
  const part = etape.recus && etape.attendus ? Math.min(etape.recus / etape.attendus, 0.97) : 0;
  const pct = { envoi: 2, connexion: 5, attente: 5, reflexion: 10, redaction: Math.round(12 + 86 * part) }[etape.etape];
  const libelle =
    etape.etape === "attente" && etape.reprise
      ? `${RAISON_ATTENTE[etape.raison ?? ""] ?? RAISON_ATTENTE.sature} : nouvel essai à ${heure(etape.reprise)}${etape.essai ? ` (essai ${etape.essai})` : ""}.`
      : libelles[etape.etape];
  const detail =
    etape.etape === "redaction" && etape.recus
      ? `${etape.recus.toLocaleString("fr-FR")} caractères reçus sur environ ${Math.max(etape.recus, etape.attendus ?? 0).toLocaleString("fr-FR")}`
      : etape.etape === "reflexion"
        ? `réflexion depuis ${secondes(etape.debut)} s · Gemini n’indique pas son avancement pendant cette étape`
        : etape.etape === "attente" && etape.reprise
          ? `dans ${Math.max(0, Math.ceil((etape.reprise - maintenant) / 1000))} s`
          : "";
  return (
    <div className="adm-ia-progression">
      <div className="adm-ia-progression-tete">
        {/* Seul le libellé de l'étape est annoncé (zone aria-live parente), pas chaque seconde. */}
        <p className="adm-help">{libelle}</p>
        <button type="button" className="adm-btn adm-btn--outline adm-ia-annuler" onClick={onAnnuler}>
          <Icon name="close" size={14} />
          Annuler
          <span className="adm-sr"> l’analyse</span>
        </button>
      </div>
      <div className="adm-ia-barre" role="progressbar" aria-label="Avancement de l’analyse" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={libelle}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="adm-help" aria-hidden="true">
        {secondes(debutTotal)} s au total{detail ? ` · ${detail}` : ""}
      </p>
    </div>
  );
}

/** Texte actuel et texte proposé, côte à côte, avec la longueur. */
export function AvantApres({ actuel, texte, max }: { actuel: string; texte: string; max?: number }) {
  const trop = max ? texte.length > max : false;
  return (
    <div className="adm-ia-avant-apres">
      <div className="adm-ia-avant">
        <span className="adm-ia-etiquette">Actuel</span>
        <p>{actuel.trim() || <i>Champ vide</i>}</p>
      </div>
      <div className="adm-ia-apres">
        <span className="adm-ia-etiquette">Proposé</span>
        <p>{texte}</p>
        <span className="adm-count" data-over={trop}>
          {texte.length}
          {max ? ` / ${max}` : ""} caractères{trop ? " · au-delà de la longueur conseillée" : ""}
        </span>
      </div>
    </div>
  );
}

function Proposition({ titre, actuel, texte, max, onReplace, children }: { titre: string; actuel: string; texte: string; max?: number; onReplace: (v: string) => void; children?: ReactNode }) {
  const [copie, setCopie] = useState(false);
  const id = useId();
  return (
    <section className="adm-ia-bloc adm-ia-bloc--proposition" aria-labelledby={id}>
      <TitreBloc icone="sparkle" id={id}>
        {titre}
      </TitreBloc>
      <AvantApres actuel={actuel} texte={texte} max={max} />
      {children}
      <div className="adm-ia-actions">
        <button type="button" className="adm-btn" onClick={() => onReplace(texte)}>
          Remplacer dans le champ
        </button>
        <button
          type="button"
          className="adm-btn adm-btn--outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(texte);
              setCopie(true);
            } catch {
              setCopie(false);
            }
          }}
        >
          <Icon name="copy" />
          {copie ? "Copié" : "Copier"}
        </button>
      </div>
      <p className="adm-help">Le remplacement n’enregistre rien : relis le champ, puis enregistre comme d’habitude.</p>
    </section>
  );
}
