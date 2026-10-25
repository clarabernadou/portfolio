import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

// Toute adresse /admin/... inconnue affiche la page « Introuvable » de l'administration,
// avec la barre latérale, plutôt que la 404 du site public.
export default async function AdminIntrouvable() {
  await requireAdmin();
  notFound();
}
