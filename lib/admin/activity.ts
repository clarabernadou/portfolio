import { db } from "@/lib/db";

// Journal de l'activité (tableau de bord « Activité récente ») : table SyncLog,
// source « admin » pour les modifications faites dans l'administration.
export async function logActivity(entity: string, entityId: string, message: string, action = "updated") {
  await db().syncLog.create({ data: { source: "admin", entity, entityId, action, state: "Publiée", message } });
}

export function ilYa(date: Date, now = new Date()): string {
  const s = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));
  if (s < 60) return "à l’instant";
  const m = Math.round(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  if (j === 1) return "hier";
  if (j < 30) return `il y a ${j} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function depuis(date: Date, now = new Date()): string {
  const h = Math.round((now.getTime() - date.getTime()) / 3_600_000);
  if (h < 1) return "< 1 h";
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} j`;
}
