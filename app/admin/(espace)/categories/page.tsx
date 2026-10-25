import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { CategoryList } from "@/components/admin/CategoryList";

export const metadata: Metadata = { title: "Catégories" };
export const dynamic = "force-dynamic";

// Maquette : docs/passation/maquettes/admin/Admin-categories.jpg.
export default async function Categories() {
  await requireAdmin();
  const prisma = db();
  const [cats, projets] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] }),
    prisma.project.findMany({ where: { deletedAt: null }, select: { types: true, parcours: true } }),
  ]);
  const rows = (kind: string) =>
    cats
      .filter((c) => c.kind === kind)
      .map((c) => ({
        id: c.id,
        name: c.name,
        nature: c.nature,
        count: projets.filter((p) => (kind === "cadre" ? p.parcours === c.name : (p.types as string[]).includes(c.name))).length,
      }));
  return (
    <>
      <div>
        <h1 className="adm-h1">Catégories</h1>
        <p className="adm-sub">Les listes qui alimentent les formulaires et les filtres du site.</p>
      </div>
      <p className="adm-empty" style={{ margin: 0 }}>
        Un type ou un cadre utilisé par des projets ne se supprime pas directement : le site propose de réaffecter les projets concernés avant.
      </p>
      <div className="adm-grid-2" style={{ alignItems: "start" }}>
        <section className="adm-card" aria-labelledby="c-types">
          <div>
            <h2 className="adm-h2" id="c-types">Types de projet</h2>
            <p className="adm-sub">Utilisés pour filtrer la page Projets.</p>
          </div>
          <CategoryList kind="type" rows={rows("type")} />
        </section>
        <section className="adm-card" aria-labelledby="c-cadres">
          <div>
            <h2 className="adm-h2" id="c-cadres">Cadres</h2>
            <p className="adm-sub">La formation, l’audit, l’entreprise ou le projet perso.</p>
          </div>
          <CategoryList kind="cadre" rows={rows("cadre")} />
        </section>
      </div>
    </>
  );
}
