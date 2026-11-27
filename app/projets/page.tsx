import { ProjetsListe } from "@/components/proto/Projets";
import { getCategories, getSiteProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

// Le nombre de projets vient de la base : aucun compteur écrit en dur.
export async function generateMetadata() {
  const n = (await getSiteProjects()).length;
  const meta = pageMetadata(
    "Projets web et UX/UI",
    `Les ${n > 0 ? `${n} ` : ""}projets de Clara Bernadou : développement, UX/UI et conception, avec leurs livrables.`,
    "/projets",
  );
  // Liste vide (aucun projet publié) : la page n'est pas indexée, ni dans le plan du site (app/sitemap.ts).
  return n > 0 ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function ProjetsPage() {
  const [projects, categories] = await Promise.all([getSiteProjects(), getCategories()]);
  return <ProjetsListe projects={projects} categories={categories} />;
}
