import type { MetadataRoute } from "next";
import { getSiteProjects } from "@/lib/data";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/", "/projets", "/cv", "/ia", "/mentions-legales"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const projectRoutes = (await getSiteProjects()).map((project) => ({
    url: `${siteUrl}/projets/${project.id}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...projectRoutes];
}
