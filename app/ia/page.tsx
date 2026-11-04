import { IaView } from "@/components/proto/IaView";
import { pageMetadata } from "@/lib/metadata";
import { getIa, getSiteProjects } from "@/lib/data";
import { iaStats } from "@/lib/data-shared";

export const metadata = pageMetadata(
  "Ma façon de travailler avec l’IA",
  "Comment Clara Bernadou travaille avec l’IA au quotidien : outils, skills créés et routines.",
  "/ia",
);

export default async function IaPage() {
  const [ia, projets] = await Promise.all([getIa(), getSiteProjects()]);
  // Projets publiés : les cartes de « Ce que ça a produit » ne sont des liens que vers eux.
  return <IaView v={{ stats: iaStats(ia), tools: ia.tools, skills: ia.skills, routines: ia.routines, publics: projets.map((p) => p.id) }} />;
}
