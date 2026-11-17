"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveFormationsCourtes } from "@/app/admin/(espace)/formations-courtes/actions";
import type { FormationCourte } from "@/lib/types";
import { SelectField, TextField } from "./fields";
import { RestoreBanner, SaveBar, useDraft } from "./SaveBar";
import { useToast } from "./Toast";
import { Icon } from "./icons";

const TYPES = { attestation: "Attestation de suivi", certification: "Certification" } as const;
const VIDE: FormationCourte = { name: "", organisme: "", date: "", type: "attestation" };

// Liste des formations courtes et certifications (accueil, rubrique « Parcours », 17 nov. 2026).
// Même fonctionnement que les listes de la page IA : ordre, ajout, retrait, enregistrement groupé.
export function FormationsCourtesEditor({ initial }: { initial: FormationCourte[] }) {
  const router = useRouter();
  const toast = useToast();
  const draft = useDraft<FormationCourte[]>("admin-formations-courtes", initial);
  const items = draft.value;
  const [sel, setSel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const cur = items[sel];
  const setCur = (patch: Partial<FormationCourte>) => draft.setValue(items.map((x, i) => (i === sel ? { ...x, ...patch } : x)));
  const deplacer = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const c = [...items];
    [c[i], c[j]] = [c[j], c[i]];
    draft.setValue(c);
    if (sel === i) setSel(j);
  };
  const ajouter = () => {
    draft.setValue([...items, { ...VIDE }]);
    setSel(items.length);
  };

  return (
    <>
      <RestoreBanner show={!!draft.restorable} onRestore={draft.restore} onDismiss={draft.dismiss} />
      <div className="adm-edit" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
        <section className="adm-card" aria-labelledby="fc-liste">
          <div>
            <h2 className="adm-h2" id="fc-liste">
              Liste
            </h2>
            <p className="adm-sub">Dans l’ordre d’affichage. Les formations d’un même organisme sont regroupées sur une ligne.</p>
          </div>
          {items.length === 0 && <p className="adm-muted">Aucune formation : la liste n’apparaît pas sur l’accueil.</p>}
          <ul className="adm-list">
            {items.map((x, i) => (
              <li key={i} style={{ alignItems: "center", background: i === sel ? "var(--brume)" : undefined, padding: "12px 10px", borderRadius: "var(--r-md)" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button type="button" className="adm-icon-btn" style={{ width: 28, height: 28 }} aria-label={`Monter « ${x.name} »`} disabled={i === 0} onClick={() => deplacer(i, -1)}>
                    ↑
                  </button>
                  <button type="button" className="adm-icon-btn" style={{ width: 28, height: 28 }} aria-label={`Descendre « ${x.name} »`} disabled={i === items.length - 1} onClick={() => deplacer(i, 1)}>
                    ↓
                  </button>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b>{x.name || "Nouvelle formation"}</b>
                  <small className="adm-muted" style={{ display: "block", whiteSpace: "normal" }}>
                    {[x.organisme, x.date].filter(Boolean).join(" · ")}
                  </small>
                </span>
                {x.type === "certification" && <span className="adm-badge adm-badge--publie">Certification</span>}
                <button type="button" className="adm-icon-btn" aria-label={`Modifier « ${x.name} »`} aria-pressed={i === sel} onClick={() => setSel(i)}>
                  <Icon name="edit" size={16} />
                </button>
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--danger"
                  aria-label={`Retirer « ${x.name} »`}
                  onClick={() => {
                    if (!window.confirm(`Retirer « ${x.name} » ? (effectif à l’enregistrement)`)) return;
                    draft.setValue(items.filter((_, k) => k !== i));
                    setSel(0);
                  }}
                >
                  <Icon name="trash" size={16} />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="adm-btn adm-btn--outline" onClick={ajouter}>
            <Icon name="plus" />
            Ajouter une formation ou une certification
          </button>
        </section>

        {cur && (
          <section className="adm-card" aria-labelledby="fc-edit">
            <h2 className="adm-h2" id="fc-edit">
              {cur.name ? `Modifier « ${cur.name} »` : "Nouvelle formation"}
            </h2>
            <TextField label="Intitulé" required value={cur.name} onChange={(v) => setCur({ name: v })} placeholder="Claude Code 101" />
            <TextField label="Organisme" required value={cur.organisme} onChange={(v) => setCur({ organisme: v })} placeholder="Anthropic" />
            <TextField label="Date" required value={cur.date} onChange={(v) => setCur({ date: v })} placeholder="juillet 2026" help="Mois et année, en lettres." />
            <SelectField
              label="Type"
              required
              value={TYPES[cur.type]}
              options={Object.values(TYPES)}
              onChange={(v) => setCur({ type: v === TYPES.certification ? "certification" : "attestation" })}
              help="« Certification » seulement après un examen (Opquast, TOEIC…) : elle porte alors une étiquette sur l’accueil."
            />
            <TextField label="Lien" type="url" value={cur.url ?? ""} onChange={(v) => setCur({ url: v || undefined })} placeholder="https://" help="Facultatif : page de vérification. L’intitulé devient alors un lien externe." />
          </section>
        )}
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
              const r = await saveFormationsCourtes(items);
              if (!r.ok) {
                if (r.session) return router.push("/admin/connexion?expire=1&callbackUrl=/admin/formations-courtes");
                return setError(r.error);
              }
              draft.markSaved(items);
              toast({ message: "Formations courtes enregistrées." });
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
