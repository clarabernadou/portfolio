import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { formContext, toInput } from "../form-data";

export const metadata: Metadata = { title: "Modifier un projet" };
export const dynamic = "force-dynamic";

export default async function ModifierProjet({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const row = await db().project.findFirst({ where: { id, deletedAt: null } });
  if (!row) notFound();
  const ctx = await formContext();
  const updatedAt = row.updatedAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" });
  return <ProjectForm key={row.id + row.updatedAt.getTime()} initial={toInput(row)} updatedAt={updatedAt} {...ctx} />;
}
