"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteExperience, restoreExperience, saveExperience, type BlocInput, type ExperienceInput } from "@/app/admin/(espace)/experiences/actions";
import { TagInput, TextArea, TextField, Toggle } from "./fields";
import { RestoreBanner, useDraft } from "./SaveBar";
import { useToast } from "./Toast";
import { Icon } from "./icons";
import { AvisGlobalIA } from "./AvisGlobalIA";
import type { ChampIA } from "@/lib/admin/avis-ia";

function Bloc({ bloc, set, remove, index }: { bloc: BlocInput; set: (b: BlocInput) => void; remove: () => void; index: number }) {
  const nom = bloc.name || `bloc ${index + 1}`;
  return (
    <fieldset className="adm-card" style={{ padding: 18, gap: 12 }}>
      <legend className="adm-sr">{`Bloc ${index + 1}`}</legend>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 200px auto", gap: 10, alignItems: "end" }}>
        {/* Pas de texte d'aide ici : les 3 éléments sont alignés par le bas, une aide sous un seul champ les décalerait. */}
        <TextField label="Nom du bloc (équipe, facultatif)" value={bloc.name} onChange={(v) => set({ ...bloc, name: v })} />
        <TextField label="Période du bloc" value={bloc.period} onChange={(v) => set({ ...bloc, period: v })} />
        <button type="button" className="adm-icon-btn adm-icon-btn--danger" aria-label={`Supprimer le ${nom}`} onClick={remove}>
          <Icon name="trash" size={16} />
        </button>
      </div>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" }}>
        {bloc.puces.map((p, i) => {
          const setP = (np: string) => set({ ...bloc, puces: bloc.puces.map((x, k) => (k === i ? np : x)) });
          return (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "start", padding: "12px 0", borderTop: i ? "1px solid var(--bordure)" : 0 }}>
              <textarea className="adm-textarea" style={{ minHeight: 64 }} aria-label={`Puce ${i + 1} du ${nom}`} value={p} onChange={(e) => setP(e.target.value)} />
              <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button type="button" className="adm-icon-btn" style={{ width: 32, height: 32 }} aria-label={`Monter la puce ${i + 1}`} disabled={i === 0} onClick={() => {
                  const c = [...bloc.puces]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; set({ ...bloc, puces: c });
                }}>↑</button>
                <button type="button" className="adm-icon-btn" style={{ width: 32, height: 32 }} aria-label={`Descendre la puce ${i + 1}`} disabled={i === bloc.puces.length - 1} onClick={() => {
                  const c = [...bloc.puces]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; set({ ...bloc, puces: c });
                }}>↓</button>
                <button type="button" className="adm-icon-btn adm-icon-btn--danger" style={{ width: 32, height: 32 }} aria-label={`Supprimer la puce ${i + 1}`} onClick={() => set({ ...bloc, puces: bloc.puces.filter((_, k) => k !== i) })}>
                  <Icon name="trash" size={14} />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <button type="button" className="adm-btn adm-btn--link" style={{ alignSelf: "center" }} onClick={() => set({ ...bloc, puces: [...bloc.puces, ""] })}>
        <Icon name="plus" />
        Ajouter une puce
      </button>
    </fieldset>
  );
}

// Textes de l'expérience soumis à l'IA : contexte, puces non vides (clé puce-<bloc>-<puce>), note si remplie.
function champsIA(e: ExperienceInput): ChampIA[] {
  return [
    { cle: "contexte", champ: "Contexte", max: 200, role: "une phrase de présentation de l'entreprise, sous le poste", valeur: e.contexteEssentiel },
    ...e.blocs.flatMap((b, ib) =>
      b.puces.flatMap((p, ip) => (p.trim() ? [{ cle: `puce-${ib + 1}-${ip + 1}`, champ: `${b.name || `Bloc ${ib + 1}`} · puce ${ip + 1}`, max: 220, role: "une puce de CV : courte, une seule réalisation concrète", valeur: p }] : [])),
    ),
    ...(e.note.trim() ? [{ cle: "note", champ: "Note", max: 200, role: "une note facultative sous l'expérience, précédée d'une flèche", valeur: e.note }] : []),
  ];
}

// Maquette : docs/passation/maquettes/admin/Admin-experiences.jpg (panneau de droite).
export function ExperienceForm({ initial }: { initial: ExperienceInput }) {
  const router = useRouter();
  const toast = useToast();
  const draft = useDraft<ExperienceInput>(`admin-experience-${initial.id ?? "nouvelle"}`, initial);
  const e = draft.value;
  const set = <K extends keyof ExperienceInput>(k: K, v: ExperienceInput[K]) => draft.setValue({ ...e, [k]: v });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const titre = initial.entrepriseParent ? `${initial.entreprise} by ${initial.entrepriseParent}` : initial.entreprise;

  const save = () =>
    start(async () => {
      setError(null);
      const r = await saveExperience(e);
      if (!r.ok) {
        if (r.session) return router.push(`/admin/connexion?expire=1&callbackUrl=${encodeURIComponent(location.pathname + location.search)}`);
        return setError(r.error);
      }
      draft.markSaved(e);
      toast({ message: initial.id ? "Expérience enregistrée." : "Expérience ajoutée." });
      router.replace(`/admin/experiences?id=${r.id}`);
      router.refresh();
    });

  return (
    <form
      className="adm-card"
      aria-labelledby="e-titre"
      onSubmit={(ev) => {
        ev.preventDefault();
        save();
      }}
    >
      <div className="adm-card-tete">
        <h2 className="adm-h2" id="e-titre">
          {initial.id ? `Modifier « ${titre} »` : "Nouvelle expérience"}
        </h2>
        {/* Un seul avis de l'IA pour toute l'expérience (demande de Clara, 28 oct. 2026). */}
        <AvisGlobalIA
          titre="Avis de l’IA sur l’expérience"
          intro="L’IA relit en une fois le contexte, chaque puce et la note, et propose une version améliorée de chacun."
          fiche={{
            objet: "experience",
            page: `Expérience « ${e.poste || "nouvelle expérience"} » chez ${e.entreprise || "?"}${e.entrepriseParent ? ` by ${e.entrepriseParent}` : ""}, sur le CV`,
            infos: [`Période : ${e.periode}`, `Lieu et mode : ${e.lieuMode}`, ...(e.accueil.technologies.length ? [`Technologies : ${e.accueil.technologies.join(", ")}`] : [])].join("\n"),
            champs: champsIA(e),
          }}
          onAppliquer={({ valeurs }) => {
            draft.setValue({
              ...e,
              contexteEssentiel: valeurs.contexte ?? e.contexteEssentiel,
              note: valeurs.note ?? e.note,
              blocs: e.blocs.map((b, ib) => ({ ...b, puces: b.puces.map((x, ip) => valeurs[`puce-${ib + 1}-${ip + 1}`] ?? x) })),
            });
            toast({ message: "Propositions appliquées : relis l’expérience, puis enregistre." });
          }}
        />
      </div>
      <RestoreBanner show={!!draft.restorable} onRestore={draft.restore} onDismiss={draft.dismiss} />
      <div className="adm-grid-2">
        <TextField label="Poste" required value={e.poste} onChange={(v) => set("poste", v)} />
        <TextField label="Période" required value={e.periode} onChange={(v) => set("periode", v)} placeholder="mars 2025 – aujourd’hui" />
        <TextField label="Entreprise" required value={e.entreprise} onChange={(v) => set("entreprise", v)} />
        <TextField label="Lien de l’entreprise" type="url" value={e.entrepriseHref} onChange={(v) => set("entrepriseHref", v)} />
        <TextField label="Groupe (« by … »)" value={e.entrepriseParent} onChange={(v) => set("entrepriseParent", v)} help="Facultatif : affiché après « by »." />
        <TextField label="Lien du groupe" type="url" value={e.entrepriseParentHref} onChange={(v) => set("entrepriseParentHref", v)} />
      </div>
      <TextField label="Lieu et mode" value={e.lieuMode} onChange={(v) => set("lieuMode", v)} placeholder="Alternance · Nantes, en télétravail" />
      <TextArea ia={false} label="Contexte" value={e.contexteEssentiel} onChange={(v) => set("contexteEssentiel", v)} rows={2} help="Une phrase de présentation de l’entreprise, sous le poste." />

      <div className="adm-field">
        <span className="adm-label">Blocs et puces</span>
        <span className="adm-help">Une puce par réalisation, courte, avec une seule information.</span>
      </div>
      {e.blocs.map((b, i) => (
        <Bloc key={i} index={i} bloc={b} set={(nb) => set("blocs", e.blocs.map((x, k) => (k === i ? nb : x)))} remove={() => window.confirm("Supprimer ce bloc et ses puces ?") && set("blocs", e.blocs.filter((_, k) => k !== i))} />
      ))}
      <button type="button" className="adm-btn adm-btn--outline" onClick={() => set("blocs", [...e.blocs, { name: "", period: "", puces: [""] }])}>
        <Icon name="plus" />
        Ajouter un bloc (équipe, période)
      </button>

      <TextArea ia={false} label="Note" value={e.note} onChange={(v) => set("note", v)} rows={2} help="Facultatif : affichée sous l’expérience, précédée d’une flèche." />

      <fieldset className="adm-card" style={{ padding: 18, gap: 12, background: "var(--brume)" }}>
        <legend className="adm-sr">Accueil</legend>
        <Toggle label="Carte « Parcours en alternance » de l’accueil" help="Affiche cette expérience dans le parcours de l’accueil." checked={e.accueil.visible} onChange={(v) => set("accueil", { ...e.accueil, visible: v })} />
        {e.accueil.visible && (
          <>
            <TextField label="Lieu et mode, version courte" value={e.accueil.lieuMode} onChange={(v) => set("accueil", { ...e.accueil, lieuMode: v })} />
            <TagInput label="Technologies de la carte" value={e.accueil.technologies} onChange={(v) => set("accueil", { ...e.accueil, technologies: v })} />
          </>
        )}
      </fieldset>

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
              if (!window.confirm(`Supprimer l’expérience « ${titre} » ? Tu pourras annuler pendant 10 secondes.`)) return;
              start(async () => {
                const snapshot = await deleteExperience(initial.id!);
                draft.markSaved(e);
                toast({ message: `Expérience « ${titre} » supprimée.`, undo: () => restoreExperience(snapshot) });
                router.replace("/admin/experiences");
                router.refresh();
              });
            }}
          >
            <Icon name="trash" />
            Supprimer l’expérience
          </button>
        )}
        <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {draft.dirty && <span style={{ color: "var(--amethyste)", fontSize: 14, fontWeight: 700 }}>● Non enregistré</span>}
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
