import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjetFiche } from "@/components/proto/Projets";
import { getSiteProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  return (await getSiteProjects()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = (await getSiteProjects()).find((p) => p.id === id);
  if (!project) return {};
  return pageMetadata(project.name, project.line);
}

export default async function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projects = await getSiteProjects();
  if (!projects.some((p) => p.id === id)) notFound();
  return <ProjetFiche id={id} projects={projects} />;
}
