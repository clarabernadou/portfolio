import { experiencePublique, formationPublique, profilPublic } from "@/lib/data-shared";
import { Cv } from "@/components/proto/Cv";
import { pageMetadata } from "@/lib/metadata";
import { getExperiences, getFormations, getPhotoUrl, getProfile, getSkills } from "@/lib/data";

export const metadata = pageMetadata(
  "CV",
  "CV de Clara Bernadou, développeuse front-end & UI/UX designer : expériences, formations et compétences.",
);

export default async function CvPage() {
  const [experiences, formations, skills, profil, photoUrl] = await Promise.all([getExperiences(), getFormations(), getSkills(), getProfile(), getPhotoUrl()]);
  return <Cv experiences={experiences.map(experiencePublique)} formations={formations.map(formationPublique)} skills={skills.essentiel} profil={profilPublic(profil)} photoUrl={photoUrl} />;
}
