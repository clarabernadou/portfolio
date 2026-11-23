import { css } from "@/lib/css";
import { CHAMPS_EVALUATION, EVALUATION_SOURCE, evaluationAffichee, lignes, type Evaluation } from "@/lib/evaluation";

// Section « Retour de l'évaluateur » de la fiche projet (demande de Clara, 23 nov. 2026), sous le retour
// d'expérience et au même niveau de titre (h2, puis un h3 par champ rempli : RGAA 9.1). Rien ne s'affiche
// tant qu'aucun champ n'est rempli, et un champ vide n'a pas de titre. Points forts et axes : une liste
// (RGAA 9.3) dès qu'ils ont plusieurs lignes, un paragraphe sinon. Mention de la source sous le bloc.
const TEXTE = `font-size: 17px; line-height: 1.65`;

function Contenu({ texte }: { texte: string }) {
  const l = lignes(texte);
  if (l.length > 1)
    return (
      <ul style={css(`margin: 0; padding-left: 1.4em; list-style: disc; ${TEXTE}`)}>
        {l.map((x, i) => (
          <li key={i} style={css(`margin: ${i ? "4px" : "0"} 0 0`)}>
            {x}
          </li>
        ))}
      </ul>
    );
  return <p style={css(`margin: 0; ${TEXTE}`)}>{l[0] ?? texte.trim()}</p>;
}

export function RetourEvaluateur({ evaluation }: { evaluation: Partial<Evaluation> | null | undefined }) {
  const e = evaluationAffichee(evaluation);
  if (!e) return null;
  const cartes = CHAMPS_EVALUATION.filter((c) => c.cle !== "mois" && e[c.cle]);
  return (
    <section aria-labelledby={"retour-evaluateur"} style={css(`display: flex; flex-direction: column; gap: 1rem`)}>
      <h2 id={"retour-evaluateur"} style={css(`margin: 0; font-family: var(--font-titre); font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; text-wrap: balance`)}>
        {"Retour de l’évaluateur"}
      </h2>
      {e.mois && <p style={css(`margin: 0; font-size: 16px; color: var(--ardoise)`)}>{`Soutenance : ${e.mois}`}</p>}
      {cartes.length > 0 && (
        <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 1.25rem; align-items: stretch`)}>
          {cartes.map((c) => (
            <li key={c.cle} style={css(`display: grid`)}>
              <article style={css(`border-radius: var(--r-22); border: 1px solid var(--bordure); padding: 24px; display: flex; flex-direction: column; gap: 10px`)}>
                <h3 style={css(`margin: 0; font-family: var(--font-titre); font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: var(--amethyste); text-wrap: balance`)}>{c.titre}</h3>
                <Contenu texte={e[c.cle]} />
              </article>
            </li>
          ))}
        </ul>
      )}
      <p style={css(`margin: 0; font-size: 15px; font-style: italic; color: var(--ardoise)`)}>{EVALUATION_SOURCE}</p>
    </section>
  );
}
