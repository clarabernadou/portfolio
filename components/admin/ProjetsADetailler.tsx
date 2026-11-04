import Link from "next/link";
import { CHAMPS_RETOUR, champsRemplis, lireRetour, prioriteRecruteur, retourComplet } from "@/lib/retour";

// Carte du tableau de bord (demande de Clara, 4 nov. 2026) : les projets dont le retour d'expérience
// n'est pas complet, du plus important au moins important pour un recruteur (lib/retour.ts).
type Ligne = {
  id: string;
  name: string;
  parcours: string;
  types: unknown;
  date: string;
  featured: boolean;
  onHome: boolean;
  docs: unknown;
  github: string | null;
  site: string | null;
  retour: unknown;
  status: string;
  visible: boolean;
};

const AFFICHES = 8;
const statut = (p: Ligne) => (p.status === "draft" ? ["brouillon", "Brouillon"] : !p.visible ? ["masque", "Privé"] : ["publie", "Publié"]);

export function ProjetsADetailler({ projets }: { projets: Ligne[] }) {
  const lignes = projets.map((p) => ({
    p,
    retour: lireRetour(p.retour),
    ...prioriteRecruteur({
      parcours: p.parcours,
      types: p.types as string[],
      date: p.date,
      featured: p.featured,
      onHome: p.onHome,
      docs: (p.docs as unknown[]).length,
      github: !!p.github,
      site: !!p.site,
    }),
  }));
  const faits = lignes.filter((l) => retourComplet(l.retour)).length;
  const restants = lignes.filter((l) => !retourComplet(l.retour)).sort((a, b) => b.score - a.score);
  return (
    <section className="adm-card" aria-labelledby="a-detailler">
      <div>
        <h2 className="adm-h2" id="a-detailler">
          Projets à détailler
        </h2>
        <p className="adm-sub">Difficultés, ce que tu en as retenu, ce que tu améliorerais : les plus utiles à un recruteur d’abord.</p>
      </div>
      <div className="adm-progression">
        <p>
          <b>{faits}</b> {faits > 1 ? "projets détaillés" : "projet détaillé"} sur {lignes.length}
        </p>
        <progress max={lignes.length} value={faits} aria-label="Projets détaillés" />
      </div>
      {restants.length ? (
        <>
          <ol className="adm-a-detailler">
            {restants.slice(0, AFFICHES).map(({ p, retour, raisons }) => {
              const [cle, libelle] = statut(p);
              const n = champsRemplis(retour);
              return (
                <li key={p.id}>
                  <div className="adm-a-detailler-ligne">
                    <div>
                      <Link href={`/admin/projets/${p.id}#retour`}>{p.name}</Link>
                      <span className="adm-muted">{raisons.join(" · ")}</span>
                    </div>
                    <span className="adm-a-detailler-etat">
                      <span className={`adm-badge adm-badge--${cle}`}>{libelle}</span>
                      <span className="adm-muted">
                        {n} / {CHAMPS_RETOUR.length}
                        <span className="adm-sr"> {n > 1 ? "champs remplis" : "champ rempli"}</span>
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
          {restants.length > AFFICHES && (
            <Link className="adm-btn adm-btn--link" href="/admin/projets?a-completer=retour">
              Voir les {restants.length} projets à détailler
            </Link>
          )}
        </>
      ) : (
        <p className="adm-empty">Tous les projets ont leur retour d’expérience.</p>
      )}
    </section>
  );
}
