import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjetFiche } from "@/components/proto/Projets";
import { getProjetApercu, getSiteProjects } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { css } from "@/lib/css";

// Aperçu d'une fiche projet non publiée (brouillon ou privée), avec le rendu exact du site.
// Réservé à la session de Clara (proxy.ts et requireAdmin), jamais indexé ni mis en cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Aperçu du projet · Administration" },
  robots: { index: false, follow: false },
};

export default async function ApercuProjetPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [projet, publics] = await Promise.all([getProjetApercu(id), getSiteProjects()]);
  if (!projet) notFound();
  // Le projet prend sa place dans la liste publique, pour les liens « précédent / suivant ».
  const projects = publics.some((p) => p.id === id) ? publics : [projet, ...publics];
  return (
    <>
      <p role="status" style={css("margin: 0; padding: 12px 16px; background: var(--brume); color: var(--encre); font-size: 15px; text-align: center; text-wrap: pretty")}>
        <b>Aperçu</b> : ce projet n’est visible que par toi tant qu’il n’est pas publié.{" "}
        <a href={`/admin/projets/${id}`} style={css("color: var(--amethyste); font-weight: 700")}>
          Revenir à la fiche dans l’administration
        </a>
      </p>
      <ProjetFiche id={id} projects={projects} />
    </>
  );
}
