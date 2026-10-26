import { ProjetsListe } from "@/components/proto/Projets";
import { getCategories, getFeaturedOrder, getSiteProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Projets de développement web et de design UX/UI",
  "Les 40 projets de Clara Bernadou : développement, UX/UI et conception, avec leurs livrables.",
  "/projets",
);

export default async function ProjetsPage() {
  const [projects, featuredOrder, categories] = await Promise.all([getSiteProjects(), getFeaturedOrder(), getCategories()]);
  return <ProjetsListe projects={projects} featuredOrder={featuredOrder} categories={categories} />;
}
