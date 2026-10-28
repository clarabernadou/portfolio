import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPhotoUrl, getProfile } from "@/lib/data";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { PhotoCard } from "@/components/admin/PhotoCard";
import { RecoList } from "@/components/admin/RecoList";
import { PdfCard } from "@/components/admin/PdfCard";

export const metadata: Metadata = { title: "Profil et CV" };
export const dynamic = "force-dynamic";


// Maquette : docs/passation/maquettes/admin/Admin-profil-cv.jpg.
export default async function Profil() {
  await requireAdmin();
  const prisma = db();
  const [profil, photoUrl, recos, fichiers] = await Promise.all([
    getProfile(),
    getPhotoUrl(),
    prisma.recommendation.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] }),
    prisma.generatedFile.findMany({ select: { name: true, generatedAt: true } }),
  ]);
  const fichier = (name: string) => ({
    name,
    generatedAt: fichiers.find((f) => f.name === name)?.generatedAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" }) ?? null,
  });
  const essentiel = fichier("CV_Clara_Bernadou_FR.pdf");
  return (
    <>
      <div>
        <h1 className="adm-h1">Profil et CV</h1>
        <p className="adm-sub">Ce qui s’affiche en haut du CV, dans le pied de page et sur l’accueil.</p>
      </div>
      <div className="adm-edit" style={{ gridTemplateColumns: "minmax(0, 1fr) 420px" }}>
        <ProfileForm initial={profil} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <PhotoCard url={photoUrl} alt={profil.photoAlt} custom={photoUrl.startsWith("/media/")} />
          <PdfCard essentiel={essentiel} />
          <RecoList
            items={recos.map((r) => ({
              id: r.id,
              auteur: r.auteur,
              initiales: r.initiales,
              linkedin: r.linkedin ?? "",
              poste: r.poste,
              relation: r.relation,
              citationCourte: r.citationCourte,
              texteIntegral: (r.texteIntegral as string[]).join("\n\n"),
              lettrePdf: r.lettrePdf ?? "",
              entrepriseHref: r.entrepriseHref ?? "",
              lienTexte: r.lienTexte ?? "",
              voirLinkedin: r.voirLinkedin,
              status: r.status === "draft" ? "draft" : "published",
            }))}
          />
        </div>
      </div>
    </>
  );
}
