"use client";

import { useState, useTransition } from "react";
import { useToast } from "./Toast";

type Publication = "publie" | "prive" | "brouillon";
const LIBELLES: Record<Publication, string> = { publie: "Publié", prive: "Privé", brouillon: "Brouillon" };
const MESSAGES: Record<Publication, string> = {
  publie: "est publié sur le site.",
  prive: "est passé en privé : il n’apparaît plus sur le site.",
  brouillon: "est repassé en brouillon : il n’apparaît plus sur le site.",
};

// Statut de publication d'un projet, modifiable directement depuis la liste.
export function PublicationSelect({ name, value, onChange }: { name: string; value: Publication; onChange: (mode: Publication) => Promise<{ ok: true } | { ok: false; error: string }> }) {
  const [mode, setMode] = useState(value);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <select
      className={`adm-select adm-publication adm-publication--${mode}`}
      aria-label={`Publication de « ${name} »`}
      value={mode}
      disabled={pending}
      onChange={(e) => {
        const m = e.target.value as Publication;
        const avant = mode;
        setMode(m);
        start(async () => {
          const r = await onChange(m);
          if (r.ok) toast({ message: `« ${name} » ${MESSAGES[m]}` });
          else {
            setMode(avant);
            toast({ message: r.error });
          }
        });
      }}
    >
      {(Object.keys(LIBELLES) as Publication[]).map((k) => (
        <option key={k} value={k}>
          {LIBELLES[k]}
        </option>
      ))}
    </select>
  );
}
