"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession, requireAdmin } from "@/lib/auth";
import { getSyncSettings, setSyncSettings, syncGithub, type SyncReport, type SyncSettings } from "@/lib/admin/sync";

const refresh = () => revalidatePath("/", "layout");

export async function runGithubSync(importIds?: number[]): Promise<SyncReport> {
  await requireAdmin();
  try {
    const r = await syncGithub({ importIds });
    refresh();
    return r;
  } catch (e) {
    return { created: [], updated: [], skipped: [], error: e instanceof Error ? e.message : "GitHub n’a pas répondu." };
  }
}

// Passage automatique à l'ouverture du tableau de bord : au plus une fois par minute.
export async function syncGithubSiAncienne(): Promise<number> {
  if (!(await isAdminSession())) return 0;
  const s = await getSyncSettings();
  if (s.github.lastRun && Date.now() - new Date(s.github.lastRun).getTime() < 60_000) return 0;
  try {
    const r = await syncGithub();
    if (r.created.length || r.updated.length) refresh();
    return r.created.length;
  } catch {
    return 0;
  }
}

export async function saveSyncSettings(patch: { github?: Partial<SyncSettings["github"]> }) {
  await requireAdmin();
  const s = await getSyncSettings();
  await setSyncSettings({ ...s, github: { ...s.github, ...patch.github } });
  revalidatePath("/admin/synchronisation");
}
