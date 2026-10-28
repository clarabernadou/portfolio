// Données des CV en PDF, assemblées à partir du site (étape 10) : CV en
// français (version anglaise retirée le 24 oct. 2026). Pur, sans accès à la base.
import type { CvDoc, Lien } from "./cv-html";
import type { SiteExperience, SiteFormation, SiteProfile } from "@/lib/data-shared";

export interface CvSources {
  profil: SiteProfile;
  skills: { name: string; items: string[] }[];
  experiences: SiteExperience[];
  formations: SiteFormation[];
}

const H_FR: CvDoc["h"] = { skills: "Compétences", langs: "Langues", exp: "Expériences professionnelles", edu: "Formations" };

const telHref = (t: string) => "tel:" + t.replace(/ /g, "").replace(/^0/, "+33");
const co = (e: SiteExperience): Lien[] => [
  { text: e.entreprise, href: e.entrepriseHref },
  ...(e.entrepriseParent ? [{ text: " by " }, { text: e.entrepriseParent, href: e.entrepriseParentHref }] : []),
];
const statut = (f: SiteFormation) => ({ text: f.statut, kind: (f.statut === "En cours" ? "cours" : "ok") as "ok" | "cours" });

function contact(p: SiteProfile) {
  return { email: p.email, telephone: telHref(p.telephone), telephoneAffiche: p.telephone, linkedin: p.linkedin, github: p.github };
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
    itw: p.entretiens,
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
    edu: s.formations.map((f) => ({
      d: f.annees,
      t: f.intitule,
      url: f.url || undefined,
      tags: [statut(f), ...(f.mode === "En alternance" ? [{ text: f.mode, kind: "info" as const }] : [])],
      mt: `${f.niveauComplet} · ${f.projets}`,
      note: f.mentionComplementaire,
    })),
  };
}
