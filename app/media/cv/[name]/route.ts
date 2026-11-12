import { db } from "@/lib/db";
import { isAdminSession } from "@/lib/auth";
import { ANCIENS_CV, CV_PUBLIC, FICHIERS_PUBLICS } from "@/lib/pdf/fichiers";

// PDF du CV. Le CV public est celui que Clara envoie depuis l'administration (gardé en base),
// sinon le fichier d'origine du site (public/). Les anciennes adresses redirigent vers lui.
export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[\w.-]+\.pdf$/.test(name)) return new Response(null, { status: 404 });
  if (ANCIENS_CV.includes(name)) return Response.redirect(new URL(`/media/cv/${CV_PUBLIC}`, req.url), 308);
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
