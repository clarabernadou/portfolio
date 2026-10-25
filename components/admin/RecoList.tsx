"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteReco, moveReco, restoreReco, saveReco, type RecoInput } from "@/app/admin/(espace)/profil/actions";
import { SelectField, TextArea, TextField, Toggle } from "./fields";
import { useToast } from "./Toast";
import { Icon } from "./icons";

const VIDE: RecoInput = { id: null, auteur: "", initiales: "", linkedin: "", poste: "", relation: "", citationCourte: "", texteIntegral: "", lettrePdf: "", entrepriseHref: "", lienTexte: "", voirLinkedin: false, status: "draft" };

function RecoForm({ initial, onDone }: { initial: RecoInput; onDone: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [r, setR] = useState(initial);
  const set = <K extends keyof RecoInput>(k: K, v: RecoInput[K]) => setR({ ...r, [k]: v });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="adm-card"
      style={{ padding: 18, gap: 12, background: "var(--brume)" }}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveReco(r);
          if (!res.ok) {
            if (res.session) return router.push("/admin/connexion?expire=1&callbackUrl=/admin/profil");
            return setError(res.error);
          }
          toast({ message: "Recommandation enregistrée." });
          onDone();
          router.refresh();
        });
      }}
    >
      <p className="adm-help" style={{ margin: 0 }}>
        Ce sont les mots d’une autre personne : recopie-les sans les modifier, et publie seulement avec son accord.
      </p>
      <div className="adm-grid-2">
        <TextField label="Nom" required value={r.auteur} onChange={(v) => set("auteur", v)} />
        <TextField label="Initiales" value={r.initiales} onChange={(v) => set("initiales", v)} help="Calculées si vide." />
        <TextField label="Rôle" value={r.poste} onChange={(v) => set("poste", v)} />
        <TextField label="Relation" value={r.relation} onChange={(v) => set("relation", v)} placeholder="Mentore OpenClassrooms · …" />
        <TextField label="Profil LinkedIn" type="url" value={r.linkedin} onChange={(v) => set("linkedin", v)} />
        <TextField label="Lettre en PDF" value={r.lettrePdf} onChange={(v) => set("lettrePdf", v)} placeholder="/Lettre_….pdf" />
        <TextField label="Lien de l’entreprise" type="url" value={r.entrepriseHref} onChange={(v) => set("entrepriseHref", v)} />
        <TextField label="Mot du rôle relié à l’entreprise" value={r.lienTexte} onChange={(v) => set("lienTexte", v)} help="Par exemple « IntuitLearn »." />
      </div>
      <TextArea label="Citation courte (carte de l’accueil)" value={r.citationCourte} onChange={(v) => set("citationCourte", v)} rows={2} />
      <TextArea label="Texte intégral (fenêtre « Lire en entier »)" value={r.texteIntegral} onChange={(v) => set("texteIntegral", v)} rows={8} help="Une ligne vide entre deux paragraphes." />
      <Toggle label="Lien « Voir sur LinkedIn » sous la carte" checked={r.voirLinkedin} onChange={(v) => set("voirLinkedin", v)} />
      <SelectField label="Statut" value={r.status === "draft" ? "Brouillon (non affiché)" : "Publiée"} onChange={(v) => set("status", v === "Publiée" ? "published" : "draft")} options={["Publiée", "Brouillon (non affiché)"]} />
      {error && (
        <p className="adm-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" className="adm-btn adm-btn--link" onClick={onDone}>
          Annuler
        </button>
        <button type="submit" className="adm-btn" disabled={pending}>
          Enregistrer
        </button>
      </div>
    </form>
  );
}

export function RecoList({ items }: { items: (RecoInput & { id: number })[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<number | "nouvelle" | null>(null);
  const [pending, start] = useTransition();
  return (
    <section className="adm-card" aria-labelledby="p-recos">
      <h2 className="adm-h2" id="p-recos">Recommandations</h2>
      <ul className="adm-list">
        {items.map((r, i) => (
          <li key={r.id} style={{ flexDirection: "column", alignItems: "stretch" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button type="button" className="adm-icon-btn" style={{ width: 28, height: 28 }} aria-label={`Monter la recommandation de ${r.auteur}`} disabled={i === 0 || pending} onClick={() => start(async () => (await moveReco(r.id, -1), router.refresh()))}>
                  ↑
                </button>
                <button type="button" className="adm-icon-btn" style={{ width: 28, height: 28 }} aria-label={`Descendre la recommandation de ${r.auteur}`} disabled={i === items.length - 1 || pending} onClick={() => start(async () => (await moveReco(r.id, 1), router.refresh()))}>
                  ↓
                </button>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b>{r.auteur}</b>
                {r.status === "draft" && <span className="adm-badge adm-badge--brouillon" style={{ marginLeft: 8 }}>Brouillon</span>}
                <small className="adm-muted" style={{ display: "block", whiteSpace: "normal" }}>
                  {r.poste}
                </small>
              </span>
              <button type="button" className="adm-icon-btn" aria-label={`Modifier la recommandation de ${r.auteur}`} onClick={() => setEditing(editing === r.id ? null : r.id)}>
                <Icon name="edit" size={16} />
              </button>
              <button
                type="button"
                className="adm-icon-btn adm-icon-btn--danger"
                aria-label={`Supprimer la recommandation de ${r.auteur}`}
                onClick={() =>
                  window.confirm(`Supprimer la recommandation de ${r.auteur} ? Tu pourras annuler pendant 10 secondes.`) &&
                  start(async () => {
                    const snap = await deleteReco(r.id);
                    toast({ message: `Recommandation de ${r.auteur} supprimée.`, undo: async () => (await restoreReco(snap), router.refresh()) });
                    router.refresh();
                  })
                }
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
            {editing === r.id && <RecoForm initial={r} onDone={() => setEditing(null)} />}
          </li>
        ))}
      </ul>
      {editing === "nouvelle" ? (
        <RecoForm initial={VIDE} onDone={() => setEditing(null)} />
      ) : (
        <button type="button" className="adm-btn adm-btn--link" style={{ alignSelf: "center" }} onClick={() => setEditing("nouvelle")}>
          <Icon name="plus" />
          Ajouter une recommandation
        </button>
      )}
    </section>
  );
}
