import { db } from "@/lib/db";
import { dateAudit } from "@/lib/accessibilite";

// Dates de dernière modification du plan du site (sitemap.xml), au lieu de la date du jour pour
// toutes les pages (13 nov. 2026) : chaque page prend la mise à jour la plus récente de ce qu'elle affiche.
// Pages écrites dans le code : date de leur dernière modification, à changer avec leur texte.
export const MAJ_MENTIONS = new Date("2026-11-15T12:00:00Z");

const max = (...d: (Date | null | undefined)[]) => new Date(Math.max(...d.filter((x): x is Date => !!x).map((x) => x.getTime())));

export async function datesDuSite() {
  const audit = new Date(`${dateAudit}T12:00:00Z`);
  if (!process.env.DATABASE_URL) return { projets: new Map<string, Date>(), accueil: audit, liste: audit, cv: audit, ia: audit, mentions: MAJ_MENTIONS, accessibilite: audit, plan: audit };
  const d = db();
  const [projets, singletons, exp, form, reco] = await Promise.all([
    d.project.findMany({ where: { status: "published", visible: true, deletedAt: null }, select: { id: true, updatedAt: true } }),
    d.singleton.findMany({ select: { key: true, updatedAt: true } }),
    d.experience.aggregate({ _max: { updatedAt: true } }),
    d.formation.aggregate({ _max: { updatedAt: true } }),
    d.recommendation.aggregate({ _max: { updatedAt: true } }),
  ]);
  const s = (k: string) => singletons.find((x) => x.key === k)?.updatedAt;
  const liste = max(...projets.map((p) => p.updatedAt));
  const cv = max(s("profil"), exp._max.updatedAt, form._max.updatedAt, reco._max.updatedAt);
  const accueil = max(cv, liste);
  return {
    projets: new Map(projets.map((p) => [p.id, p.updatedAt])),
    accueil,
    liste,
    cv,
    ia: max(s("ia")),
    mentions: MAJ_MENTIONS,
    accessibilite: audit,
    plan: max(accueil, s("ia"), audit, MAJ_MENTIONS),
  };
}
