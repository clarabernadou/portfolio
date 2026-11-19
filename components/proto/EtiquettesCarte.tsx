import { css } from "@/lib/css";
import { ETIQUETTES_ACCUEIL, etiquettesRestantes, etiquettesVisibles } from "@/lib/data-shared";

// Étiquettes d'une carte de projet de l'accueil (19 nov. 2026) : toujours sur une seule ligne.
// 3 au plus, puis « +N » ; quand la carte est étroite (moins de 300 px, requête de conteneur dans
// globals.css), 2 au plus, puis « +N ». Les éléments masqués le sont aussi pour les lecteurs d'écran.
const TAG = `padding: 4px 10px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; font-size: 14px; font-weight: 700; white-space: nowrap`;

function Plus({ n, className }: { n: number; className: string }) {
  return (
    <li className={className} style={css(TAG)}>
      <span aria-hidden={"true"}>{`+${n}`}</span>
      <span className={"visuellement-masque"}>{`et ${n} autre${n > 1 ? "s" : ""}`}</span>
    </li>
  );
}

export function EtiquettesCarte({ tags }: { tags: string[] }) {
  const visibles = etiquettesVisibles(tags, ETIQUETTES_ACCUEIL);
  const reste = etiquettesRestantes(tags, ETIQUETTES_ACCUEIL);
  return (
    <div className={"etiquettes-cadre"} style={css(`margin-top: auto`)}>
      <ul role={"list"} className={"liste-nue"} style={css(`display: flex; gap: 6px; flex-wrap: wrap; align-content: flex-end; min-height: 64px`)}>
        {visibles.map((t, i) => (
          <li key={t} className={i >= 2 ? "etiquette-large" : undefined} style={css(TAG)}>
            {t}
          </li>
        ))}
        {reste > 0 && <Plus n={reste} className={"etiquette-large"} />}
        {visibles.length > 2 && <Plus n={tags.length - 2} className={"etiquette-etroite"} />}
      </ul>
    </div>
  );
}
