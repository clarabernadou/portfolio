"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveIa } from "@/app/admin/(espace)/page-ia/actions";
import { iaStats } from "@/lib/data-shared";
import type { IaContent } from "@/lib/types";
import { TagInput, TextArea, TextField, Toggle } from "./fields";
import { RestoreBanner, SaveBar, useDraft } from "./SaveBar";
import { useToast } from "./Toast";
import { Icon } from "./icons";

type Lists = Pick<IaContent, "tools" | "skills" | "routines">;
type Onglet = keyof Lists;
const ONGLETS: { k: Onglet; label: string; un: string }[] = [
  { k: "tools", label: "Outils", un: "outil" },
  { k: "skills", label: "Skills", un: "skill" },
  { k: "routines", label: "Routines", un: "routine" },
];

const nom = (k: Onglet, x: Record<string, unknown>) => String(k === "routines" ? x.title : x.name);
const sous = (k: Onglet, x: Record<string, unknown>) => String(k === "tools" ? x.category : k === "routines" ? x.when : "Skill");

// Maquette : docs/passation/maquettes/admin/Admin-page-ia.jpg.
export function IaEditor({ initial, stats }: { initial: Lists; stats: IaContent["stats"] }) {
  const router = useRouter();
  const toast = useToast();
  const draft = useDraft<Lists>("admin-page-ia", initial);
  const lists = draft.value;
  const [onglet, setOnglet] = useState<Onglet>("tools");
  const [sel, setSel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const items = lists[onglet] as unknown as Record<string, unknown>[];
  const cur = items[sel];
  const setList = (v: Record<string, unknown>[]) => draft.setValue({ ...lists, [onglet]: v });
  const setCur = (patch: Record<string, unknown>) => setList(items.map((x, i) => (i === sel ? { ...x, ...patch } : x)));
  const un = ONGLETS.find((o) => o.k === onglet)!.un;
  const reperes = iaStats({ stats, ...lists });

  const ajouter = () => {
    const vide = onglet === "tools" ? { name: "", category: "", description: "", favorite: false } : onglet === "skills" ? { name: "", description: "", deliverables: [] } : { title: "", when: "", description: "" };
    setList([...items, vide]);
    setSel(items.length);
  };
  const deplacer = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const c = [...items];
    [c[i], c[j]] = [c[j], c[i]];
    setList(c);
    if (sel === i) setSel(j);
  };

  return (
    <>
      <RestoreBanner show={!!draft.restorable} onRestore={draft.restore} onDismiss={draft.dismiss} />
      <div className="adm-edit" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
        <section className="adm-card" aria-labelledby="ia-liste">
          <div>
            <h2 className="adm-h2" id="ia-liste">
              {ONGLETS.find((o) => o.k === onglet)!.label}
            </h2>
            <p className="adm-sub">Les cartes de la page IA, dans l’ordre d’affichage.</p>
          </div>
          <div role="tablist" aria-label="Listes de la page IA" style={{ display: "inline-flex", alignSelf: "flex-start", padding: 4, borderRadius: 999, background: "var(--brume)", border: "1px solid var(--bordure)" }}>
            {ONGLETS.map((o) => (
              <button key={o.k} role="tab" aria-selected={onglet === o.k} type="button" className="adm-btn" style={{ minHeight: 40, border: 0, background: onglet === o.k ? "var(--amethyste)" : "transparent", color: onglet === o.k ? "var(--fond)" : "var(--encre)" }} onClick={() => (setOnglet(o.k), setSel(0))}>
                {o.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" aria-label={ONGLETS.find((o) => o.k === onglet)!.label}>
          <ul className="adm-list">
            {items.map((x, i) => (
              <li key={i} style={{ alignItems: "center", background: i === sel ? "var(--brume)" : undefined, padding: "12px 10px", borderRadius: "var(--r-md)" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button type="button" className="adm-icon-btn" style={{ width: 28, height: 28 }} aria-label={`Monter « ${nom(onglet, x)} »`} disabled={i === 0} onClick={() => deplacer(i, -1)}>
                    ↑
                  </button>
                  <button type="button" className="adm-icon-btn" style={{ width: 28, height: 28 }} aria-label={`Descendre « ${nom(onglet, x)} »`} disabled={i === items.length - 1} onClick={() => deplacer(i, 1)}>
                    ↓
                  </button>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b>{nom(onglet, x) || `Nouvel ${un}`}</b>
                  <small className="adm-muted" style={{ display: "block", whiteSpace: "normal" }}>
                    {sous(onglet, x)}
                  </small>
                </span>
                {Boolean(x.favorite) && <span className="adm-badge adm-badge--cours">Prédilection</span>}
                <button type="button" className="adm-icon-btn" aria-label={`Modifier « ${nom(onglet, x)} »`} aria-pressed={i === sel} onClick={() => setSel(i)}>
                  <Icon name="edit" size={16} />
                </button>
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--danger"
                  aria-label={`Retirer « ${nom(onglet, x)} »`}
                  onClick={() => {
                    if (!window.confirm(`Retirer « ${nom(onglet, x)} » de la page IA ? (effectif à l’enregistrement)`)) return;
                    setList(items.filter((_, k) => k !== i));
                    setSel(0);
                  }}
                >
                  <Icon name="trash" size={16} />
                </button>
              </li>
            ))}
          </ul>
          </div>
          <button type="button" className="adm-btn adm-btn--outline" onClick={ajouter}>
            <Icon name="plus" />
            Ajouter un {un}
          </button>
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {cur && (
            <section className="adm-card" aria-labelledby="ia-edit">
              <h2 className="adm-h2" id="ia-edit">
                {nom(onglet, cur) ? `Modifier « ${nom(onglet, cur)} »` : `Nouvel ${un}`}
              </h2>
              {onglet === "routines" ? (
                <>
                  <TextField label="Titre" required value={String(cur.title ?? "")} onChange={(v) => setCur({ title: v })} />
                  <TextField label="Quand" value={String(cur.when ?? "")} onChange={(v) => setCur({ when: v })} placeholder="Chaque matin de travail" />
                  <TextArea label="Description" value={String(cur.description ?? "")} onChange={(v) => setCur({ description: v })} max={260} rows={4} />
                  <TextField label="Note" value={String(cur.note ?? "")} onChange={(v) => setCur({ note: v || undefined })} help="Facultatif : « Intitulé : texte », l’intitulé s’affiche en gras." />
                </>
              ) : (
                <>
                  <TextField label="Nom" required value={String(cur.name ?? "")} onChange={(v) => setCur({ name: v })} />
                  {onglet === "tools" && <TextField label="Catégorie" value={String(cur.category ?? "")} onChange={(v) => setCur({ category: v })} />}
                  <TextArea label="Description" value={String(cur.description ?? "")} onChange={(v) => setCur({ description: v })} max={onglet === "tools" ? 220 : 260} rows={4} />
                  {onglet === "tools" && (
                    <Toggle
                      label="Outil de prédilection"
                      help="Une seule carte peut porter ce badge."
                      checked={Boolean(cur.favorite)}
                      onChange={(v) => setList(items.map((x, i) => ({ ...x, favorite: i === sel ? v : v ? false : x.favorite })))}
                    />
                  )}
                  {onglet === "skills" && <TagInput label="Livrables" value={(cur.deliverables as string[]) ?? []} onChange={(v) => setCur({ deliverables: v })} help="Gardés dans les données (non affichés sur la page)." />}
                </>
              )}
            </section>
          )}
          <section className="adm-card" aria-labelledby="ia-reperes">
            <div>
              <h2 className="adm-h2" id="ia-reperes">Repères du haut de page</h2>
              <p className="adm-sub">Calculés à partir des listes : rien à saisir.</p>
            </div>
            <div className="adm-grid-2">
              {reperes.map((r) => (
                <div key={r.label} className="adm-field" style={{ justifyContent: "space-between" }}>
                  {/* Libellés du site (« 6 skills créés… ») : majuscule initiale dans l'administration. */}
                  <span className="adm-label">{r.label.charAt(0).toUpperCase() + r.label.slice(1)}</span>
                  <span className="adm-input" style={{ display: "flex", justifyContent: "space-between", background: "var(--brume)" }}>
                    {r.value} <small className="adm-help">calculé</small>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <SaveBar dirty={draft.dirty} error={error}>
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
              const r = await saveIa(lists);
              if (!r.ok) {
                if (r.session) return router.push("/admin/connexion?expire=1&callbackUrl=/admin/page-ia");
                return setError(r.error);
              }
              draft.markSaved(lists);
              toast({ message: "Page IA enregistrée." });
              router.refresh();
            })
          }
        >
          Enregistrer
        </button>
      </SaveBar>
    </>
  );
}
