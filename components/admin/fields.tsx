"use client";

import { useId, useState, type ReactNode } from "react";
import { Icon } from "./icons";

// Champs de formulaire de l'administration : un libellé visible relié à son champ,
// une aide facultative reliée par aria-describedby.

export function Field({ label, required, help, children, id }: { label: string; required?: boolean; help?: ReactNode; children: (id: string, helpId?: string) => ReactNode; id?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  const helpId = help ? `${fid}-aide` : undefined;
  return (
    <div className="adm-field">
      <label className="adm-label" htmlFor={fid}>
        {label}
        {required && <em aria-hidden="true"> *</em>}
      </label>
      {children(fid, helpId)}
      {help && (
        <span className="adm-help" id={helpId}>
          {help}
        </span>
      )}
    </div>
  );
}

export function TextField({ label, value, onChange, required, help, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; help?: ReactNode; placeholder?: string; type?: string }) {
  return (
    <Field label={label} required={required} help={help}>
      {(id, helpId) => <input id={id} className="adm-input" type={type} value={value} required={required} placeholder={placeholder} aria-describedby={helpId} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

// Zone de texte avec compteur : le dépassement est signalé, sans bloquer
// l'enregistrement d'un texte déjà validé.
export function TextArea({ label, value, onChange, max, help, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; max?: number; help?: ReactNode; rows?: number }) {
  const over = max ? value.length > max : false;
  return (
    <Field label={label} help={help}>
      {(id, helpId) => (
        <>
          <textarea id={id} className="adm-textarea" rows={rows} value={value} aria-describedby={helpId} onChange={(e) => onChange(e.target.value)} />
          {max && (
            <span className="adm-count" data-over={over}>
              {value.length} / {max}
              {over ? " · au-delà de la longueur conseillée" : ""}
            </span>
          )}
        </>
      )}
    </Field>
  );
}

export function SelectField({ label, value, onChange, options, required, help, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean; help?: ReactNode; placeholder?: string }) {
  return (
    <Field label={label} required={required} help={help}>
      {(id, helpId) => (
        <select id={id} className="adm-select" value={value} required={required} aria-describedby={helpId} onChange={(e) => onChange(e.target.value)}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Toggle({ label, help, checked, onChange }: { label: string; help?: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <b>{label}</b>
        {help && <small>{help}</small>}
      </span>
    </label>
  );
}

export function Checks({ legend, options, value, onChange, help }: { legend: string; options: string[]; value: string[]; onChange: (v: string[]) => void; help?: ReactNode }) {
  return (
    <fieldset className="adm-field" style={{ border: 0, padding: 0, margin: 0 }}>
      <legend className="adm-label" style={{ marginBottom: 6 }}>
        {legend}
      </legend>
      <div className="adm-checks">
        {options.map((o) => (
          <label key={o} className="adm-check">
            <input type="checkbox" checked={value.includes(o)} onChange={(e) => onChange(e.target.checked ? [...value, o] : value.filter((x) => x !== o))} />
            {o}
          </label>
        ))}
      </div>
      {help && <span className="adm-help">{help}</span>}
    </fieldset>
  );
}

// Liste d'étiquettes : Entrée ou virgule pour ajouter, × pour retirer.
export function TagInput({ label, value, onChange, suggestions = [], help }: { label: string; value: string[]; onChange: (v: string[]) => void; suggestions?: string[]; help?: ReactNode }) {
  const [draft, setDraft] = useState("");
  const add = (t: string) => {
    const v = t.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  const rest = suggestions.filter((s) => !value.includes(s)).slice(0, 8);
  return (
    <Field label={label} help={help}>
      {(id, helpId) => (
        <>
          {value.length > 0 && (
            <div className="adm-checks" style={{ gap: 6 }}>
              {value.map((t) => (
                <span key={t} className="adm-tag">
                  {t}
                  <button type="button" aria-label={`Retirer ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            id={id}
            className="adm-input"
            value={draft}
            aria-describedby={helpId}
            placeholder="Ajouter puis Entrée"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add(draft);
              }
            }}
            onBlur={() => draft && add(draft)}
          />
          {rest.length > 0 && (
            <span className="adm-help">
              Suggestions :{" "}
              {rest.map((s, i) => (
                <span key={s}>
                  {i > 0 && " · "}
                  <button type="button" className="adm-btn--link" style={{ border: 0, background: "none", color: "var(--amethyste)", cursor: "pointer", font: "inherit", padding: 0 }} onClick={() => add(s)}>
                    {s}
                  </button>
                </span>
              ))}
            </span>
          )}
        </>
      )}
    </Field>
  );
}

// Liste ordonnée d'éléments (livrables, étapes, vidéos, puces) : ajouter, monter, descendre, retirer.
export function ListEditor<T>({
  label,
  items,
  onChange,
  empty,
  addLabel,
  make,
  render,
  itemName,
}: {
  label: string;
  items: T[];
  onChange: (v: T[]) => void;
  empty: ReactNode;
  addLabel: string;
  make: () => T;
  render: (item: T, set: (v: T) => void, i: number) => ReactNode;
  itemName: (item: T, i: number) => string;
}) {
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  return (
    <div className="adm-field">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span className="adm-label">{label}</span>
        <button type="button" className="adm-btn adm-btn--outline" style={{ minHeight: 40, fontSize: 14 }} onClick={() => onChange([...items, make()])}>
          <Icon name="plus" />
          {addLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="adm-empty">{empty}</div>
      ) : (
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 12, border: "1px solid var(--bordure)", borderRadius: "var(--r-md)" }}>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>{render(item, (v) => onChange(items.map((x, k) => (k === i ? v : x))), i)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button type="button" className="adm-icon-btn" aria-label={`Monter ${itemName(item, i)}`} disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button type="button" className="adm-icon-btn" aria-label={`Descendre ${itemName(item, i)}`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  ↓
                </button>
                <button type="button" className="adm-icon-btn adm-icon-btn--danger" aria-label={`Retirer ${itemName(item, i)}`} onClick={() => onChange(items.filter((_, k) => k !== i))}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// Champ sans libellé visible, pour l'intérieur d'une ligne de liste.
export function InlineInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input className="adm-input" aria-label={label} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}
