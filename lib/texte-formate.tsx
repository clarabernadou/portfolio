import { Fragment, type ReactNode } from "react";
import { css } from "@/lib/css";

// Mise en forme légère des textes de l'administration (demande de Clara, 20 nov. 2026) :
//   ligne vide          → nouveau paragraphe
//   retour à la ligne   → retour à la ligne
//   « - » ou « * » en début de ligne → liste à puces
//   **texte**           → gras
//   *texte* ou _texte_  → italique
// Aucun HTML n'est interprété : le texte est découpé en éléments React, jamais injecté tel quel.

/** Aide affichée sous les champs concernés de l'administration. */
export const AIDE_MISE_EN_FORME = "Mise en forme : « - » en début de ligne pour une puce, **gras**, *italique*, ligne vide pour un nouveau paragraphe.";

type Bloc = { type: "p"; lignes: string[] } | { type: "ul"; items: string[] };

const PUCE = /^\s*[-*•]\s+/;

export function blocs(texte: string): Bloc[] {
  const res: Bloc[] = [];
  for (const paragraphe of texte.trim().split(/\n\s*\n/)) {
    let courant: Bloc | null = null;
    for (const ligne of paragraphe.split("\n")) {
      if (!ligne.trim()) continue;
      if (PUCE.test(ligne)) {
        if (courant?.type !== "ul") res.push((courant = { type: "ul", items: [] }));
        courant.items.push(ligne.replace(PUCE, "").trim());
      } else {
        if (courant?.type !== "p") res.push((courant = { type: "p", lignes: [] }));
        courant.lignes.push(ligne.trim());
      }
    }
  }
  return res;
}

const INLINE = /(\*\*[^*\n]+?\*\*|\*[^*\s][^*\n]*?\*|_[^_\s][^_\n]*?_)/g;

function enLigne(texte: string): ReactNode[] {
  return texte.split(INLINE).map((morceau, i) => {
    if (i % 2 === 0) return morceau;
    if (morceau.startsWith("**")) return <strong key={i}>{morceau.slice(2, -2)}</strong>;
    return <em key={i}>{morceau.slice(1, -1)}</em>;
  });
}

/** Texte sans les marques de mise en forme, sur une seule ligne (descriptions pour les moteurs de recherche). */
export function texteBrut(texte: string): string {
  return blocs(texte)
    .flatMap((b) => (b.type === "p" ? b.lignes : b.items))
    .join(" ")
    .replace(INLINE, (m) => (m.startsWith("**") ? m.slice(2, -2) : m.slice(1, -1)));
}

/** style : celui du paragraphe (taille, interligne) ; repris par les listes. */
export function TexteFormate({ texte, style }: { texte: string; style: string }) {
  return (
    <div style={css(`display: flex; flex-direction: column; gap: 10px`)}>
      {blocs(texte).map((b, i) =>
        b.type === "p" ? (
          <p key={i} style={css(`margin: 0; ${style}`)}>
            {b.lignes.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {enLigne(l)}
              </Fragment>
            ))}
          </p>
        ) : (
          <ul key={i} style={css(`margin: 0; padding-left: 1.4em; list-style: disc; ${style}`)}>
            {b.items.map((it, j) => (
              <li key={j} style={css(`margin: ${j ? "4px" : "0"} 0 0`)}>{enLigne(it)}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
