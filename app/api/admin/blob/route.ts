import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { adminApiGuard } from "@/lib/auth";
import { MIME_LIVRABLES } from "@/lib/livrables";

// Envoi direct, du navigateur vers Vercel Blob, des livrables (PDF, images, documents…) et de leurs aperçus
// (choix de Clara, étape 10). Ce point d'entrée ne fait que délivrer un jeton
// d'envoi de courte durée, et seulement à la session de Clara.
export async function POST(request: Request) {
  const refus = await adminApiGuard(request);
  if (refus) return refus;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: "Vercel Blob n’est pas encore activé (BLOB_READ_WRITE_TOKEN manquant)." }, { status: 503 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const r = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!/^livrables\/[\w-]+\/[\w.-]+$/.test(pathname)) throw new Error("Chemin de fichier refusé.");
        return {
          // Tous les formats de livrables courants (lib/livrables.ts) ; ni HTML, ni SVG, ni script.
          allowedContentTypes: MIME_LIVRABLES,
          maximumSizeInBytes: 50 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(r);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Envoi refusé." }, { status: 400 });
  }
}
