import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { A_COMPLETER, enCours, type ACompleter } from "@/lib/admin/projects";
import { depuis, ilYa } from "@/lib/admin/activity";
import { Icon } from "@/components/admin/icons";
import { SyncOnOpen } from "@/components/admin/SyncPanels";

export const metadata: Metadata = { title: "Tableau de bord" };
export const dynamic = "force-dynamic";

// Maquette : docs/passation/maquettes/admin/Admin-tableau-de-bord.jpg.
export default async function TableauDeBord() {
  await requireAdmin();
  const prisma = db();
  const [projets, formations, experiences, activite] = await Promise.all([
    prisma.project.findMany({ where: { deletedAt: null } }),
    prisma.formation.findMany({ orderBy: { position: "asc" } }),
    prisma.experience.findMany({ orderBy: { position: "asc" } }),
    prisma.syncLog.findMany({ where: { source: { in: ["admin", "github", "linkedin"] } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  const derniere = activite[0];
  const obtenues = formations.filter((f) => f.statut === "Obtenu").length;
  const aCompleter = (Object.keys(A_COMPLETER) as ACompleter[])
    .map((k) => ({ k, n: projets.filter(A_COMPLETER[k].test).length }))
    .filter((x) => x.n > 0);

  return (
    <>
      <SyncOnOpen />
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">Bonjour Clara</h1>
          <p className="adm-sub">Voici l’état de ton site.</p>
        </div>
        <Link className="adm-btn" href="/admin/projets/nouveau">
          <Icon name="plus" />
          Ajouter un projet
        </Link>
      </div>

      <div className="adm-grid-4">
        <div className="adm-card adm-stat">
          <b>{projets.length}</b>
          <span>Projets</span>
          <small>{projets.filter(enCours).length} en cours</small>
        </div>
        <div className="adm-card adm-stat">
          <b>{formations.length}</b>
          <span>Formations</span>
          <small>
            {obtenues} {obtenues > 1 ? "obtenues" : "obtenue"}, {formations.length - obtenues} en cours
          </small>
        </div>
        <div className="adm-card adm-stat">
          <b>{experiences.length}</b>
          <span>Expériences</span>
          <small>{experiences.map((e) => e.entreprise).join(", ")}</small>
        </div>
        <div className="adm-card adm-stat">
          <b>{derniere ? depuis(derniere.createdAt) : "–"}</b>
          <span>Dernière modification</span>
          <small className="adm-discret">{derniere?.message ?? "Aucune pour l’instant"}</small>
        </div>
      </div>

      <div className="adm-grid-2">
        <section className="adm-card" aria-labelledby="a-completer">
          <div>
            <h2 className="adm-h2" id="a-completer">À compléter</h2>
            <p className="adm-sub">Ce qui manque encore sur le site</p>
          </div>
          {aCompleter.length ? (
            <ul className="adm-list">
              {aCompleter.map(({ k, n }) => (
                <li key={k}>
                  <span className={`adm-niveau adm-niveau--${A_COMPLETER[k].niveau}`}>
                    <Icon name={A_COMPLETER[k].niveau === "erreur" ? "alert" : "warning"} />
                    <span className="adm-sr">{A_COMPLETER[k].niveau === "erreur" ? "Important : " : "À vérifier : "}</span>
                    {A_COMPLETER[k].label(n)}
                  </span>
                  <Link className="adm-btn adm-btn--link" href={`/admin/projets?a-completer=${k}`}>
                    {k === "imports" ? "Compléter" : "Corriger"}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adm-empty">Rien à compléter : tout est à jour.</p>
          )}
        </section>

        <section className="adm-card" aria-labelledby="activite">
          <h2 className="adm-h2" id="activite">Activité récente</h2>
          {activite.length ? (
            <ul className="adm-list">
              {activite.map((a) => (
                <li key={a.id}>
                  <span className="adm-discret">{a.message ?? `${a.entity} ${a.entityId}`}</span>
                  <span className="adm-muted">{ilYa(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adm-empty">Les modifications que tu feras apparaîtront ici.</p>
          )}
        </section>
      </div>

      <div className="adm-grid-4">
        {[
          { href: "/admin/projets", icon: "folder", title: "Gérer les projets", text: "Ajouter, modifier, publier ou supprimer" },
          { href: "/admin/formations", icon: "graduation", title: "Gérer les formations", text: "Ajouter ou modifier : titre, niveau, statut" },
          { href: "/admin/experiences", icon: "briefcase", title: "Gérer les expériences", text: "Ajouter ou modifier : postes, puces" },
          { href: "/admin/profil", icon: "user", title: "Profil et CV", text: "Modifier le profil, générer les PDF" },
        ].map((s) => (
          <Link key={s.href + s.title} href={s.href} className="adm-card adm-shortcut">
            <i>
              <Icon name={s.icon} />
            </i>
            <span>
              <b>{s.title}</b>
              <br />
              <small>{s.text}</small>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
