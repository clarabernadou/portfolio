// Données des CV en PDF, assemblées à partir du site (étape 10) : CV en
// français (version anglaise retirée le 24 oct. 2026). Pur, sans accès à la base.
import type { CvDoc, Lien } from "./cv-html";
import { ligneFormation, type SiteExperience, type SiteFormation, type SiteProfile } from "@/lib/data-shared";
import { siteUrl } from "@/lib/site-url";

export interface CvSources {
  profil: SiteProfile;
  skills: { name: string; items: string[] }[];
  experiences: SiteExperience[];
  formations: SiteFormation[];
}

const H_FR: CvDoc["h"] = { skills: "Compétences", langs: "Langues", exp: "Expériences professionnelles", edu: "Formations", projets: "Projets" };

// Formations du CV (retours des relecteurs, 4 nov. 2026) : le Bac+5 et la formation en cours en détail,
// les titres antérieurs regroupés en une entrée, sans nombre de projets (il reste sur le site).
const enDetail = (f: SiteFormation) => f.statut === "En cours" || f.diplome === "Bac+5";
const sansCompte = (f: SiteFormation) => ({ ...f, projets: /^\d+ projets?$/.test(f.projets.trim()) ? "" : f.projets });
const annees = (fs: SiteFormation[]) => {
  const a = fs.flatMap((f) => f.annees.match(/\d{4}/g) ?? []).sort();
  return a.length ? `${a[0]} – ${a[a.length - 1]}` : "";
};
function formationsCv(formations: SiteFormation[]): CvDoc["edu"] {
  const anterieures = formations.filter((f) => !enDetail(f));
  return [
    ...formations.filter(enDetail).map((f) => ({
      d: f.annees,
      t: f.intitule,
      url: f.url || undefined,
      tags: [statut(f), ...(f.mode === "En alternance" ? [{ text: f.mode, kind: "info" as const }] : [])],
      mt: ligneFormation(sansCompte(f)),
      note: f.mentionComplementaire,
    })),
    ...(anterieures.length
      ? [
          {
            d: annees(anterieures),
            t: "Formations antérieures",
            tags: anterieures.every((f) => f.statut === "Obtenu") ? [{ text: "Obtenu", kind: "ok" as const }] : [],
            mt: "OpenClassrooms",
            lignes: anterieures.map((f) => `${f.intitule} : ${f.niveauComplet.replace(/^OpenClassrooms · /, "").replace(/^Titre/, "titre")}, ${f.annees}`),
          },
        ]
      : []),
  ];
}

const telHref = (t: string) => "tel:" + t.replace(/ /g, "").replace(/^0/, "+33");
const co = (e: SiteExperience): Lien[] => [
  { text: e.entreprise, href: e.entrepriseHref },
  ...(e.entrepriseParent ? [{ text: " by " }, { text: e.entrepriseParent, href: e.entrepriseParentHref }] : []),
];
const statut = (f: SiteFormation) => ({ text: f.statut, kind: (f.statut === "En cours" ? "cours" : "ok") as "ok" | "cours" });

function contact(p: SiteProfile) {
  return { email: p.email, telephone: telHref(p.telephone), telephoneAffiche: p.telephone, linkedin: p.linkedin, github: p.github, site: siteUrl };
}

// CV essentiel en français : le contenu du site, version essentielle.
export function essentielFr(s: CvSources): CvDoc {
  const p = s.profil;
  return {
    lang: "fr",
    title: `${p.nom} · CV`,
    nom: p.nom,
    role: p.intitule,
    pills: [[p.contrat, p.disponibilite].filter(Boolean).join(" · "), p.lieu, p.mobilite].filter(Boolean),
    contact: contact(p),
    profile: p.profilEssentiel,
    h: H_FR,
    skills: s.skills,
    langs: p.langues,
    exp: s.experiences.map((e) => ({
      d: e.periode,
      r: e.poste,
      co: co(e),
      mt: e.lieuMode,
      desc: e.contexteEssentiel,
      blocks: e.blocs.map((b) => ({ name: b.name, period: b.period, bullets: b.bulletsEssentiel })).filter((b) => b.bullets.length),
      nt: e.note,
    })),
    projets: (p.projetsCv ?? []).map((pj) => ({ titre: pj.titre, href: pj.lien || undefined, d: pj.periode, bullets: pj.puces })),
    edu: formationsCv(s.formations),
  };
}
