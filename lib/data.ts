import projectsData from "@/data/projects.json";
import cartesAccueil from "@/data/accueil-cartes.json";
import type { Experience, Formation, IaContent, Project } from "./types";
import type { AlternanceCard, HomeCard, SiteExperience, SiteFormation, SiteProfile, SiteProject, SiteReco } from "./data-shared";
import { experiences as experiencesJson } from "./content/experiences";
import { formations as formationsJson } from "./content/formations";
import { alternances } from "./content/accueil";
import { competencesEssentiel, identite, langues, profilCv } from "./content/profile";
import liensJson from "@/data/liens.json";
import iaJson from "@/data/ia.json";
import { siteContact } from "./site-data";
import { estFormation } from "./admin/projects";
import { recommendations as recosJson } from "./content/recommendations";

export type { HomeCard, SiteExperience, SiteFormation, SiteProfile, SiteProject, SiteReco } from "./data-shared";
export { sortFeatured, homeProjects } from "./data-shared";

// Étape 9 : le site lit ses contenus dans la base (modifiables dans l'administration).
// Sans DATABASE_URL (prévisualisation, tests), il lit les fichiers JSON d'origine :
// le rendu est identique, seules les modifications faites en administration manquent.
// Après chaque écriture, l'administration appelle revalidatePath("/", "layout").

// Ordre du bandeau « Projets phares » (maquettes/site-mobile/projets.jpg).
const FEATURED_ORDER_DEFAUT = ["portfolio", "watchedthis", "intuitlearn"];

const hasDb = () => Boolean(process.env.DATABASE_URL);

// Pendant « next build », les pages statiques (dont les 39 fiches projet) sont générées en
// parallèle : chaque lecture n'y est faite qu'une fois, puis réutilisée, pour ne pas épuiser
// les connexions de la base. Hors build, chaque appel relit la base (données à jour).
const PENDANT_LE_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const memo = new Map<string, Promise<unknown>>();
function uneFoisAuBuild<T>(cle: string, lire: () => Promise<T>): () => Promise<T> {
  return () => {
    if (!PENDANT_LE_BUILD) return lire();
    if (!memo.has(cle)) memo.set(cle, lire());
    return memo.get(cle) as Promise<T>;
  };
}


async function prisma() {
  const { db } = await import("./db");
  return db();
}

function fromJson(): SiteProject[] {
  return (projectsData as Project[]).map((p) => {
    const i = cartesAccueil.findIndex((c) => c.id === p.id);
    if (i < 0) return p;
    const { section, eyebrow, line, tags } = cartesAccueil[i];
    return { ...p, homeCard: { section, eyebrow, line, tags, order: i } };
  });
}

type ProjectRow = Awaited<ReturnType<Awaited<ReturnType<typeof prisma>>["project"]["findMany"]>>[number];

function fromRow(r: ProjectRow): SiteProject {
  return {
    id: r.id,
    name: r.name,
    date: r.date,
    type: r.type,
    types: r.types as Project["types"],
    parcours: r.parcours,
    line: r.line,
    tags: r.tags as string[],
    pdf: r.pdf,
    docs: r.docs as unknown as Project["docs"],
    steps: r.steps as unknown as Project["steps"],
    github: r.github,
    figma: r.figma,
    site: r.site,
    context: r.context,
    skillsValidated: r.skillsValidated as string[],
    onHome: r.onHome,
    featured: r.featured,
    ...(r.videos ? { videos: r.videos as unknown as Project["videos"] } : {}),
    ...(r.captures ? { captures: r.captures as unknown as Project["captures"] } : {}),
    ...(r.homeCard ? { homeCard: r.homeCard as unknown as HomeCard } : {}),
  };
}

// Projets visibles sur le site : publiés, visibles, non supprimés, dans l'ordre de la liste.
async function getSiteProjectsSource(): Promise<SiteProject[]> {
  if (!hasDb()) return fromJson();
  const rows = await (await prisma()).project.findMany({
    where: { deletedAt: null, visible: true, status: "published" },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(fromRow);
}

// Aperçu d'un projet pour l'administration, quel que soit son statut (brouillon, privé ou publié).
// Jamais appelé par une page publique : seulement par /apercu, réservé à la session de Clara.
export async function getProjetApercu(id: string): Promise<SiteProject | null> {
  if (!hasDb()) return fromJson().find((p) => p.id === id) ?? null;
  const row = await (await prisma()).project.findFirst({ where: { id, deletedAt: null } });
  return row ? fromRow(row) : null;
}

// « En bref » de l'accueil (choix de Clara, 30 oct. 2026) : tous les projets, publiés ou non.
// Ici, les projets hors formation (entreprise, perso, audit) ; les projets de formation se
// comptent avec le nombre indiqué sur chaque fiche de formation.
async function getCompteProjetsSource(): Promise<{ horsFormation: number }> {
  const rows = hasDb() ? await (await prisma()).project.findMany({ where: { deletedAt: null }, select: { parcours: true } }) : fromJson();
  return { horsFormation: rows.filter((p) => !estFormation(p)).length };
}

async function getFeaturedOrderSource(): Promise<string[]> {
  if (!hasDb()) return FEATURED_ORDER_DEFAUT;
  const row = await (await prisma()).singleton.findUnique({ where: { key: "phares" } });
  return ((row?.data as { ids?: string[] } | null)?.ids) ?? FEATURED_ORDER_DEFAUT;
}

// Expériences, de la plus récente à la plus ancienne (ordre du CV).
async function getExperiencesSource(): Promise<SiteExperience[]> {
  if (!hasDb()) {
    return experiencesJson.map((e) => {
      const i = alternances.findIndex((a) => a.entreprise === e.entreprise);
      return i < 0 ? e : { ...e, homeCard: { lieuMode: alternances[i].lieuMode, technologies: alternances[i].technologies, order: i } };
    });
  }
  const rows = await (await prisma()).experience.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  return rows.map((r) => ({
    poste: r.poste,
    entreprise: r.entreprise,
    entrepriseParent: r.entrepriseParent ?? undefined,
    entrepriseHref: r.entrepriseHref ?? undefined,
    entrepriseParentHref: r.entrepriseParentHref ?? undefined,
    periode: r.periode,
    lieuMode: r.lieuMode,
    contexteEssentiel: r.contexteEssentiel,
    blocs: (r.blocs as unknown as Experience["blocs"]).map((b) => ({ ...(b.name ? { name: b.name } : {}), ...(b.period ? { period: b.period } : {}), bulletsEssentiel: b.bulletsEssentiel ?? [] })),
    note: r.note ?? undefined,
    ...(r.homeCard ? { homeCard: r.homeCard as unknown as AlternanceCard } : {}),
  }));
}

// Formations, de la plus récente à la plus ancienne (ordre du CV).
async function getFormationsSource(): Promise<SiteFormation[]> {
  if (!hasDb()) return formationsJson;
  const rows = await (await prisma()).formation.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  return rows.map((r) => ({
    intitule: r.intitule,
    url: r.url ?? "",
    annees: r.annees,
    diplome: r.diplome,
    niveauComplet: r.niveauComplet,
    mode: r.mode as Formation["mode"],
    statut: r.statut as Formation["statut"],
    projets: r.projets,
    mentionComplementaire: r.mentionComplementaire ?? undefined,
    nomOfficiel: r.nomOfficiel ?? undefined,
  }));
}

// Compétences du CV : catégories et éléments dans l'ordre de l'administration.
async function getSkillsSource(): Promise<{ essentiel: { name: string; items: string[] }[] }> {
  if (!hasDb()) return { essentiel: competencesEssentiel.map((g) => ({ name: g.categorie, items: g.items })) };
  const rows = await (await prisma()).skillGroup.findMany({ where: { version: "essentiel" }, orderBy: [{ position: "asc" }, { id: "asc" }] });
  return { essentiel: rows.map((r) => ({ name: r.name, items: r.items as string[] })) };
}

// Listes des filtres de la page Projets (rubrique Catégories de l'administration).
async function getCategoriesSource(): Promise<{ types: string[]; cadres: string[] }> {
  if (!hasDb()) {
    return {
      types: ["Développement", "UX / UI", "Conception et gestion"],
      cadres: ["UX Design / Product Designer", "Full Stack Java & Angular", "Application JavaScript React", "Développeur Web", "En entreprise", "Projet personnel", "Audit indépendant"],
    };
  }
  const rows = await (await prisma()).category.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  return { types: rows.filter((r) => r.kind === "type").map((r) => r.name), cadres: rows.filter((r) => r.kind === "cadre").map((r) => r.name) };
}

// Profil d'origine (contenu/ et data/liens.json), aussi utilisé pour compléter un
// profil enregistré à l'import sous l'ancienne forme { identite, langues, profilCv }.
const [contratDefaut, ...dispoDefaut] = identite.disponibilite.split(" · ");
export const PROFIL_DEFAUT: SiteProfile = {
  nom: identite.nom,
  intitule: identite.intituleSite,
  accroche: identite.accroche,
  contrat: contratDefaut,
  disponibilite: dispoDefaut.join(" · "),
  entretiens: siteContact.disponibiliteEntretiens,
  lieu: identite.lieu,
  mobilite: identite.permis,
  email: liensJson.profil.email,
  // Téléphone : seulement en base (Profil et CV), pour le PDF ; jamais dans un fichier envoyé au navigateur.
  telephone: "",
  linkedin: liensJson.profil.linkedin,
  github: liensJson.profil.github,
  profilEssentiel: profilCv.profilCourt,
  langues,
  photoAlt: "Clara Bernadou",
};

async function getProfileSource(): Promise<SiteProfile> {
  if (!hasDb()) return PROFIL_DEFAUT;
  const row = await (await prisma()).singleton.findUnique({ where: { key: "profil" } });
  const data = (row?.data ?? {}) as Partial<SiteProfile>;
  return "nom" in data ? { ...PROFIL_DEFAUT, ...data } : PROFIL_DEFAUT;
}

// Recommandations publiées, dans l'ordre de l'administration.
async function getRecommendationsSource(): Promise<SiteReco[]> {
  if (!hasDb()) {
    return recosJson.map((r) => ({
      ...r,
      lienTexte: r.auteur === "Frédéric Lépy" ? "IntuitLearn" : undefined,
      voirLinkedin: r.auteur === "Frédéric Lépy",
    }));
  }
  const rows = await (await prisma()).recommendation.findMany({ where: { status: "published" }, orderBy: [{ position: "asc" }, { id: "asc" }] });
  return rows.map((r) => ({
    initiales: r.initiales,
    auteur: r.auteur,
    linkedin: r.linkedin,
    poste: r.poste,
    relation: r.relation,
    citationCourte: r.citationCourte,
    texteIntegral: r.texteIntegral as string[],
    lettrePdf: r.lettrePdf ?? undefined,
    entrepriseHref: r.entrepriseHref ?? undefined,
    lienTexte: r.lienTexte ?? undefined,
    voirLinkedin: r.voirLinkedin,
  }));
}

// Photo du profil : celle envoyée dans l'administration si elle existe, sinon la photo d'origine.
async function getPhotoUrlSource(): Promise<string> {
  if (!hasDb()) return "/photo-clara.jpg";
  const a = await (await prisma()).asset.findUnique({ where: { key: "photo" }, select: { updatedAt: true } });
  return a ? `/media/photo?v=${a.updatedAt.getTime()}` : "/photo-clara.jpg";
}

async function getIaSource(): Promise<IaContent> {
  if (!hasDb()) return iaJson as IaContent;
  const row = await (await prisma()).singleton.findUnique({ where: { key: "ia" } });
  return (row?.data as unknown as IaContent) ?? (iaJson as IaContent);
}

export const getSiteProjects = uneFoisAuBuild("getSiteProjects", getSiteProjectsSource);
export const getFeaturedOrder = uneFoisAuBuild("getFeaturedOrder", getFeaturedOrderSource);
export const getCompteProjets = uneFoisAuBuild("getCompteProjets", getCompteProjetsSource);
export const getExperiences = uneFoisAuBuild("getExperiences", getExperiencesSource);
export const getFormations = uneFoisAuBuild("getFormations", getFormationsSource);
export const getSkills = uneFoisAuBuild("getSkills", getSkillsSource);
export const getCategories = uneFoisAuBuild("getCategories", getCategoriesSource);
export const getProfile = uneFoisAuBuild("getProfile", getProfileSource);
export const getRecommendations = uneFoisAuBuild("getRecommendations", getRecommendationsSource);
export const getPhotoUrl = uneFoisAuBuild("getPhotoUrl", getPhotoUrlSource);
export const getIa = uneFoisAuBuild("getIa", getIaSource);
