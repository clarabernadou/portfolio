import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { A_COMPLETER, enCours, type ACompleter } from "@/lib/admin/projects";
import { Icon } from "@/components/admin/icons";
import { AutoFilters } from "@/components/admin/AutoFilters";
import { RowActions } from "@/components/admin/RowActions";
import { deleteProject, duplicateProject, restoreProject } from "./actions";

export const metadata: Metadata = { title: "Projets" };
export const dynamic = "force-dynamic";

const PAR_PAGE = 12;
const STATUTS = [
  ["publie", "Publié"],
  ["cours", "En cours"],
  ["brouillon", "Brouillon"],
  ["masque", "Masqué"],
] as const;

type Search = { q?: string; type?: string; cadre?: string; statut?: string; page?: string; "a-completer"?: string };

// Maquette : docs/passation/maquettes/admin/Admin-projets.jpg.
export default async function ProjetsAdmin({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const prisma = db();
  const [all, cats] = await Promise.all([
    prisma.project.findMany({ where: { deletedAt: null }, orderBy: [{ position: "asc" }, { createdAt: "desc" }] }),
    prisma.category.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] }),
  ]);

  const TYPES = cats.filter((c) => c.kind === "type").map((c) => c.name);
  const cadres = cats.filter((c) => c.kind === "cadre");
  const statut = (p: (typeof all)[number]) =>
    !p.visible ? "masque" : p.status === "draft" ? "brouillon" : enCours(p) ? "cours" : "publie";
  const q = (sp.q ?? "").trim().toLowerCase();
  const ac = sp["a-completer"] as ACompleter | undefined;
  const filtered = all.filter(
    (p) =>
      (!q || [p.name, p.id, p.parcours, ...(p.tags as string[])].join(" ").toLowerCase().includes(q)) &&
      (!sp.type || (p.types as string[]).includes(sp.type)) &&
      (!sp.cadre || p.parcours === sp.cadre) &&
      (!sp.statut || statut(p) === sp.statut) &&
      (!ac || !A_COMPLETER[ac] || A_COMPLETER[ac].test(p)),
  );
  const page = Math.max(1, Number(sp.page) || 1);
  const pages = Math.max(1, Math.ceil(filtered.length / PAR_PAGE));
  const shown = filtered.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
  const link = (patch: Partial<Search>) => {
    const u = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/projets${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">Projets</h1>
          <p className="adm-sub">
            {all.length} projets, tous types et cadres confondus.
          </p>
        </div>
        <Link className="adm-btn" href="/admin/projets/nouveau">
          <Icon name="plus" />
          Nouveau projet
        </Link>
      </div>

      <AutoFilters>
        <label className="adm-search">
          <span className="adm-sr">Rechercher</span>
          <Icon name="search" />
          <input className="adm-input" type="search" name="q" defaultValue={sp.q} placeholder="Rechercher un projet, un tag, une formation" />
        </label>
        <select className="adm-select" name="type" defaultValue={sp.type ?? ""} aria-label="Type">
          <option value="">Tous les types</option>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className="adm-select" name="cadre" defaultValue={sp.cadre ?? ""} aria-label="Cadre">
          <option value="">Tous les cadres</option>
          {cadres.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="adm-select" name="statut" defaultValue={sp.statut ?? ""} aria-label="Statut">
          <option value="">Tous les statuts</option>
          {STATUTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        {ac && <input type="hidden" name="a-completer" value={ac} />}
      </AutoFilters>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <span className="adm-pill">À l’accueil : {all.filter((p) => p.onHome).length} / 9</span>
        <span className="adm-pill">Projets phares : {all.filter((p) => p.featured).length} / 3</span>
        <span className="adm-help" aria-live="polite">
          {filtered.length} {filtered.length > 1 ? "projets" : "projet"}
          {ac && A_COMPLETER[ac] ? ` · ${A_COMPLETER[ac].label(filtered.length)}` : ""}
        </span>
        {(q || sp.type || sp.cadre || sp.statut || ac) && (
          <Link className="adm-btn adm-btn--link" href="/admin/projets">
            Effacer les filtres
          </Link>
        )}
      </div>

      {shown.length ? (
        <div className="adm-table-wrap" tabIndex={0} role="region" aria-label="Liste des projets">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Projet</th>
                <th scope="col">Types</th>
                <th scope="col">Cadre</th>
                <th scope="col">Date</th>
                <th scope="col">Mis en avant</th>
                <th scope="col">Statut</th>
                <th scope="col" style={{ textAlign: "right" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const s = statut(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/projets/${p.id}`} style={{ color: "inherit", fontWeight: 800, textDecoration: "none" }}>
                        {p.name}
                      </Link>
                      <small>/projets/{p.id}</small>
                    </td>
                    <td>{(p.types as string[]).join(" · ")}</td>
                    <td>{p.parcours}</td>
                    <td>{p.date}</td>
                    <td>
                      {p.onHome && <span className="adm-flag">Accueil</span>}
                      {p.featured && <span className="adm-flag">Phare</span>}
                    </td>
                    <td>
                      <span className={`adm-badge adm-badge--${s}`}>{STATUTS.find(([v]) => v === s)![1]}</span>
                    </td>
                    <td>
                      <RowActions
                        name={p.name}
                        editHref={`/admin/projets/${p.id}`}
                        onDuplicate={duplicateProject.bind(null, p.id)}
                        onDelete={deleteProject.bind(null, p.id)}
                        onRestore={restoreProject.bind(null, p.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="adm-empty">
          <b>Aucun projet ne correspond.</b>
          Modifie la recherche ou efface les filtres.
        </p>
      )}

      <nav aria-label="Pagination" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span className="adm-help">
          {filtered.length ? `${(page - 1) * PAR_PAGE + 1} à ${Math.min(page * PAR_PAGE, filtered.length)} sur ${filtered.length}` : ""}
        </span>
        <span style={{ display: "flex", gap: 8 }}>
          {page > 1 ? (
            <Link className="adm-btn adm-btn--outline" href={link({ page: String(page - 1) })}>
              Précédent
            </Link>
          ) : null}
          {page < pages ? (
            <Link className="adm-btn adm-btn--outline" href={link({ page: String(page + 1) })}>
              Suivant
            </Link>
          ) : null}
        </span>
      </nav>
    </>
  );
}
