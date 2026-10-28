"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { extraireProposition, promptAvis, RECRUTEURS, type Avis, type ContexteAvis, type Mode, type Recruteur } from "@/lib/admin/avis-ia";
import { Icon } from "./icons";

// Bouton « Avis de l'IA » des champs de texte (lib/admin/avis-ia.ts) : relire le texte, ou le
// compléter en un court paragraphe détaillé à partir des sources (fiche, profil, notes, dépôt
// GitHub). Mode intégré : l'analyse de Google Gemini s'affiche dans le panneau. Mode de secours :
// prompt à copier dans Claude, réponse à recoller. Dans les 2 cas, rien n'est enregistré sans Clara.

type Page = Pick<ContexteAvis, "page" | "infos" | "github">;
const IaContexte = createContext<Page | null>(null);

/** Décrit la page en cours (et les autres champs utiles) pour tous les boutons qu'elle contient. */
export function IaPage({ page, infos, github, children }: Page & { children: ReactNode }) {
  return <IaContexte.Provider value={{ page, infos, github }}>{children}</IaContexte.Provider>;
}

const CLE_RECRUTEUR = "admin-avis-ia-recruteur";

type Etape = { etape: "envoi" | "principal" | "secours"; debut: number; delai: number };
type Etat = { type: "vide" } | { type: "chargement"; etape: Etape } | { type: "erreur"; message: string } | { type: "avis"; avis: Avis & { modele?: string } };

// Libellés des étapes réelles envoyées par l'API (app/api/admin/avis-ia/route.ts).
const LIBELLE_ETAPE = {
  envoi: "Envoi du texte à Gemini…",
  principal: "Gemini relit ton texte et prépare sa proposition…",
  secours: "Le modèle principal est saturé ou trop lent : passage au modèle de secours, plus rapide…",
};
const LIBELLE_COMPLETER = {
  envoi: "Lecture des sources et envoi à Gemini…",
  principal: "Gemini rédige une version plus détaillée à partir de tes sources…",
  secours: LIBELLE_ETAPE.secours,
};

export function AvisIA({ champ, valeur, max, onReplace }: { champ: string; valeur: string; max?: number; onReplace: (v: string) => void }) {
  const page = useContext(IaContexte);
  const dialog = useRef<HTMLDialogElement>(null);
  const titreId = useId();
  const [recruteur, setRecruteur] = useState<Recruteur>("hybride");
  const [etat, setEtat] = useState<Etat>({ type: "vide" });
  const [modeClaude, setModeClaude] = useState(false);
  const [copie, setCopie] = useState<"" | "ok" | "manuel">("");
  const [reponse, setReponse] = useState("");
  const [voirPrompt, setVoirPrompt] = useState(false);
  const [profilIA, setProfilIA] = useState("");
  const [depot, setDepot] = useState("");
  const [mode, setMode] = useState<Mode>("relire");
  const [notes, setNotes] = useState("");
  const requete = useRef<AbortController | null>(null);
  const completer = mode === "completer";

  const ctx: ContexteAvis = { page: page?.page ?? "Administration du portfolio", infos: page?.infos, github: page?.github || undefined, champ, max };
  const prompt = promptAvis(valeur, ctx, recruteur, profilIA, mode, completer ? { notes, depot } : {});
  const propositionClaude = reponse ? extraireProposition(reponse) : null;

  const ouvrir = () => {
    try {
      const r = localStorage.getItem(CLE_RECRUTEUR);
      if (r === "hybride" || r === "tech" || r === "design") setRecruteur(r);
    } catch {
      /* stockage indisponible : on garde le profil par défaut */
    }
    setEtat({ type: "vide" });
    setCopie("");
    setReponse("");
    dialog.current?.showModal();
    // Profil pour l'IA (privé) et résumé du dépôt GitHub, utiles au prompt du mode Claude.
    fetch(`/api/admin/avis-ia${page?.github ? `?github=${encodeURIComponent(page.github)}` : ""}`)
      .then((r) => (r.ok ? r.json() : { profil: "" }))
      .then((d) => (setProfilIA(d.profil ?? ""), setDepot(d.depot ?? "")))
      .catch(() => setProfilIA(""));
  };

  // La fenêtre modale bloque le défilement de la page (CLAUDE.md, accessibilité).
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const fermer = () => {
      document.documentElement.classList.remove("adm-modale-ouverte");
      // Fermer le panneau arrête aussi une analyse en cours.
      requete.current?.abort();
    };
    const obs = new MutationObserver(() => document.documentElement.classList.toggle("adm-modale-ouverte", d.open));
    obs.observe(d, { attributes: true, attributeFilter: ["open"] });
    d.addEventListener("close", fermer);
    return () => {
      obs.disconnect();
      d.removeEventListener("close", fermer);
      fermer();
    };
  }, []);

  const choisir = (r: Recruteur) => {
    setRecruteur(r);
    setEtat({ type: "vide" });
    setCopie("");
    try {
      localStorage.setItem(CLE_RECRUTEUR, r);
    } catch {
      /* préférence non mémorisée */
    }
  };

  const analyser = async () => {
    const ctrl = new AbortController();
    requete.current = ctrl;
    setEtat({ type: "chargement", etape: { etape: "envoi", debut: Date.now(), delai: 3000 } });
    try {
      const r = await fetch("/api/admin/avis-ia", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texte: valeur, ctx, recruteur, mode, notes: completer ? notes : "" }), signal: ctrl.signal });
      // Erreurs immédiates (clé absente, session expirée) : réponse JSON classique.
      if (!r.ok || !r.body || !r.headers.get("content-type")?.includes("ndjson")) {
        const data = await r.json().catch(() => ({}));
        if (data.sansCle) setModeClaude(true);
        return setEtat({ type: "erreur", message: data.error ?? (r.status === 401 ? "Ta session a expiré : reconnecte-toi." : "L’analyse a échoué.") });
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
          if (e.type === "etape") setEtat({ type: "chargement", etape: { etape: e.etape, debut: Date.now(), delai: e.delai } });
          else if (e.type === "resultat") setEtat({ type: "avis", avis: e as Avis });
          else if (e.type === "erreur") setEtat({ type: "erreur", message: e.error });
        }
      }
    } catch {
      if (ctrl.signal.aborted) return;
      setEtat({ type: "erreur", message: "Connexion impossible : réessaie dans un instant." });
    } finally {
      if (requete.current === ctrl) requete.current = null;
    }
  };

  const annuler = () => {
    requete.current?.abort();
    requete.current = null;
    setEtat({ type: "erreur", message: "Analyse annulée. Tu peux la relancer quand tu veux." });
  };

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

        <fieldset className="adm-ia-recruteur">
          <legend className="adm-label">Que veux-tu faire ?</legend>
          <div>
            {(
              [
                ["relire", "Relire"],
                ["completer", "Compléter"],
              ] as const
            ).map(([m, l]) => (
              <button key={m} type="button" className="adm-btn" aria-pressed={mode === m} onClick={() => (setMode(m), setEtat({ type: "vide" }), setCopie(""))}>
                {l}
              </button>
            ))}
          </div>
        </fieldset>
        {completer && (
          <div className="adm-ia-notes">
            <p className="adm-help">
              L’IA rédige un court paragraphe plus détaillé à partir de la fiche, de ton profil{page?.github ? ", du code de ton dépôt GitHub" : ""} et de tes notes. Elle n’invente rien : ce qui ne vient pas de ces sources est signalé.
            </p>
            <label className="adm-label" htmlFor={`${titreId}-notes`}>
              Tes notes pour l’IA <span className="adm-help">(facultatif)</span>
            </label>
            <textarea
              id={`${titreId}-notes`}
              className="adm-textarea"
              rows={4}
              value={notes}
              onChange={(e) => (setNotes(e.target.value), setCopie(""))}
              aria-describedby={`${titreId}-notes-aide`}
              placeholder="Par exemple : ce que tu as fait, tes choix, une difficulté, le résultat."
            />
            <p className="adm-help" id={`${titreId}-notes-aide`}>
              En vrac, sans mise en forme. C’est la seule source pour ce que la fiche ne dit pas ; rien n’est enregistré.
            </p>
          </div>
        )}

        <fieldset className="adm-ia-recruteur">
          <legend className="adm-label">Point de vue du recruteur</legend>
          <div>
            {RECRUTEURS.map((r) => (
              <button key={r.id} type="button" className="adm-btn" aria-pressed={recruteur === r.id} onClick={() => choisir(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="adm-ia-actions">
          <button type="button" className="adm-btn" onClick={analyser} disabled={etat.type === "chargement"} aria-describedby={`${titreId}-gemini`}>
            <Icon name="sparkle" />
            {etat.type === "chargement" ? (completer ? "Rédaction en cours…" : "Analyse en cours…") : etat.type === "avis" ? (completer ? "Relancer la rédaction" : "Relancer l’analyse") : completer ? "Compléter avec l’IA" : "Analyser avec l’IA"}
          </button>
        </div>
        <p className="adm-help" id={`${titreId}-gemini`}>
          Analyse par Google Gemini (offre gratuite) : le texte et son contexte{completer ? ", tes notes et le code de ton dépôt GitHub public" : ""} sont envoyés à Google, qui peut s’en servir pour améliorer ses services.
        </p>

        <div aria-live="polite">
          {etat.type === "chargement" && <Progression etape={etat.etape} libelles={completer ? LIBELLE_COMPLETER : LIBELLE_ETAPE} onAnnuler={annuler} />}
          {etat.type === "erreur" && (
            <p className="adm-error" role="alert">
              {etat.message}
            </p>
          )}
          {etat.type === "avis" && (
            <div className="adm-ia-avis">
              <p>
                <b>Verdict.</b> {etat.avis.verdict}
              </p>
              {etat.avis.pointsForts.length > 0 && (
                <>
                  <h3 className="adm-label">Points forts</h3>
                  <ul>
                    {etat.avis.pointsForts.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </>
              )}
              {etat.avis.aAmeliorer.length > 0 && (
                <>
                  <h3 className="adm-label">À améliorer</h3>
                  <ol>
                    {etat.avis.aAmeliorer.map((a) => (
                      <li key={a.point}>
                        <b>{a.point}</b> {a.raison}
                      </li>
                    ))}
                  </ol>
                </>
              )}
              {etat.avis.questions.length > 0 && (
                <>
                  <h3 className="adm-label">Questions pour toi</h3>
                  <ul>
                    {etat.avis.questions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </>
              )}
              {etat.avis.affirmationsNonSourcees?.length > 0 && (
                <div className="adm-ia-alerte">
                  <h3 className="adm-label">À vérifier avant d’accepter : informations absentes de tes sources</h3>
                  <ul>
                    {etat.avis.affirmationsNonSourcees.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Proposition texte={etat.avis.proposition} max={max} idBase={titreId} onReplace={remplacer} />
              {etat.avis.modele && <p className="adm-help">Analyse faite par {etat.avis.modele}{etat.avis.modele.includes("lite") ? " (modèle de secours, le principal était saturé)" : ""}.</p>}
            </div>
          )}
        </div>

        <details className="adm-ia-claude" open={modeClaude} onToggle={(e) => setModeClaude(e.currentTarget.open)}>
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
              <label className="adm-label" htmlFor={`${titreId}-reponse`}>
                <b>Coller la réponse de Claude</b>
              </label>
              <textarea id={`${titreId}-reponse`} className="adm-textarea" rows={6} value={reponse} onChange={(e) => setReponse(e.target.value)} placeholder="Colle ici toute la réponse, avec la version proposée." />
              {reponse && !propositionClaude && <p className="adm-error">Je ne trouve pas la version proposée : vérifie que la réponse collée contient bien les lignes « &lt;&lt;&lt;PROPOSITION » et « PROPOSITION&gt;&gt;&gt; ».</p>}
            </li>
          </ol>
          {propositionClaude && <Proposition texte={propositionClaude} max={max} idBase={`${titreId}-c`} onReplace={remplacer} />}
        </details>
      </dialog>
    </>
  );
}

// Barre de progression : l'étape vient de l'API, l'avancement dans l'étape est estimé
// d'après le temps écoulé (Gemini ne dit pas où il en est), sans jamais atteindre 100 %.
function Progression({ etape, libelles, onAnnuler }: { etape: Etape; libelles: typeof LIBELLE_ETAPE; onAnnuler: () => void }) {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setMaintenant(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  const ecoule = Math.max(0, maintenant - etape.debut);
  const part = 1 - Math.exp(-ecoule / (etape.delai / 3));
  const pct = Math.round(etape.etape === "envoi" ? 2 + 6 * part : etape.etape === "principal" ? 8 + 80 * part : 55 + 40 * part);
  const secondes = Math.floor(ecoule / 1000);
  return (
    <div className="adm-ia-progression">
      <div className="adm-ia-progression-tete">
        {/* Seul le libellé de l'étape est annoncé (zone aria-live parente), pas chaque seconde. */}
        <p className="adm-help">{libelles[etape.etape]}</p>
        <button type="button" className="adm-btn adm-btn--outline adm-ia-annuler" onClick={onAnnuler}>
          <Icon name="close" size={14} />
          Annuler
          <span className="adm-sr"> l’analyse</span>
        </button>
      </div>
      <div className="adm-ia-barre" role="progressbar" aria-label="Avancement de l’analyse (estimation)" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={libelles[etape.etape]}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="adm-help" aria-hidden="true">
        {secondes > 0 ? `${secondes} s · ` : ""}
        {"en général 10 à 60 secondes selon la charge de Gemini"}
      </p>
    </div>
  );
}

function Proposition({ texte, max, idBase, onReplace }: { texte: string; max?: number; idBase: string; onReplace: (v: string) => void }) {
  const [copie, setCopie] = useState(false);
  const trop = max ? texte.length > max : false;
  return (
    <section className="adm-ia-proposition" aria-labelledby={`${idBase}-prop`}>
      <h3 className="adm-label" id={`${idBase}-prop`}>
        Version proposée
      </h3>
      <p>{texte}</p>
      <span className="adm-count" data-over={trop}>
        {texte.length}
        {max ? ` / ${max}` : ""} caractères{trop ? " · au-delà de la longueur conseillée" : ""}
      </span>
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
          {copie ? "Copié" : "Copier"}
        </button>
      </div>
      <p className="adm-help">Le remplacement n’enregistre rien : relis le champ, puis enregistre comme d’habitude.</p>
    </section>
  );
}
