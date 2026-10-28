import { ProjetsListe } from "@/components/proto/Projets";
import { getCategories, getFeaturedOrder, getSiteProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

// Le nombre de projets vient de la base : aucun compteur écrit en dur.
export async function generateMetadata() {
  const n = (await getSiteProjects()).length;
  return pageMetadata(
    "Projets de développement web et de design UX/UI",
    `Les ${n > 0 ? `${n} ` : ""}projets de Clara Bernadou : développement, UX/UI et conception, avec leurs livrables.`,
    "/projets",
  );
}

export default async function ProjetsPage() {
  const [projects, featuredOrder, categories] = await Promise.all([getSiteProjects(), getFeaturedOrder(), getCategories()]);
  return <ProjetsListe projects={projects} featuredOrder={featuredOrder} categories={categories} />;
}
