import type { CSSProperties } from "react";

// Transforme une déclaration CSS en ligne, recopiée telle quelle depuis les
// sources du prototype (docs/passation/prototype-source), en objet de style
// React. Aucune valeur n'est réinterprétée.
const cache = new Map<string, CSSProperties>();

export function css(declarations: string): CSSProperties {
  const hit = cache.get(declarations);
  if (hit) return hit;
  const style: Record<string, string> = {};
  for (const decl of declarations.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop || !value) continue;
    const key = prop.startsWith("--")
      ? prop
      : prop
          .replace(/^-(webkit|moz)-/, (_, p: string) => p[0].toUpperCase() + p.slice(1) + "-")
          .replace(/^-ms-/, "ms-")
          .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[key] = value;
  }
  cache.set(declarations, style);
  return style;
}
