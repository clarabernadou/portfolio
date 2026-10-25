import { db } from "@/lib/db";
import { isAdminSession } from "@/lib/auth";
import { FICHIERS_PUBLICS } from "@/lib/pdf/server";

// PDF du CV. Les CV essentiels (publics) sont servis depuis la base s'ils ont été
// régénérés dans l'administration, sinon depuis le fichier d'origine du site.
// Les CV orientés ne sont pas publics (§5 bis) : réservés à la session de Clara.
export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[\w.-]+\.pdf$/.test(name)) return new Response(null, { status: 404 });
  const public_ = FICHIERS_PUBLICS.includes(name);
  if (!public_ && !(await isAdminSession())) return new Response(null, { status: 404 });
  const f = process.env.DATABASE_URL ? await db().generatedFile.findUnique({ where: { name } }) : null;
  if (!f?.data) return public_ ? Response.redirect(new URL(`/${name}`, req.url), 307) : new Response(null, { status: 404 });
  return new Response(new Uint8Array(f.data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${name}"`,
      "Cache-Control": public_ ? "public, max-age=0, must-revalidate" : "private, no-store",
    },
  });
}
