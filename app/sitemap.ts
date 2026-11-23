import type { MetadataRoute } from "next";
import { getIaPubliee, getSiteProjects } from "@/lib/data";
import { datesDuSite } from "@/lib/lastmod";
import { siteUrl } from "@/lib/site-url";

// Pages publiques et fiches publiées, avec la date réelle de leur dernière modification (lib/lastmod.ts).
// /projets n'y figure que s'il liste au moins un projet (sinon la page est en noindex).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projets, dates, iaPubliee] = await Promise.all([getSiteProjects(), datesDuSite(), getIaPubliee()]);
  const pages: [string, Date][] = [
    ["/", dates.accueil],
    ...(projets.length ? [["/projets", dates.liste] as [string, Date]] : []),
    ["/cv", dates.cv],
    ...(iaPubliee ? [["/ia", dates.ia] as [string, Date]] : []),
    ["/mentions-legales", dates.mentions],
    ["/accessibilite", dates.accessibilite],
    ["/plan-du-site", dates.plan],
  ];
  return [
    ...pages.map(([route, lastModified]) => ({ url: `${siteUrl}${route}`, lastModified })),
    ...projets.map((p) => ({ url: `${siteUrl}/projets/${p.id}`, lastModified: dates.projets.get(p.id) ?? dates.liste })),
  ];
}
