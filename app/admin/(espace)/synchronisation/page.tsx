import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSyncSettings, reposNonImportes } from "@/lib/admin/sync";
import { ilYa } from "@/lib/admin/activity";
import { GithubPanel } from "@/components/admin/SyncPanels";

export const metadata: Metadata = { title: "Synchronisation" };
export const dynamic = "force-dynamic";

const LIEN: Record<string, (id: string) => string> = {
  project: (id) => `/admin/projets/${id}`,
  experience: (id) => `/admin/experiences?id=${id}`,
  formation: (id) => `/admin/formations?id=${id}`,
};

// Maquette : docs/passation/maquettes/admin/Admin-synchronisation.jpg (§6).
export default async function Synchronisation({ searchParams }: { searchParams: Promise<{ tout?: string }> }) {
  await requireAdmin();
  const { tout } = await searchParams;
  const [settings, journal, repos] = await Promise.all([
    getSyncSettings(),
    db().syncLog.findMany({ where: { source: "github" }, orderBy: { createdAt: "desc" }, take: tout ? 200 : 8 }),
    reposNonImportes().catch(() => []),
  ]);
  const depuis = (iso: string | null) => (iso ? ilYa(new Date(iso)) : "jamais");
  return (
    <>
      <div>
        <h1 className="adm-h1">Synchronisation</h1>
        <p className="adm-sub">GitHub alimente les projets automatiquement. Tu complètes ensuite les détails. Les expériences et les formations s’ajoutent à la main, dans leurs rubriques.</p>
      </div>
      <p className="adm-empty" style={{ margin: 0 }}>
        Chaque élément importé est publié tout de suite avec les informations disponibles. Il apparaît dans « À compléter » du tableau de bord jusqu’à ce que tu l’aies enrichi.
      </p>
      <div style={{ maxWidth: 640 }}>
        <GithubPanel settings={settings.github} depuis={depuis(settings.github.lastRun)} repos={settings.github.baseline ? repos : []} />
      </div>

      <section className="adm-card" aria-labelledby="s-auto">
        <div>
          <h2 className="adm-h2" id="s-auto">Ce qui se remplit tout seul</h2>
          <p className="adm-sub">Le reste, tu le complètes ensuite dans les formulaires habituels.</p>
        </div>
        <div className="adm-table-wrap" tabIndex={0} role="region" aria-label="Tableau des champs remplis par GitHub">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col">Rempli automatiquement</th>
                <th scope="col">À compléter par toi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" style={{ background: "none", textTransform: "none", letterSpacing: 0, fontSize: 15, color: "var(--encre)" }}>GitHub · Projet</th>
                <td>Nom, description, langages (tags), lien GitHub, date du dernier commit</td>
                <td>Types, cadre, contexte, compétences, livrables, avancement</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="adm-empty" style={{ margin: 0 }}>
          Une information que tu modifies à la main n’est plus jamais écrasée par une synchronisation.
        </p>
      </section>

      <section className="adm-card" aria-labelledby="s-journal">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 className="adm-h2" id="s-journal">Journal des imports</h2>
            <p className="adm-sub">Ce que la synchronisation a créé ou mis à jour.</p>
          </div>
          {!tout && (
            <Link className="adm-btn adm-btn--link" href="/admin/synchronisation?tout=1">
              Voir tout le journal
            </Link>
          )}
        </div>
        {journal.length ? (
          <ul className="adm-list">
            {journal.map((j) => (
              <li key={j.id}>
                <span style={{ minWidth: 0 }}>
                  <b>{j.message}</b>
                  <small className="adm-muted" style={{ display: "block" }}>
                    {ilYa(j.createdAt)} · GitHub
                  </small>
                </span>
                <span style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {j.state.split(" · ").map((s) => (
                    <span key={s} className={`adm-badge adm-badge--${/Publi/.test(s) ? "publie" : "brouillon"}`}>
                      {s}
                    </span>
                  ))}
                  {LIEN[j.entity] && j.entityId !== "*" && (
                    <Link className="adm-btn adm-btn--link" href={LIEN[j.entity](j.entityId)}>
                      Modifier
                    </Link>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-help" style={{ margin: 0 }}>
            Aucun import pour l’instant.
          </p>
        )}
      </section>
    </>
  );
}
