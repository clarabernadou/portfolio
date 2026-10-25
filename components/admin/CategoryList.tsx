"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addCategory, deleteCategory, moveCategory, renameCategory } from "@/app/admin/(espace)/categories/actions";
import { useToast } from "./Toast";
import { Icon } from "./icons";

export interface CategoryRow {
  id: number;
  name: string;
  nature: string | null;
  count: number;
}

const NATURES = ["Formation", "Entreprise", "Projet perso", "Audit"];

// Une colonne de l'écran Catégories (maquettes/admin/Admin-categories.jpg).
export function CategoryList({ kind, rows }: { kind: "type" | "cadre"; rows: CategoryRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState({ name: "", nature: "Formation" });
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [target, setTarget] = useState("");
  const [nouveau, setNouveau] = useState({ name: "", nature: "Formation" });
  const [error, setError] = useState<string | null>(null);
  const label = kind === "type" ? "type de projet" : "cadre";

  const run = (fn: () => Promise<{ ok: boolean; error?: string } | void>, done?: string) =>
    start(async () => {
      setError(null);
      const r = await fn();
      if (r && !r.ok) return setError(r.error ?? "Erreur.");
      if (done) toast({ message: done });
      setEditing(null);
      setDeleting(null);
      router.refresh();
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ul className="adm-list">
        {rows.map((r, i) => (
          <li key={r.id} style={{ alignItems: "center" }}>
            <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button type="button" className="adm-icon-btn" style={{ width: 28, height: 28 }} aria-label={`Monter « ${r.name} »`} disabled={i === 0 || pending} onClick={() => run(() => moveCategory(r.id, -1))}>
                ↑
              </button>
              <button type="button" className="adm-icon-btn" style={{ width: 28, height: 28 }} aria-label={`Descendre « ${r.name} »`} disabled={i === rows.length - 1 || pending} onClick={() => run(() => moveCategory(r.id, 1))}>
                ↓
              </button>
            </span>
            {editing === r.id ? (
              <form
                style={{ flex: 1, display: "flex", gap: 8, flexWrap: "wrap" }}
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => renameCategory(r.id, draft.name, draft.nature), "Catégorie renommée.");
                }}
              >
                <input className="adm-input" style={{ flex: "1 1 180px" }} aria-label={`Nouveau nom de « ${r.name} »`} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus />
                {kind === "cadre" && (
                  <select className="adm-select" style={{ width: "auto" }} aria-label="Nature du cadre" value={draft.nature} onChange={(e) => setDraft({ ...draft, nature: e.target.value })}>
                    {NATURES.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                )}
                <button className="adm-btn" type="submit" disabled={pending}>
                  Enregistrer
                </button>
                <button className="adm-btn adm-btn--link" type="button" onClick={() => setEditing(null)}>
                  Annuler
                </button>
              </form>
            ) : (
              <>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b>{r.name}</b>
                  <small className="adm-muted" style={{ display: "block" }}>
                    {r.count} {r.count > 1 ? "projets" : "projet"}
                  </small>
                </span>
                {r.nature && <span className="adm-pill">{r.nature}</span>}
                <button type="button" className="adm-icon-btn" aria-label={`Renommer « ${r.name} »`} onClick={() => (setEditing(r.id), setDraft({ name: r.name, nature: r.nature ?? "Formation" }))}>
                  <Icon name="edit" size={16} />
                </button>
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--danger"
                  aria-label={`Supprimer « ${r.name} »`}
                  onClick={() => {
                    if (r.count) {
                      setDeleting(r);
                      setTarget(rows.find((x) => x.id !== r.id)?.name ?? "");
                    } else if (window.confirm(`Supprimer le ${label} « ${r.name} » ?`)) run(() => deleteCategory(r.id, null), `« ${r.name} » supprimé.`);
                  }}
                >
                  <Icon name="trash" size={16} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      {deleting && (
        <div className="adm-empty" role="alertdialog" aria-labelledby="reaffecter">
          <b id="reaffecter">
            {deleting.count} {deleting.count > 1 ? "projets utilisent" : "projet utilise"} « {deleting.name} »
          </b>
          Choisis vers quel {label} {deleting.count > 1 ? "les" : "le"} réaffecter avant de supprimer.
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <select className="adm-select" style={{ width: "auto" }} aria-label="Réaffecter vers" value={target} onChange={(e) => setTarget(e.target.value)}>
              {rows
                .filter((x) => x.id !== deleting.id)
                .map((x) => (
                  <option key={x.id}>{x.name}</option>
                ))}
            </select>
            <button type="button" className="adm-btn adm-btn--danger" disabled={pending || !target} onClick={() => run(() => deleteCategory(deleting.id, target), `« ${deleting.name} » supprimé, projets réaffectés à « ${target} ».`)}>
              Réaffecter et supprimer
            </button>
            <button type="button" className="adm-btn adm-btn--link" onClick={() => setDeleting(null)}>
              Annuler
            </button>
          </div>
        </div>
      )}
      <form
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const r = await addCategory(kind, nouveau.name, nouveau.nature);
            if (r.ok) setNouveau({ ...nouveau, name: "" });
            return r;
          }, `${kind === "type" ? "Type" : "Cadre"} ajouté.`);
        }}
      >
        <input className="adm-input" style={{ flex: "1 1 200px" }} aria-label={kind === "type" ? "Nouveau type de projet" : "Nouveau cadre"} placeholder={kind === "type" ? "Nouveau type de projet" : "Nouveau cadre"} value={nouveau.name} onChange={(e) => setNouveau({ ...nouveau, name: e.target.value })} />
        {kind === "cadre" && (
          <select className="adm-select" style={{ width: "auto" }} aria-label="Nature du nouveau cadre" value={nouveau.nature} onChange={(e) => setNouveau({ ...nouveau, nature: e.target.value })}>
            {NATURES.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        )}
        <button className="adm-btn" type="submit" disabled={pending || !nouveau.name.trim()}>
          <Icon name="plus" />
          Ajouter
        </button>
      </form>
      {error && (
        <p className="adm-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
