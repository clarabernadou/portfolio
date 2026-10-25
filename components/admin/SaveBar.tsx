"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Suivi des modifications d'un formulaire (ADMIN-et-SYNCHRONISATION.md, §5 « États ») :
// - « Modifications non enregistrées » et alerte avant de quitter une page modifiée ;
// - brouillon gardé sur l'appareil, pour ne rien perdre si la session expire.
export function useDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [restorable, setRestorable] = useState<T | null>(null);
  const dirty = JSON.stringify(value) !== saved;
  const first = useRef(true);

  useEffect(() => {
    if (!first.current) return;
    first.current = false;
    try {
      const raw = localStorage.getItem(key);
      // Lecture unique, au montage, d'un système externe (le stockage de l'appareil) :
      // impossible pendant le rendu serveur, d'où l'effet.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw && raw !== saved) setRestorable(JSON.parse(raw) as T);
    } catch {
      /* stockage indisponible : on continue sans brouillon local */
    }
  }, [key, saved]);

  useEffect(() => {
    try {
      if (dirty) localStorage.setItem(key, JSON.stringify(value));
      else localStorage.removeItem(key);
    } catch {
      /* idem */
    }
  }, [key, value, dirty]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return {
    value,
    setValue,
    dirty,
    markSaved: (v: T) => {
      setSaved(JSON.stringify(v));
      try {
        localStorage.removeItem(key);
      } catch {
        /* idem */
      }
    },
    reset: () => setValue(JSON.parse(saved) as T),
    restorable,
    restore: () => {
      if (restorable) setValue(restorable);
      setRestorable(null);
    },
    dismiss: () => {
      setRestorable(null);
      try {
        localStorage.removeItem(key);
      } catch {
        /* idem */
      }
    },
  };
}

export function RestoreBanner({ show, onRestore, onDismiss }: { show: boolean; onRestore: () => void; onDismiss: () => void }) {
  if (!show) return null;
  return (
    <div className="adm-empty" role="status" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
      <span>Des modifications non enregistrées ont été gardées sur cet appareil.</span>
      <span style={{ display: "flex", gap: 8 }}>
        <button type="button" className="adm-btn" onClick={onRestore}>
          Les reprendre
        </button>
        <button type="button" className="adm-btn adm-btn--outline" onClick={onDismiss}>
          Les ignorer
        </button>
      </span>
    </div>
  );
}

export function SaveBar({ dirty, error, children }: { dirty: boolean; error?: string | null; children: ReactNode }) {
  return (
    <div className="adm-savebar">
      <span className="adm-dirty" role="status" aria-live="polite">
        {error ? <span className="adm-error">{error}</span> : dirty ? "● Modifications non enregistrées" : ""}
      </span>
      {children}
    </div>
  );
}
