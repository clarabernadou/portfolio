import type { ReactNode } from "react";
import { css } from "@/lib/css";

// Cartes de la page IA (repères, outils, skills, routines) rendues depuis les données
// (étape 9), avec le markup et les styles du prototype (IaView).

// Chiffre de l'intro de /ia (20 nov. 2026) : tuile d'indicateur, le chiffre en grand, la légende dessous,
// l'icône décorative discrète en haut à droite.
export function IaStat({ value, label, icone }: { value: string; label: string; icone?: string }) {
  return (
    <li style={css(`position: relative; background: #FFFFFF; padding: 18px 64px 18px 22px; display: flex; flex-direction: column; gap: 6px`)}>
      <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 48px; font-weight: 800; letter-spacing: -0.04em; color: #6A4FB6; line-height: 1`)}>{value}</span>{" "}
      <span style={css(`font-size: 15px; font-weight: 700; line-height: 1.35`)}>{label}</span>
      {icone && (
        <span aria-hidden={"true"} style={css(`position: absolute; top: 18px; right: 18px; width: 36px; height: 36px; border-radius: 10px; background: #F3EFFF; color: #6A4FB6; display: inline-flex; align-items: center; justify-content: center`)}>
          <svg width={"19"} height={"19"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <path d={icone} />
          </svg>
        </span>
      )}
    </li>
  );
}

// Une note « Règle de sécurité : … » s'affiche avec son intitulé en gras.
function Note({ text }: { text: string }) {
  const i = text.indexOf(" : ");
  return (
    <p style={css(`margin: 4px 0 0; font-size: 14px; line-height: 1.5; font-style: italic; color: #1A1033`)}>
      {i > 0 ? (
        <>
          <b>{text.slice(0, i + 2)}</b>
          {text.slice(i + 2)}
        </>
      ) : (
        text
      )}
    </p>
  );
}

export function IaCard({ kicker, title, text, favorite, note, icone, children }: { kicker: string; title: string; text: string; favorite?: boolean; note?: string; icone?: string; children?: ReactNode }) {
  return (
    <article style={css(`border-radius: 20px; border: ${favorite ? "2px solid #6A4FB6" : "1px solid #E4DCF7"}; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 10px`)}>
      {/* Icône décorative facultative (skills et routines de /ia, 20 nov. 2026). */}
      {icone && (
        <span aria-hidden={"true"} style={css(`width: 44px; height: 44px; border-radius: 12px; background: #F3EFFF; color: #6A4FB6; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 4px`)}>
          <svg width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.75"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <path d={icone} />
          </svg>
        </span>
      )}
      <div style={css(`display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px`)}>
        <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>{kicker}</span>
        {" "}
        {favorite && <span style={css(`padding: 3px 9px; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; font-size: 13px; font-weight: 800; letter-spacing: 0.04em`)}>{"PRÉDILECTION"}</span>}
      </div>
      {" "}
      <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em`)}>{title}</h3>
      {" "}
      <p style={css(`margin: 0; font-size: 16px; line-height: 1.55; color: #5B5470`)}>{text}</p>
      {" "}
      {note && <Note text={note} />}
      {/* Bouton d'exemple en bas de carte : aligné d'une carte à l'autre (20 nov. 2026). */}
      {children && <div style={css(`margin-top: auto; padding-top: 6px`)}>{children}</div>}
    </article>
  );
}
