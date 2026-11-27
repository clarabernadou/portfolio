import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjetFiche } from "@/components/proto/Projets";
import { getSiteProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd, projetJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getSiteProjects()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = (await getSiteProjects()).find((p) => p.id === id);
  if (!project) return {};
  // Titre « Nom · type de projet » (13 nov. 2026).
  return pageMetadata(`${project.name} · ${project.type}`, project.line, `/projets/${project.id}`);
}

export default async function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projects = await getSiteProjects();
  const projet = projects.find((p) => p.id === id);
  // Projet non publié (brouillon ou privé) : 404 pour les visiteurs (27 nov. 2026). Connectée, Clara voit l'aperçu
  // à cette adresse (proxy.ts, réécriture vers /apercu/projets/<id>).
  if (!projet) notFound();
  return (
    <>
      <JsonLd data={projetJsonLd(projet)} />
      <ProjetFiche id={id} projects={projects} />
    </>
  );
}
