import { syncGithub } from "@/lib/admin/sync";

// Synchronisation quotidienne de secours (§6.1), déclenchée par Vercel Cron (vercel.json).
// Vercel envoie « Authorization: Bearer <CRON_SECRET> » : tout autre appel est refusé.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response(null, { status: 401 });
  const r = await syncGithub();
  return Response.json({ created: r.created.length, updated: r.updated.length, skipped: r.skipped.length });
}
