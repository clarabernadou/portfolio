import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FormationCourte } from "@/lib/types";
import { FormationsCourtesEditor } from "@/components/admin/FormationsCourtesEditor";

export const metadata: Metadata = { title: "Formations courtes" };
export const dynamic = "force-dynamic";

export default async function FormationsCourtes() {
  await requireAdmin();
  const row = await db().singleton.findUnique({ where: { key: "formationsCourtes" } });
  const items = ((row?.data as { items?: FormationCourte[] } | null)?.items ?? []) as FormationCourte[];
  return (
    <>
      <div>
        <h1 className="adm-h1">Formations courtes et certifications</h1>
        <p className="adm-sub">La liste sous les formations, dans la rubrique « Parcours » de l’accueil. Une ligne par organisme, dans l’ordre de cette liste.</p>
      </div>
      <FormationsCourtesEditor initial={items} />
    </>
  );
}
