import { css } from "@/lib/css";
import { CHAMPS_EVALUATION, EVALUATION_SOURCE, evaluationAffichee, ligneSoutenance, lignes, type Evaluation } from "@/lib/evaluation";

// Section « Retour de l'évaluateur » de la fiche projet (demande de Clara, 23 nov. 2026), sous le retour
// d'expérience et au même niveau de titre (h2, puis un h3 par champ rempli : RGAA 9.1). Rien ne s'affiche
// tant qu'aucun champ n'est rempli, et un champ vide n'a pas de titre. Points forts et axes : une liste
// (RGAA 9.3) dès qu'ils ont plusieurs lignes, un paragraphe sinon.
// 25 nov. 2026 : textes reproduits mot pour mot ; « Soutenance réalisée le … / en … » ; mention de la source seulement
// s'il y a au moins une carte. Bureau : Points forts à gauche (60 %), Axes puis Remarque empilés à droite ; sans Points
// forts, les deux autres côte à côte ; un seul bloc, pleine largeur. Mobile : une colonne. Cartes à la hauteur du
// contenu (.eval-grille, app/globals.css).
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
  const forts = cartes.some((c) => c.cle === "pointsForts");
  const droite = cartes.filter((c) => c.cle !== "pointsForts").length;
  const disposition = forts && droite > 0 ? "eval-grille eval-colonnes" : !forts && droite === 2 ? "eval-grille eval-deux" : "eval-grille";
  return (
    <section aria-labelledby={"retour-evaluateur"} style={css(`display: flex; flex-direction: column; gap: 12px`)}>
      <div style={css(`display: flex; flex-direction: column; gap: 4px`)}>
        <h2 id={"retour-evaluateur"} style={css(`margin: 0; font-family: var(--font-titre); font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; text-wrap: balance`)}>
          {"Retour de l’évaluateur"}
        </h2>
        {e.mois && <p style={css(`margin: 0; font-size: 16px; color: var(--ardoise)`)}>{ligneSoutenance(e.mois)}</p>}
      </div>
      {cartes.length > 0 && (
        <ul role={"list"} className={`liste-nue ${disposition}`}>
          {cartes.map((c) => (
            <li key={c.cle} className={c.cle === "pointsForts" ? "eval-forts" : undefined}>
              <article style={css(`border-radius: var(--r-22); border: 1px solid var(--bordure); padding: 24px; display: flex; flex-direction: column; gap: 10px`)}>
                <h3 style={css(`margin: 0; font-family: var(--font-titre); font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: var(--amethyste); text-wrap: balance`)}>{c.titre}</h3>
                <Contenu texte={e[c.cle]} />
              </article>
            </li>
          ))}
        </ul>
      )}
      {cartes.length > 0 && <p style={css(`margin: 0; font-size: 15px; font-style: italic; color: var(--ardoise)`)}>{EVALUATION_SOURCE}</p>}
    </section>
  );
}
