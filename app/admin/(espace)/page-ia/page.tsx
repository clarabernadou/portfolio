import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getIa } from "@/lib/data";
import { IaEditor } from "@/components/admin/IaEditor";

export const metadata: Metadata = { title: "Page IA" };
export const dynamic = "force-dynamic";

// Maquette : docs/passation/maquettes/admin/Admin-page-ia.jpg.
export default async function PageIa() {
  await requireAdmin();
  const ia = await getIa();
  return (
    <>
      <div>
        <h1 className="adm-h1">Page IA</h1>
        <p className="adm-sub">Outils, skills et routines de la page IA.</p>
      </div>
      <IaEditor initial={{ tools: ia.tools, skills: ia.skills, routines: ia.routines }} stats={ia.stats} />
    </>
  );
}
