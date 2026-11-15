import { getSiteProjects } from "@/lib/data";
import { OG_TAILLE, OG_TYPE, ogAlt, ogImage } from "@/lib/og";

// Image de partage d'une fiche projet : son nom et son type (lib/og.tsx). Seuls les projets publiés en ont une.
export async function generateImageMetadata({ params }: { params: { id: string } }) {
  const p = (await getSiteProjects()).find((x) => x.id === params.id);
  return p ? [{ id: "apercu", alt: ogAlt(p.name, p.type), size: OG_TAILLE, contentType: OG_TYPE }] : [];
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = (await getSiteProjects()).find((x) => x.id === id);
  return ogImage(p?.name ?? "Projet", p?.type ?? "Portfolio de Clara Bernadou");
}
