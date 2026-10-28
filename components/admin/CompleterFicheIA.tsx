"use client";

import { useId, useRef, useState } from "react";
import { CHAMPS_FICHE, extraireFiche, promptFiche, type AvisFiche, type CleFiche, type FicheIA } from "@/lib/admin/avis-ia";
import {
  AvantApres,
  BlocAvisRecruteur,
  BlocAVerifier,
  BlocQuestions,
  ChoixRecruteur,
  LIBELLE_COMPLETER,
  NotesIA,
  OptionClaude,
  Progression,
  TitreResultat,
  useAnalyse,
  useFocusResultat,
  useModale,
  useRecruteur,
  useSourcesClaude,
} from "./AvisIA";
import { Icon } from "./icons";

// « Compléter la fiche avec l'IA » (demande de Clara, 28 oct. 2026) : un seul appel propose tous
// les textes de la fiche projet (accroche, contexte, accroche de la carte d'accueil) et des tags
// tirés des sources. Clara coche ce qu'elle garde ; rien n'est enregistré sans elle.

export interface Changements {
  valeurs: Partial<Record<CleFiche, string>>;
  tags: string[];
}

type Propositions = Pick<AvisFiche, "champs" | "tagsProposes">;

export function CompleterFicheIA({ fiche, onAppliquer }: { fiche: FicheIA; onAppliquer: (c: Changements) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const titreId = useId();
  const { recruteur, choisir, relire } = useRecruteur();
  const { etat, lancer, annuler, arreter, reinit } = useAnalyse<AvisFiche>();
  const claude = useSourcesClaude();
  const [modeClaude, setModeClaude] = useState(false);
  const [reponse, setReponse] = useState("");
  const [notes, setNotes] = useState("");
  const titreResultat = useFocusResultat(etat.type === "avis");
  useModale(dialog, arreter);

  const prompt = promptFiche(fiche, recruteur, claude.profil, { notes, depot: claude.depot });
  const propositionsClaude = reponse ? extraireFiche(reponse, fiche) : null;

  const ouvrir = () => {
    relire();
    reinit();
    setReponse("");
    dialog.current?.showModal();
    claude.charger(fiche.github);
  };

  const analyser = async () => {
    const r = await lancer({ cible: "fiche", fiche, recruteur, notes });
    if (r.sansCle) setModeClaude(true);
  };

  const appliquer = (c: Changements) => {
    onAppliquer(c);
    dialog.current?.close();
  };

  return (
    <>
      <button type="button" className="adm-btn adm-btn--outline" onClick={ouvrir}>
        <Icon name="sparkle" />
        Compléter la fiche avec l’IA
      </button>
      <dialog ref={dialog} className="adm-ia" aria-labelledby={titreId}>
        <div className="adm-ia-tete">
          <h2 className="adm-h2" id={titreId}>
            Compléter la fiche avec l’IA
          </h2>
          <button type="button" className="adm-icon-btn" aria-label="Fermer" onClick={() => dialog.current?.close()}>
            ×
          </button>
        </div>

        <div className="adm-ia-reglages">
          <p className="adm-help">
            L’IA propose en une fois {CHAMPS_FICHE.filter((c) => fiche.valeurs[c.cle] !== undefined).map((c) => c.champ.toLowerCase()).join(", ")} et les tags qui manquent, à partir de la fiche, de ton profil{fiche.github ? ", du code de ton dépôt GitHub" : ""} et de tes notes. Elle n’invente rien : ce qui ne vient pas de ces sources est signalé. Tu choisis ensuite ce que tu gardes.
          </p>
          <NotesIA id={`${titreId}-notes`} valeur={notes} onChange={setNotes} champRef={notesRef} />
          <ChoixRecruteur recruteur={recruteur} onChoisir={(r) => (choisir(r), reinit())} />
          <div className="adm-ia-actions">
            <button type="button" className="adm-btn" onClick={analyser} disabled={etat.type === "chargement"} aria-describedby={`${titreId}-gemini`}>
              <Icon name="sparkle" />
              {etat.type === "chargement" ? "Rédaction en cours…" : etat.type === "avis" ? "Relancer la rédaction" : "Compléter la fiche"}
            </button>
          </div>
          <p className="adm-help" id={`${titreId}-gemini`}>
            Rédaction par Google Gemini (offre gratuite) : la fiche, tes notes et le code de ton dépôt GitHub public sont envoyés à Google, qui peut s’en servir pour améliorer ses services.
          </p>
        </div>

        <div aria-live="polite">
          {etat.type === "chargement" && <Progression etape={etat.etape} libelles={LIBELLE_COMPLETER} onAnnuler={annuler} />}
          {etat.type === "erreur" && (
            <p className="adm-error" role="alert">
              {etat.message}
            </p>
          )}
        </div>
        {etat.type === "avis" && (
          <div className="adm-ia-resultat">
            <TitreResultat titreRef={titreResultat} modele={etat.avis.modele} />
            <ChoixPropositions key={JSON.stringify(etat.avis.champs)} fiche={fiche} propositions={etat.avis} onAppliquer={appliquer} />
            <BlocQuestions questions={etat.avis.questions} onRepondre={() => notesRef.current?.focus()} />
            <BlocAvisRecruteur avis={etat.avis} recruteur={recruteur} ouvert={false} />
          </div>
        )}

        <OptionClaude
          prompt={prompt}
          ouvert={modeClaude}
          onOuvert={setModeClaude}
          reponse={reponse}
          onReponse={setReponse}
          idBase={titreId}
          introuvable={reponse && !propositionsClaude ? "Je ne trouve aucune proposition : vérifie que la réponse collée contient bien les lignes « <<<ACCROCHE », « <<<CONTEXTE »… et leurs marqueurs de fin." : null}
        >
          {propositionsClaude && <ChoixPropositions key={reponse} fiche={fiche} propositions={propositionsClaude} onAppliquer={appliquer} />}
        </OptionClaude>
      </dialog>
    </>
  );
}

/** Les propositions champ par champ, chacune avec son avant/après et ses points à vérifier ; Clara coche ce qu'elle garde. */
function ChoixPropositions({ fiche, propositions, onAppliquer }: { fiche: FicheIA; propositions: Propositions; onAppliquer: (c: Changements) => void }) {
  const id = useId();
  const champs = CHAMPS_FICHE.filter((c) => propositions.champs[c.cle]);
  // Par défaut : les textes sont cochés (il faut les relire), les tags non (à ajouter un par un).
  const [gardes, setGardes] = useState<Set<CleFiche>>(() => new Set(champs.filter((c) => propositions.champs[c.cle]!.proposition !== (fiche.valeurs[c.cle] ?? "").trim()).map((c) => c.cle)));
  const [tags, setTags] = useState<Set<string>>(new Set());
  const basculer = <T,>(s: Set<T>, v: T) => {
    const n = new Set(s);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    return n;
  };
  const total = gardes.size + tags.size;

  return (
    <section className="adm-ia-bloc adm-ia-bloc--proposition" aria-labelledby={id}>
      <h4 className="adm-ia-bloc-titre" id={id}>
        <Icon name="sparkle" size={16} />
        Propositions
      </h4>
      <p className="adm-help">Coche ce que tu gardes. Les textes non cochés restent tels quels.</p>
      <ol className="adm-ia-champs">
        {champs.map((c) => {
          const p = propositions.champs[c.cle]!;
          const identique = p.proposition === (fiche.valeurs[c.cle] ?? "").trim();
          return (
            <li key={c.cle} className="adm-ia-champ">
              {identique ? (
                <p className="adm-ia-champ-titre">
                  <Icon name="check" size={16} />
                  {c.champ} <span className="adm-help">· déjà bon selon l’IA, rien à changer</span>
                </p>
              ) : (
                <>
                  <label className="adm-check adm-ia-champ-titre">
                    <input type="checkbox" checked={gardes.has(c.cle)} onChange={() => setGardes((s) => basculer(s, c.cle))} />
                    {c.champ}
                  </label>
                  <AvantApres actuel={fiche.valeurs[c.cle] ?? ""} texte={p.proposition} max={c.max} />
                  <BlocAVerifier items={p.nonSourcees} />
                </>
              )}
            </li>
          );
        })}
      </ol>
      {propositions.tagsProposes.length > 0 && (
        <fieldset className="adm-ia-tags">
          <legend className="adm-label">Tags à ajouter</legend>
          <p className="adm-help">Repérés dans tes sources et absents de tes tags actuels.</p>
          <div className="adm-checks">
            {propositions.tagsProposes.map((t) => (
              <label key={t} className="adm-check">
                <input type="checkbox" checked={tags.has(t)} onChange={() => setTags((s) => basculer(s, t))} />
                {t}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="adm-ia-actions">
        <button
          type="button"
          className="adm-btn"
          disabled={total === 0}
          onClick={() => onAppliquer({ valeurs: Object.fromEntries([...gardes].map((k) => [k, propositions.champs[k]!.proposition])), tags: [...tags] })}
        >
          <Icon name="check" />
          Appliquer à la fiche{total > 0 ? ` (${total})` : ""}
        </button>
      </div>
      <p className="adm-help">Rien n’est enregistré : relis la fiche, puis enregistre comme d’habitude.</p>
    </section>
  );
}
