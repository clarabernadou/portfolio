"use client";

import { useTransition } from "react";

// Boutons « Monter / Descendre » d'une liste ordonnée (remplacent la poignée de
// glisser-déposer des maquettes, qui n'est pas utilisable au clavier).
export function MoveButtons({ name, first, last, onMove }: { name: string; first: boolean; last: boolean; onMove: (d: -1 | 1) => Promise<void> }) {
  const [pending, start] = useTransition();
  return (
    <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <button type="button" className="adm-icon-btn" style={{ width: 32, height: 32 }} aria-label={`Monter « ${name} »`} disabled={first || pending} onClick={() => start(() => onMove(-1))}>
        ↑
      </button>
      <button type="button" className="adm-icon-btn" style={{ width: 32, height: 32 }} aria-label={`Descendre « ${name} »`} disabled={last || pending} onClick={() => start(() => onMove(1))}>
        ↓
      </button>
    </span>
  );
}
