import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadSources } from "@/lib/pdf/server";
import { nomFichier } from "@/lib/pdf/cv-data";
import { ORIENTATIONS, toState, type OrientationId } from "@/lib/admin/orientations";
import { CvOrienteEditor } from "@/components/admin/CvOrienteEditor";

export const metadata: Metadata = { title: "CV orienté" };
export const dynamic = "force-dynamic";

export default async function CvOriente({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (id !== "ux" && id !== "dev") notFound();
  const prisma = db();
  const [row, sources, fichiers] = await Promise.all([prisma.cvOrientation.findUnique({ where: { id } }), loadSources(), prisma.generatedFile.findMany({ select: { name: true, generatedAt: true } })]);
  const initial = toState(id as OrientationId, row?.data);
  // Projets proposés : ceux de l'accueil, les phares du site et les suggestions des orientations.
  const candidats = [...new Set([...ORIENTATIONS.flatMap((o) => o.featured), ...sources.projets.filter((p) => p.homeCard).map((p) => p.id), "portfolio"])];
  const fichier = (name: string) => ({
    name,
    generatedAt: fichiers.find((f) => f.name === name)?.generatedAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" }) ?? null,
  });
  return (
    <CvOrienteEditor
      key={id}
      initial={initial}
      sources={sources}
      orientations={ORIENTATIONS}
      candidats={candidats}
      fichiers={[fichier(nomFichier(initial))]}
    />
  );
}
