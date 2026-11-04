import { profilPublic } from "@/lib/data-shared";
import { Cv } from "@/components/proto/Cv";
import { pageMetadata } from "@/lib/metadata";
import { getExperiences, getFormations, getPhotoUrl, getProfile, getSkills } from "@/lib/data";

export const metadata = pageMetadata(
  "CV · Développeuse full-stack",
  "CV de Clara Bernadou, développeuse full-stack (React, TypeScript, Node.js) : expériences en alternance, formations et compétences. CDI recherché, disponible en mars 2027.",
  "/cv",
);

export default async function CvPage() {
  const [experiences, formations, skills, profil, photoUrl] = await Promise.all([getExperiences(), getFormations(), getSkills(), getProfile(), getPhotoUrl()]);
  return <Cv experiences={experiences} formations={formations} skills={skills.essentiel} profil={profilPublic(profil)} photoUrl={photoUrl} />;
}
