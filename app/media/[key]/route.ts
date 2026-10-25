import { db } from "@/lib/db";

// Fichiers envoyés depuis l'administration (photo du profil), gardés en base.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!process.env.DATABASE_URL || !/^[a-z0-9-]+$/.test(key)) return new Response(null, { status: 404 });
  const a = await db().asset.findUnique({ where: { key } });
  if (!a) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(a.data), {
    headers: {
      "Content-Type": a.mime,
      // L'adresse change à chaque nouvel envoi (?v=…) : le fichier peut être gardé longtemps.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
