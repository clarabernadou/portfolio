"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteFormation, readOpenClassrooms, restoreFormation, saveFormation, type FormationInput } from "@/app/admin/(espace)/formations/actions";
import { SelectField, TagInput, TextArea, TextField } from "./fields";
import { RestoreBanner, useDraft } from "./SaveBar";
import { useToast } from "./Toast";
import { Icon } from "./icons";

// Maquette : docs/passation/maquettes/admin/Admin-formations.jpg (panneau de droite).
export function FormationForm({ initial, rattaches }: { initial: FormationInput; rattaches: number }) {
  const router = useRouter();
  const toast = useToast();
  const draft = useDraft<FormationInput>(`admin-formation-${initial.id ?? "nouvelle"}`, initial);
  const f = draft.value;
  const set = <K extends keyof FormationInput>(k: K, v: FormationInput[K]) => draft.setValue({ ...f, [k]: v });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      setError(null);
      const r = await saveFormation(f);
      if (!r.ok) {
        if (r.session) return router.push(`/admin/connexion?expire=1&callbackUrl=${encodeURIComponent(location.pathname + location.search)}`);
        return setError(r.error);
      }
      draft.markSaved(f);
      toast({ message: initial.id ? "Formation enregistrée." : "Formation ajoutée." });
      router.replace(`/admin/formations?id=${r.id}`);
      router.refresh();
    });

  return (
    <form
      className="adm-card"
      aria-labelledby="f-titre"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <h2 className="adm-h2" id="f-titre">
        {initial.id ? `Modifier « ${initial.intitule} »` : "Nouvelle formation"}
      </h2>
      <RestoreBanner show={!!draft.restorable} onRestore={draft.restore} onDismiss={draft.dismiss} />
      <p className="adm-empty" style={{ margin: 0 }}>
        Colle l’adresse de la formation OpenClassrooms : l’intitulé est prérempli.
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <TextField label="Adresse de la formation" type="url" value={f.url} onChange={(v) => set("url", v)} placeholder="https://openclassrooms.com/fr/paths/…" />
        </div>
        <button
          type="button"
          className="adm-btn adm-btn--outline"
          disabled={!f.url || pending}
          onClick={() =>
            start(async () => {
              const r = await readOpenClassrooms(f.url);
              if (r.ok) {
                draft.setValue({ ...f, intitule: r.intitule });
                setInfo(`Intitulé prérempli : « ${r.intitule} ». Vérifie-le avant d’enregistrer.`);
              } else setInfo(r.error);
            })
          }
        >
          Préremplir
        </button>
      </div>
      {info && (
        <p className="adm-help" role="status" style={{ margin: 0 }}>
          {info}
        </p>
      )}
      <div className="adm-grid-2">
        <TextField label="Intitulé" required value={f.intitule} onChange={(v) => set("intitule", v)} />
        <TextField label="Années" required value={f.annees} onChange={(v) => set("annees", v)} placeholder="2025 – 2027" />
        <TextField label="Niveau" value={f.diplome} onChange={(v) => set("diplome", v)} placeholder="Bac+3/4" help="Affiché dans la frise de l’accueil." />
        <TextField label="Établissement et titre" value={f.niveauComplet} onChange={(v) => set("niveauComplet", v)} placeholder="OpenClassrooms · Titre RNCP niveau 6 (Bac+3/4)" help="Ligne du CV, avant le nombre de projets." />
        <SelectField label="Mode" value={f.mode} onChange={(v) => set("mode", v)} options={["En alternance", "Autodidacte"]} />
        <SelectField label="Statut" required value={f.statut} onChange={(v) => set("statut", v)} options={["En cours", "Obtenu"]} />
        <TextField label="Projets validés" value={f.projets} onChange={(v) => set("projets", v)} placeholder="8 projets validés sur 11" help={`${rattaches} ${rattaches > 1 ? "projets rattachés" : "projet rattaché"} à cette formation sur le site.`} />
      </div>
      <TagInput label="Compétences acquises" value={f.competencesAcquises} onChange={(v) => set("competencesAcquises", v)} help="Affichées dans le CV complet." />
      <TextArea label="Mention complémentaire" value={f.mentionComplementaire} onChange={(v) => set("mentionComplementaire", v)} rows={2} help="Facultatif : affichée en italique sous la formation (par exemple, une équivalence)." />
      {error && (
        <p className="adm-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {initial.id && (
          <button
            type="button"
            className="adm-btn adm-btn--danger"
            disabled={pending}
            onClick={() => {
              if (!window.confirm(`Supprimer la formation « ${initial.intitule} » ? Tu pourras annuler pendant 10 secondes.`)) return;
              start(async () => {
                const snapshot = await deleteFormation(initial.id!);
                draft.markSaved(f);
                toast({ message: `Formation « ${initial.intitule} » supprimée.`, undo: () => restoreFormation(snapshot) });
                router.replace("/admin/formations");
                router.refresh();
              });
            }}
          >
            <Icon name="trash" />
            Supprimer la formation
          </button>
        )}
        <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {draft.dirty && <span className="adm-dirty" style={{ color: "var(--amethyste)", fontSize: 14, fontWeight: 700 }}>● Non enregistré</span>}
          {draft.dirty && (
            <button type="button" className="adm-btn adm-btn--link" onClick={draft.reset}>
              Annuler
            </button>
          )}
          <button type="submit" className="adm-btn" disabled={pending}>
            Enregistrer
          </button>
        </span>
      </div>
    </form>
  );
}
