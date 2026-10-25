import { experiencePublique, formationPublique, profilPublic } from "@/lib/data-shared";
import { Accueil } from "@/components/proto/Accueil";
import { getExperiences, getFormations, getProfile, getRecommendations, getSiteProjects, homeProjects } from "@/lib/data";

export default async function Home() {
  const [projects, experiences, formations, profil, recos] = await Promise.all([getSiteProjects(), getExperiences(), getFormations(), getProfile(), getRecommendations()]);
  return <Accueil home={homeProjects(projects)} experiences={experiences.map(experiencePublique)} formations={formations.map(formationPublique)} profil={profilPublic(profil)} recos={recos} />;
}
