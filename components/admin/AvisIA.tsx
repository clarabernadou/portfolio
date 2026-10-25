"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { extraireProposition, promptAvis, RECRUTEURS, type ContexteAvis, type Recruteur } from "@/lib/admin/avis-ia";
import { Icon } from "./icons";

// Bouton « Avis de l'IA » des champs de texte (lib/admin/avis-ia.ts) : le prompt est copié
// et Claude s'ouvre dans un nouvel onglet ; Clara recolle la réponse, le panneau en extrait
// la version proposée. Rien n'est enregistré sans elle.

type Page = Pick<ContexteAvis, "page" | "infos">;
const IaContexte = createContext<Page | null>(null);

/** Décrit la page en cours (et les autres champs utiles) pour tous les boutons qu'elle contient. */
export function IaPage({ page, infos, children }: Page & { children: ReactNode }) {
  return <IaContexte.Provider value={{ page, infos }}>{children}</IaContexte.Provider>;
}

const CLE_RECRUTEUR = "admin-avis-ia-recruteur";

export function AvisIA({ champ, valeur, max, onReplace }: { champ: string; valeur: string; max?: number; onReplace: (v: string) => void }) {
  const page = useContext(IaContexte);
  const dialog = useRef<HTMLDialogElement>(null);
  const titreId = useId();
  const [recruteur, setRecruteur] = useState<Recruteur>("hybride");
  const [copie, setCopie] = useState<"" | "ok" | "manuel">("");
  const [reponse, setReponse] = useState("");
  const [voirPrompt, setVoirPrompt] = useState(false);
  const [copieProposition, setCopieProposition] = useState(false);

  const ctx: ContexteAvis = { page: page?.page ?? "Administration du portfolio", infos: page?.infos, champ, max };
  const prompt = promptAvis(valeur, ctx, recruteur);
  const proposition = reponse ? extraireProposition(reponse) : null;
  const trop = proposition && max ? proposition.length > max : false;

  const ouvrir = () => {
    try {
      const r = localStorage.getItem(CLE_RECRUTEUR);
      if (r === "hybride" || r === "tech" || r === "design") setRecruteur(r);
    } catch {
      /* stockage indisponible : on garde le profil par défaut */
    }
    setCopie("");
    setReponse("");
    setCopieProposition(false);
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
    setCopie("");
    try {
      localStorage.setItem(CLE_RECRUTEUR, r);
    } catch {
      /* préférence non mémorisée */
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

  const copierProposition = async () => {
    if (!proposition) return;
    try {
      await navigator.clipboard.writeText(proposition);
      setCopieProposition(true);
    } catch {
      setCopieProposition(false);
    }
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

        <ol className="adm-ia-etapes">
          <li>
            <b>Copier le prompt et ouvrir Claude</b>
            <p className="adm-help">Le prompt contient ton texte, son emplacement, sa longueur maximale et les règles : ne rien inventer, rester factuel.</p>
            <div className="adm-ia-actions">
              <button type="button" className="adm-btn" onClick={copierEtOuvrir}>
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
            {reponse && !proposition && <p className="adm-error">Je ne trouve pas la version proposée : vérifie que la réponse collée contient bien les lignes « &lt;&lt;&lt;PROPOSITION » et « PROPOSITION&gt;&gt;&gt; ».</p>}
          </li>
        </ol>

        {proposition && (
          <section className="adm-ia-proposition" aria-labelledby={`${titreId}-prop`}>
            <h3 className="adm-label" id={`${titreId}-prop`}>
              Version proposée
            </h3>
            <p>{proposition}</p>
            <span className="adm-count" data-over={trop}>
              {proposition.length}
              {max ? ` / ${max}` : ""} caractères{trop ? " · au-delà de la longueur conseillée" : ""}
            </span>
            <div className="adm-ia-actions">
              <button
                type="button"
                className="adm-btn"
                onClick={() => {
                  onReplace(proposition);
                  dialog.current?.close();
                }}
              >
                Remplacer dans le champ
              </button>
              <button type="button" className="adm-btn adm-btn--outline" onClick={copierProposition}>
                {copieProposition ? "Copié" : "Copier"}
              </button>
            </div>
            <p className="adm-help">Le remplacement n’enregistre rien : relis le champ, puis enregistre comme d’habitude.</p>
          </section>
        )}
      </dialog>
    </>
  );
}
