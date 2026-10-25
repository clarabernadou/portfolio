import { css } from "@/lib/css";

// Cartes de la page IA (repères, outils, skills, routines) rendues depuis les données
// (étape 9), avec le markup et les styles du prototype (IaView).

export function IaStat({ value, label }: { value: string; label: string }) {
  return (
    <li style={css(`background: #FFFFFF; padding: 20px 22px; display: flex; flex-direction: column; gap: 4px`)}>
      <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 38px; font-weight: 800; letter-spacing: -0.04em; color: #6A4FB6; line-height: 1`)}>{value}</span>{" "}
      <span style={css(`font-size: 14px; font-weight: 700; line-height: 1.35`)}>{label}</span>
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

export function IaCard({ kicker, title, text, favorite, note }: { kicker: string; title: string; text: string; favorite?: boolean; note?: string }) {
  return (
    <article style={css(`border-radius: 20px; border: ${favorite ? "2px solid #6A4FB6" : "1px solid #E4DCF7"}; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 10px`)}>
      <div style={css(`display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px`)}>
        <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>{kicker}</span>
        {favorite && <span style={css(`padding: 3px 9px; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; font-size: 13px; font-weight: 800; letter-spacing: 0.04em`)}>{"PRÉDILECTION"}</span>}
      </div>
      <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em`)}>{title}</h3>
      <p style={css(`margin: 0; font-size: 16px; line-height: 1.55; color: #5B5470`)}>{text}</p>
      {note && <Note text={note} />}
    </article>
  );
}
