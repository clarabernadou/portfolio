"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSkills, type Groupe } from "@/app/admin/(espace)/competences/actions";
import { TagInput } from "./fields";
import { RestoreBanner, useDraft } from "./SaveBar";
import { useToast } from "./Toast";
import { Icon } from "./icons";

// Catégories de compétences du CV : renommer, réordonner, ajouter, retirer ;
// compétences ajoutées ou retirées dans chaque catégorie.
export function SkillsEditor({ initial, suggestions }: { initial: Groupe[]; suggestions: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const draft = useDraft<Groupe[]>("admin-competences-essentiel", initial);
  const groupes = draft.value;
  const set = (i: number, g: Groupe) => draft.setValue(groupes.map((x, k) => (k === i ? g : x)));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const titre = "Compétences du CV";

  return (
    <section className="adm-card" aria-labelledby="s-competences">
      <div>
        <h2 className="adm-h2" id="s-competences">
          {titre}
        </h2>
        <p className="adm-sub">Celles de la page CV et du PDF : les catégories se renomment et se réordonnent ici.</p>
      </div>
      <RestoreBanner show={!!draft.restorable} onRestore={draft.restore} onDismiss={draft.dismiss} />
      {/* Deux catégories par ligne quand la place le permet, une seule sinon (admin.css). */}
      <div className="adm-competences">
      {groupes.map((g, i) => (
        <fieldset key={i} className="adm-card" style={{ padding: 16, gap: 10, background: "var(--brume)" }}>
          <legend className="adm-sr">{g.name || `Catégorie ${i + 1}`}</legend>
          {/* Sur un écran étroit, les boutons passent sous le nom : il reste lisible en entier. */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <input className="adm-input" style={{ fontWeight: 800, flex: "1 1 200px", minWidth: 0 }} aria-label={`Nom de la catégorie ${i + 1}`} value={g.name} onChange={(e) => set(i, { ...g, name: e.target.value })} />
            <span style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button type="button" className="adm-icon-btn" aria-label={`Monter « ${g.name} »`} disabled={i === 0} onClick={() => {
                const c = [...groupes]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; draft.setValue(c);
              }}>↑</button>
              <button type="button" className="adm-icon-btn" aria-label={`Descendre « ${g.name} »`} disabled={i === groupes.length - 1} onClick={() => {
                const c = [...groupes]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; draft.setValue(c);
              }}>↓</button>
              <button type="button" className="adm-icon-btn adm-icon-btn--danger" aria-label={`Supprimer la catégorie « ${g.name} »`} onClick={() => window.confirm(`Supprimer la catégorie « ${g.name} » et ses compétences ?`) && draft.setValue(groupes.filter((_, k) => k !== i))}>
                <Icon name="trash" size={16} />
              </button>
            </span>
          </div>
          <TagInput label={`Compétences de « ${g.name || `catégorie ${i + 1}`} »`} value={g.items} onChange={(v) => set(i, { ...g, items: v })} suggestions={suggestions} />
        </fieldset>
      ))}
      </div>
      <button type="button" className="adm-btn adm-btn--outline" onClick={() => draft.setValue([...groupes, { name: "", items: [] }])}>
        <Icon name="plus" />
        Ajouter une catégorie
      </button>
      {error && (
        <p className="adm-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
        {draft.dirty && <span style={{ color: "var(--amethyste)", fontSize: 14, fontWeight: 700 }}>● Non enregistré</span>}
        {draft.dirty && (
          <button type="button" className="adm-btn adm-btn--link" onClick={draft.reset}>
            Annuler
          </button>
        )}
        <button
          type="button"
          className="adm-btn"
          disabled={pending || !draft.dirty}
          onClick={() =>
            start(async () => {
              setError(null);
              const r = await saveSkills(groupes);
              if (!r.ok) {
                if (r.session) return router.push(`/admin/connexion?expire=1&callbackUrl=/admin/competences`);
                return setError(r.error);
              }
              draft.markSaved(groupes);
              toast({ message: "Compétences du CV enregistrées." });
              router.refresh();
            })
          }
        >
          Enregistrer les compétences
        </button>
      </div>
    </section>
  );
}
