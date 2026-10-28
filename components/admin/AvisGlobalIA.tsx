"use client";

import { useId, useRef, useState } from "react";
import { extraireFiche, memeTexte, promptFiche, type AvisFiche, type FicheIA } from "@/lib/admin/avis-ia";
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

// Avis de l'IA sur une fiche entière (demandes de Clara, 28 oct. 2026) : un seul appel propose
// tous les textes d'un projet (accroche, contexte, carte d'accueil, tags tirés des sources) ou
// d'une expérience (contexte, puces, note). Clara coche ce qu'elle garde ; rien n'est enregistré
// sans elle.

export interface Changements {
  /** Texte retenu pour chaque clé de champ cochée. */
  valeurs: Record<string, string>;
  tags: string[];
}

type Propositions = Pick<AvisFiche, "champs" | "tagsProposes">;

export function AvisGlobalIA({ fiche, titre, intro, onAppliquer }: { fiche: FicheIA; titre: string; intro: string; onAppliquer: (c: Changements) => void }) {
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
        {titre}
      </button>
      <dialog ref={dialog} className="adm-ia" aria-labelledby={titreId}>
        <div className="adm-ia-tete">
          <h2 className="adm-h2" id={titreId}>
            {titre}
          </h2>
          <button type="button" className="adm-icon-btn" aria-label="Fermer" onClick={() => dialog.current?.close()}>
            ×
          </button>
        </div>

        <div className="adm-ia-reglages">
          <p className="adm-help">
            {intro} L’IA s’appuie sur la fiche, ton profil{fiche.github ? ", le code de ton dépôt GitHub" : ""} et tes notes. Elle n’invente rien : ce qui ne vient pas de ces sources est signalé. Tu choisis ensuite ce que tu gardes.
          </p>
          <NotesIA id={`${titreId}-notes`} valeur={notes} onChange={setNotes} champRef={notesRef} />
          <ChoixRecruteur recruteur={recruteur} onChoisir={(r) => (choisir(r), reinit())} />
          <div className="adm-ia-actions">
            <button type="button" className="adm-btn" onClick={analyser} disabled={etat.type === "chargement"} aria-describedby={`${titreId}-gemini`}>
              <Icon name="sparkle" />
              {etat.type === "chargement" ? "Analyse en cours…" : etat.type === "avis" ? "Relancer l’analyse" : "Lancer l’analyse"}
            </button>
          </div>
          <p className="adm-help" id={`${titreId}-gemini`}>
            Analyse par Google Gemini (offre gratuite) : la fiche, tes notes{fiche.github ? " et le code de ton dépôt GitHub public" : ""} sont envoyés à Google, qui peut s’en servir pour améliorer ses services.
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
          introuvable={reponse && !propositionsClaude ? "Je ne trouve aucune proposition : vérifie que la réponse collée contient bien les marqueurs « <<<… » et leurs marqueurs de fin." : null}
        >
          {propositionsClaude && <ChoixPropositions key={reponse} fiche={fiche} propositions={propositionsClaude} onAppliquer={appliquer} />}
        </OptionClaude>
      </dialog>
    </>
  );
}

/**
 * Les propositions champ par champ, chacune avec son avant/après et ses points à vérifier ;
 * Clara coche ce qu'elle garde. Les textes que l'IA juge déjà bons sont regroupés sur une ligne.
 */
function ChoixPropositions({ fiche, propositions, onAppliquer }: { fiche: FicheIA; propositions: Propositions; onAppliquer: (c: Changements) => void }) {
  const id = useId();
  const avecProposition = fiche.champs.filter((c) => propositions.champs[c.cle]);
  const changes = avecProposition.filter((c) => !memeTexte(propositions.champs[c.cle].proposition, c.valeur));
  const inchanges = avecProposition.filter((c) => memeTexte(propositions.champs[c.cle].proposition, c.valeur));
  // Par défaut : les textes sont cochés (il faut les relire), les tags non (à ajouter un par un).
  const [gardes, setGardes] = useState<Set<string>>(() => new Set(changes.map((c) => c.cle)));
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
      {changes.length > 0 && (
        <ol className="adm-ia-champs">
          {changes.map((c) => {
            const p = propositions.champs[c.cle];
            return (
              <li key={c.cle} className="adm-ia-champ">
                <label className="adm-check adm-ia-champ-titre">
                  <input type="checkbox" checked={gardes.has(c.cle)} onChange={() => setGardes((s) => basculer(s, c.cle))} />
                  {c.champ}
                </label>
                <AvantApres actuel={c.valeur} texte={p.proposition} max={c.max} />
                <BlocAVerifier items={p.nonSourcees} />
              </li>
            );
          })}
        </ol>
      )}
      {inchanges.length > 0 && (
        <p className="adm-ia-champ-titre">
          <Icon name="check" size={16} />
          <span>
            {changes.length ? "Déjà bons selon l’IA" : "Tout est déjà bon selon l’IA"}
            <span className="adm-help">
              {" · "}
              {inchanges.length > 4 ? `${inchanges.length} textes, rien à changer` : inchanges.map((c) => c.champ).join(", ")}
            </span>
          </span>
        </p>
      )}
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
      {(changes.length > 0 || propositions.tagsProposes.length > 0) && (
        <>
          <div className="adm-ia-actions">
            <button
              type="button"
              className="adm-btn"
              disabled={total === 0}
              onClick={() => onAppliquer({ valeurs: Object.fromEntries([...gardes].map((k) => [k, propositions.champs[k].proposition])), tags: [...tags] })}
            >
              <Icon name="check" />
              Appliquer{total > 0 ? ` (${total})` : ""}
            </button>
          </div>
          <p className="adm-help">Rien n’est enregistré : relis, puis enregistre comme d’habitude.</p>
        </>
      )}
    </section>
  );
}
