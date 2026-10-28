import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SkillsEditor } from "@/components/admin/SkillsEditor";

export const metadata: Metadata = { title: "Compétences" };
export const dynamic = "force-dynamic";

// Maquette : docs/passation/maquettes/admin/Admin-competences.jpg. Une seule liste : le CV
// n'a plus qu'une version (décision de Clara, 28 oct. 2026), rangée en base sous « essentiel ».
export default async function Competences() {
  await requireAdmin();
  const rows = await db().skillGroup.findMany({ where: { version: "essentiel" }, orderBy: [{ position: "asc" }, { id: "asc" }] });
  const groupes = rows.map((r) => ({ name: r.name, items: r.items as string[] }));
  const toutes = [...new Set(groupes.flatMap((g) => g.items))];
  return (
    <>
      <div>
        <h1 className="adm-h1">Compétences</h1>
        <p className="adm-sub">Les listes de compétences et d’outils du CV.</p>
      </div>
      <SkillsEditor initial={groupes} suggestions={toutes} />
    </>
  );
}
