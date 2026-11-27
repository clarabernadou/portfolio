import type { Metadata } from "next";
import { DEBUT_EXPERIENCE, dureeDepuis, enBref, profilPublic } from "@/lib/data-shared";
import { Accueil } from "@/components/proto/Accueil";
import { getExperiences, getFormations, getFormationsCourtes, getIaPubliee, getPhotoUrl, getProfile, getRecommendations, getProjetsHorsFormation, getSiteProjects, getSkills, homeProjects } from "@/lib/data";
import { JsonLd, personneJsonLd, siteJsonLd } from "@/lib/seo";

// Titre et description de l'accueil : la page qui doit sortir sur une recherche du nom de Clara.
const titre = "Clara Bernadou · Développeuse full stack · Portfolio";
// Le nombre de projets vient de la base (projets publiés, comme « En bref ») : aucun compteur écrit en dur.
export async function generateMetadata(): Promise<Metadata> {
  const n = (await getSiteProjects()).length;
  const description = `Portfolio de Clara Bernadou, développeuse full stack (React, TypeScript, Node.js), en alternance depuis 2023. ${n > 0 ? `${n} projets` : "Projets"} de développement web et de design. CDI recherché, disponible en mars 2027, en full remote ou à Vannes / Auray.`;
  return {
    title: { absolute: titre },
    description,
    alternates: { canonical: "/" },
    openGraph: { title: titre, description, url: "/" },
    twitter: { card: "summary_large_image", title: titre, description },
  };
}

// Durée d'expérience calculée à chaque rendu (27 nov. 2026) : la page est régénérée au plus toutes les heures, en plus
// des régénérations après un enregistrement dans l'administration.
export const revalidate = 3600;

export default async function Home() {
  const [projects, experiences, formations, profil, recos, skills, photoUrl, courtes, horsFormation, iaPubliee] = await Promise.all([getSiteProjects(), getExperiences(), getFormations(), getProfile(), getRecommendations(), getSkills(), getPhotoUrl(), getFormationsCourtes(), getProjetsHorsFormation(), getIaPubliee()]);
  const publique = profilPublic(profil);
  return (
    <>
      <JsonLd data={[personneJsonLd(publique, skills.essentiel.flatMap((g) => g.items), photoUrl), siteJsonLd()]} />
      <Accueil home={homeProjects(projects)} total={projects.length} bref={enBref(formations, projects, horsFormation)} experiences={experiences} duree={dureeDepuis(DEBUT_EXPERIENCE)} formations={formations} courtes={courtes} profil={publique} recos={recos} iaPubliee={iaPubliee} />
    </>
  );
}
