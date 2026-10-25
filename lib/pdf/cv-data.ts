// Données des CV en PDF, assemblées à partir du site (étape 10) : CV essentiel
// et CV orientés d'une page, en français (version anglaise retirée le 24 oct. 2026). Pur : utilisable côté serveur
// et dans l'aperçu de l'administration.
import type { CvDoc, Lien } from "./cv-html";
import type { SiteExperience, SiteFormation, SiteProfile } from "@/lib/data-shared";

export interface CvSources {
  profil: SiteProfile;
  skills: { name: string; items: string[] }[];
  experiences: SiteExperience[];
  formations: SiteFormation[];
  projets: { id: string; name: string; parcours: string; line: string; homeCard?: { eyebrow: string; line: string } }[];
}

export interface OrientationState {
  id: string;
  name: string;
  title: string;
  profile: string;
  skillOrder: { category: string; visible: boolean }[];
  featuredProjects: string[];
  firstFormation: string;
  fileName: string;
  bullets: string[];
}

const H_FR: CvDoc["h"] = { skills: "Compétences", langs: "Langues", exp: "Expériences professionnelles", edu: "Formations", projets: "Projets phares" };

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

// CV orienté d'une page (§5 bis) : intitulé, profil, ordre des compétences, projets
// phares, puces cochées et formation mise en premier selon l'orientation.
export function oriente(s: CvSources, o: OrientationState): CvDoc {
  const base = essentielFr(s);

  const groupes = o.skillOrder
    .filter((g) => g.visible)
    .map((g) => base.skills.find((x) => x.name === g.category))
    .filter((g): g is { name: string; items: string[] } => !!g);

  const projets = o.featuredProjects.slice(0, 3).map((id) => {
    const p = s.projets.find((x) => x.id === id);
    return { name: p?.name ?? id, kicker: p?.homeCard?.eyebrow ?? p?.parcours ?? "", line: p?.homeCard?.line ?? p?.line ?? "" };
  });

  // Seules les puces cochées sont gardées.
  const exp = base.exp.map((e) => ({
    ...e,
    blocks: e.blocks.map((b) => ({ name: b.name, period: undefined, bullets: b.bullets.filter((t) => o.bullets.includes(t)) })),
  }));

  const ordre = [...base.edu.keys()].sort((a, b) => Number(base.edu[b].t === o.firstFormation) - Number(base.edu[a].t === o.firstFormation));
  const edu = ordre.map((i) => ({ ...base.edu[i], tags: base.edu[i].tags.slice(0, 1) }));

  return { ...base, role: o.title, profile: o.profile, skills: groupes, projets, exp, edu };
}

export const nomFichier = (o: Pick<OrientationState, "fileName">) => o.fileName;
