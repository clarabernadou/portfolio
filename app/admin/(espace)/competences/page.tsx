import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SkillsEditor } from "@/components/admin/SkillsEditor";

export const metadata: Metadata = { title: "Compétences" };
export const dynamic = "force-dynamic";

// Maquette : docs/passation/maquettes/admin/Admin-competences.jpg. Les deux versions du CV
// validées n'ont pas les mêmes catégories (5 dans l'essentiel, 7 dans le complet) :
// chaque version a donc sa liste, au lieu d'un tableau unique à deux interrupteurs.
export default async function Competences() {
  await requireAdmin();
  const rows = await db().skillGroup.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  const of = (v: string) => rows.filter((r) => r.version === v).map((r) => ({ name: r.name, items: r.items as string[] }));
  const toutes = [...new Set(rows.flatMap((r) => r.items as string[]))];
  return (
    <>
      <div>
        <h1 className="adm-h1">Compétences</h1>
        <p className="adm-sub">Les listes de compétences et d’outils du CV.</p>
      </div>
      <p className="adm-empty" style={{ margin: 0 }}>
        Les catégories se renomment et se réordonnent ici. Le CV essentiel et le CV complet ont chacun leurs catégories : une compétence s’affiche dans la version où elle est rangée.
      </p>
      <div className="adm-grid-2" style={{ alignItems: "start" }}>
        <SkillsEditor version="essentiel" initial={of("essentiel")} suggestions={toutes} />
        <SkillsEditor version="complet" initial={of("complet")} suggestions={toutes} />
      </div>
    </>
  );
}
