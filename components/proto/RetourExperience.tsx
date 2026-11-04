import { css } from "@/lib/css";
import { CHAMPS_RETOUR, type Retour } from "@/lib/retour";

// Section « Retour d'expérience » de la fiche projet (demande de Clara, 4 nov. 2026) : une carte par
// champ rempli, au style de la carte « Contexte ». Rien ne s'affiche tant qu'aucun champ n'est rempli.
// Les titres publics sont ceux des champs de l'administration (lib/retour.ts).
export function RetourExperience({ retour }: { retour: Retour }) {
  const remplis = CHAMPS_RETOUR.filter((c) => retour[c.cle].trim());
  if (!remplis.length) return null;
  return (
    <section aria-labelledby={"retour-experience"} style={css(`display: flex; flex-direction: column; gap: 1rem`)}>
      <h2 id={"retour-experience"} style={css(`margin: 0; font-family: var(--font-titre); font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; text-wrap: balance`)}>
        {"Retour d’expérience"}
      </h2>
      <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 1.25rem; align-items: stretch`)}>
        {remplis.map((c) => (
          <li key={c.cle} style={css(`display: grid`)}>
            <article style={css(`border-radius: var(--r-22); border: 1px solid var(--bordure); padding: 24px; display: flex; flex-direction: column; gap: 10px`)}>
              <h3 style={css(`margin: 0; font-family: var(--font-titre); font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: var(--amethyste); text-wrap: balance`)}>{c.titre}</h3>
              <p style={css(`margin: 0; font-size: 17px; line-height: 1.65; white-space: pre-line`)}>{retour[c.cle].trim()}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
