"use client";

import { useEffect } from "react";

// Comportement de fenêtre modale (README §16) : page figée derrière, reste du site
// inerte, focus piégé dans la fenêtre puis rendu au déclencheur, Échap ferme.
export function useModal(dialogId: string | null, onClose: () => void) {
  useEffect(() => {
    if (!dialogId) return;
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;
    const trigger = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Rend inertes tous les éléments hors de la fenêtre, en remontant ses ancêtres.
    const inerted: Element[] = [];
    const overlay = dialog.closest(".reco-modal, .ex-modal") ?? dialog;
    let node: Element | null = overlay;
    while (node && node !== document.body) {
      const parent: Element | null = node.parentElement;
      if (parent) {
        for (const sibling of Array.from(parent.children)) {
          if (sibling !== node && !sibling.hasAttribute("inert")) {
            sibling.setAttribute("inert", "");
            inerted.push(sibling);
          }
        }
      }
      node = parent;
    }

    const focusables = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>('button:not([tabindex="-1"]), a[href], [tabindex]:not([tabindex="-1"])'));
    focusables()[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      for (const el of inerted) el.removeAttribute("inert");
      trigger?.focus();
    };
  }, [dialogId, onClose]);
}
