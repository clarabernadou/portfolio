"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { extraireProposition, promptAvis, RECRUTEURS, type Avis, type ContexteAvis, type Recruteur } from "@/lib/admin/avis-ia";
import { Icon } from "./icons";

// Bouton « Avis de l'IA » des champs de texte (lib/admin/avis-ia.ts). Mode intégré :
// l'analyse de Google Gemini s'affiche dans le panneau. Mode de secours : prompt à copier
// dans Claude, réponse à recoller. Dans les 2 cas, rien n'est enregistré sans Clara.

type Page = Pick<ContexteAvis, "page" | "infos">;
const IaContexte = createContext<Page | null>(null);

/** Décrit la page en cours (et les autres champs utiles) pour tous les boutons qu'elle contient. */
export function IaPage({ page, infos, children }: Page & { children: ReactNode }) {
  return <IaContexte.Provider value={{ page, infos }}>{children}</IaContexte.Provider>;
}

const CLE_RECRUTEUR = "admin-avis-ia-recruteur";

type Etat = { type: "vide" } | { type: "chargement" } | { type: "erreur"; message: string } | { type: "avis"; avis: Avis };

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

  const ctx: ContexteAvis = { page: page?.page ?? "Administration du portfolio", infos: page?.infos, champ, max };
  const prompt = promptAvis(valeur, ctx, recruteur);
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
  };

  // La fenêtre modale bloque le défilement de la page (CLAUDE.md, accessibilité).
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const fermer = () => document.documentElement.classList.remove("adm-modale-ouverte");
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
    setEtat({ type: "chargement" });
    try {
      const r = await fetch("/api/admin/avis-ia", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texte: valeur, ctx, recruteur }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (data.sansCle) setModeClaude(true);
        return setEtat({ type: "erreur", message: data.error ?? (r.status === 401 ? "Ta session a expiré : reconnecte-toi." : "L’analyse a échoué.") });
      }
      setEtat({ type: "avis", avis: data as Avis });
    } catch {
      setEtat({ type: "erreur", message: "Connexion impossible : réessaie dans un instant." });
    }
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
            {etat.type === "chargement" ? "Analyse en cours…" : etat.type === "avis" ? "Relancer l’analyse" : "Analyser avec l’IA"}
          </button>
        </div>
        <p className="adm-help" id={`${titreId}-gemini`}>
          Analyse par Google Gemini (offre gratuite) : le texte et son contexte sont envoyés à Google, qui peut s’en servir pour améliorer ses services.
        </p>

        <div aria-live="polite">
          {etat.type === "chargement" && <p className="adm-help">L’IA relit ton texte, cela prend quelques secondes.</p>}
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
              <Proposition texte={etat.avis.proposition} max={max} idBase={titreId} onReplace={remplacer} />
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
