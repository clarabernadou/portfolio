import type { Metadata } from "next";
import { dureeAlternance, enBref, profilPublic } from "@/lib/data-shared";
import { Accueil } from "@/components/proto/Accueil";
import { getExperiences, getFormations, getPhotoUrl, getProfile, getRecommendations, getSiteProjects, getSkills, homeProjects } from "@/lib/data";
import { JsonLd, personneJsonLd, siteJsonLd } from "@/lib/seo";
import { IMAGE_PARTAGE } from "@/lib/metadata";

// Titre et description de l'accueil : la page qui doit sortir sur une recherche du nom de Clara.
const titre = "Clara Bernadou · Développeuse full-stack · Portfolio";
// Le nombre de projets vient de la base (projets publiés, comme « En bref ») : aucun compteur écrit en dur.
export async function generateMetadata(): Promise<Metadata> {
  const n = (await getSiteProjects()).length;
  const description = `Portfolio de Clara Bernadou, développeuse full-stack (React, TypeScript, Node.js), en alternance depuis 2023. ${n > 0 ? `${n} projets` : "Projets"} de développement web et de design. CDI recherché, disponible en mars 2027, en full remote ou à Vannes / Auray.`;
  return {
    title: { absolute: titre },
    description,
    alternates: { canonical: "/" },
    openGraph: { title: titre, description, url: "/", images: [IMAGE_PARTAGE] },
    twitter: { card: "summary_large_image", title: titre, description, images: [IMAGE_PARTAGE.url] },
  };
}

export default async function Home() {
  const [projects, experiences, formations, profil, recos, skills, photoUrl] = await Promise.all([getSiteProjects(), getExperiences(), getFormations(), getProfile(), getRecommendations(), getSkills(), getPhotoUrl()]);
  const publique = profilPublic(profil);
  return (
    <>
      <JsonLd data={[personneJsonLd(publique, skills.essentiel.flatMap((g) => g.items), photoUrl), siteJsonLd()]} />
      <Accueil home={homeProjects(projects)} total={projects.length} bref={enBref(formations, projects)} experiences={experiences} duree={dureeAlternance(experiences)} formations={formations} profil={publique} recos={recos} />
    </>
  );
}
