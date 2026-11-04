import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjetFiche } from "@/components/proto/Projets";
import { ProjetEnValidation } from "@/components/proto/ProjetEnValidation";
import { getProjetApercu, getSiteProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd, projetJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getSiteProjects()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = (await getSiteProjects()).find((p) => p.id === id);
  if (!project) return (await getProjetApercu(id)) ? { title: "Projet en cours de validation", robots: { index: false, follow: true } } : {};
  return pageMetadata(`${project.name} · ${project.parcours}`, project.line, `/projets/${project.id}`);
}

export default async function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projects = await getSiteProjects();
  const projet = projects.find((p) => p.id === id);
  // Projet pas encore publié (brouillon ou privé) : page « en cours de validation », non indexée, plutôt
  // que la page d'erreur. Connectée, Clara voit l'aperçu à cette adresse (proxy.ts).
  if (!projet) {
    if (await getProjetApercu(id)) return <ProjetEnValidation />;
    notFound();
  }
  return (
    <>
      <JsonLd data={projetJsonLd(projet)} />
      <ProjetFiche id={id} projects={projects} />
    </>
  );
}
