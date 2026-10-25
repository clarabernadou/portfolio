"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// Message en bas d'écran, avec un bouton « Annuler » facultatif (10 secondes).
// Placé dans la mise en page : il survit à la disparition de la ligne supprimée.
type Toast = { message: string; undo?: () => Promise<void> };
const Ctx = createContext<(t: Toast) => void>(() => {});

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((t: Toast) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(t);
    timer.current = setTimeout(() => setToast(null), t.undo ? 10_000 : 4_000);
  }, []);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" role="status">
        {toast && (
          <div className="adm-toast">
            {toast.message}
            {toast.undo && (
              <button
                type="button"
                onClick={async () => {
                  const undo = toast.undo!;
                  setToast(null);
                  await undo();
                }}
              >
                Annuler
              </button>
            )}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
