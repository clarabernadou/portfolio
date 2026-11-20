import { profilPublic } from "@/lib/data-shared";
import { Cv } from "@/components/proto/Cv";
import { pageMetadata } from "@/lib/metadata";
import { getExperiences, getFormations, getPhotoUrl, getProfile, getSiteProjects, getSkills } from "@/lib/data";

export const metadata = pageMetadata(
  "CV · Développeuse full stack",
  "CV de Clara Bernadou, développeuse full stack (React, TypeScript, Node.js) : expériences en alternance, formations et compétences. CDI recherché, disponible en mars 2027.",
  "/cv",
);

export default async function CvPage() {
  const [experiences, formations, skills, profil, photoUrl, projets] = await Promise.all([getExperiences(), getFormations(), getSkills(), getProfile(), getPhotoUrl(), getSiteProjects()]);
  // Projet personnel du CV relié à sa fiche (20 nov. 2026) : le projet publié du même nom ; jamais un lien
  // vers un projet non publié (CLAUDE.md). Un lien saisi à la main reste prioritaire.
  const pub = profilPublic(profil);
  const projetsCv = pub.projetsCv?.map((pj) => ({ ...pj, lien: pj.lien || (projets.find((p) => p.name === pj.titre) ? `/projets/${projets.find((p) => p.name === pj.titre)!.id}` : undefined) }));
  return <Cv experiences={experiences} formations={formations} skills={skills.essentiel} profil={{ ...pub, projetsCv }} photoUrl={photoUrl} />;
}
