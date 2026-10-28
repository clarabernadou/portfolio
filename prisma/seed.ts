// Étape 8 : import des données existantes dans la base (npm run db:seed).
// Sources : data/*.json et lib/content/* (les mêmes que le site public).
// Rejouable sans risque : un élément déjà présent n'est jamais modifié, pour ne
// pas écraser ce que Clara aura changé dans l'administration.
import { db } from "../lib/db";
import { Prisma } from "../lib/generated/prisma/client";
import projectsData from "../data/projects.json";
import iaData from "../data/ia.json";
import liensData from "../data/liens.json";
import orientationsData from "../data/cv-orientations.json";
import cartesAccueil from "../data/accueil-cartes.json";
import { experiences } from "../lib/content/experiences";
import { alternances } from "../lib/content/accueil";
import { formations } from "../lib/content/formations";
import { identite, langues, profilCv, competencesEssentiel } from "../lib/content/profile";
import { recommendations } from "../lib/content/recommendations";
import type { Project } from "../lib/types";

const TYPES = ["Développement", "UX / UI", "Conception et gestion"];

async function main() {
  const prisma = db();
  const log = (entity: string, entityId: string, action: string) =>
    prisma.syncLog.create({ data: { source: "import", entity, entityId, action, state: "Publiée" } });
  let created = 0;

  const projects = projectsData as Project[];
  const homeCard = (id: string) => {
    const i = cartesAccueil.findIndex((c) => c.id === id);
    if (i < 0) return undefined;
    const { section, eyebrow, line, tags } = cartesAccueil[i];
    return { section, eyebrow, line, tags, order: i };
  };
  for (const [position, p] of projects.entries()) {
    const exists = await prisma.project.findUnique({ where: { id: p.id }, select: { id: true, homeCard: true } });
    if (exists) {
      // Carte d'accueil ajoutée après le premier import : complétée seulement si vide.
      if (exists.homeCard === null && homeCard(p.id)) {
        await prisma.project.update({ where: { id: p.id }, data: { homeCard: homeCard(p.id) } });
      }
      continue;
    }
    await prisma.project.create({
      data: {
        id: p.id,
        position,
        name: p.name,
        date: p.date,
        type: p.type,
        types: p.types,
        parcours: p.parcours,
        line: p.line,
        tags: p.tags,
        pdf: p.pdf,
        docs: p.docs as object[],
        steps: p.steps as object[],
        videos: (p.videos ?? undefined) as object[] | undefined,
        github: p.github,
        figma: p.figma,
        context: p.context,
        skillsValidated: p.skillsValidated,
        onHome: p.onHome,
        homeCard: homeCard(p.id),
        featured: p.featured,
      },
    });
    await log("project", p.id, "created");
    created++;
  }

  // Ordre des filtres « Filtrer par formation ou cadre » de la page Projets du site.
  const cadres = [
    "UX Design / Product Designer",
    "Full Stack Java & Angular",
    "Application JavaScript React",
    "Développeur Web",
    "Alternance · Fruggr",
    "Projet personnel",
    "Audit indépendant",
  ];
  const nature = (name: string) =>
    name.startsWith("Alternance") ? "Entreprise" : name === "Projet personnel" ? "Projet perso" : name.startsWith("Audit") ? "Audit" : "Formation";
  for (const [kind, names] of [["type", TYPES], ["cadre", cadres]] as const) {
    for (const [position, name] of names.entries()) {
      const n = kind === "cadre" ? nature(name) : null;
      const existing = await prisma.category.findUnique({ where: { kind_name: { kind, name } } });
      if (!existing) await prisma.category.create({ data: { kind, name, position, nature: n } });
      // Nature ajoutée après le premier import : complétée seulement si vide.
      else if (n && !existing.nature) await prisma.category.update({ where: { id: existing.id }, data: { nature: n, position } });
    }
  }

  if ((await prisma.formation.count()) === 0) {
    await prisma.formation.createMany({
      data: formations.map((f, position) => ({
        position,
        intitule: f.intitule,
        url: f.url,
        annees: f.annees,
        diplome: f.diplome,
        niveauComplet: f.niveauComplet,
        mode: f.mode,
        statut: f.statut,
        projets: f.projets,
        mentionComplementaire: f.mentionComplementaire,
      })),
    });
    await log("formation", "*", "created");
    created += formations.length;
  }

  const alternanceCard = (entreprise: string) => {
    const i = alternances.findIndex((a) => a.entreprise === entreprise);
    return i < 0 ? undefined : { lieuMode: alternances[i].lieuMode, technologies: alternances[i].technologies, order: i };
  };
  // Cartes d'alternance ajoutées après le premier import : complétées seulement si vides.
  for (const row of await prisma.experience.findMany({ where: { homeCard: { equals: Prisma.DbNull } } })) {
    const card = alternanceCard(row.entreprise);
    if (card) await prisma.experience.update({ where: { id: row.id }, data: { homeCard: card } });
  }

  if ((await prisma.experience.count()) === 0) {
    await prisma.experience.createMany({
      data: experiences.map((e, position) => ({
        position,
        poste: e.poste,
        entreprise: e.entreprise,
        entrepriseParent: e.entrepriseParent,
        entrepriseHref: e.entrepriseHref,
        entrepriseParentHref: e.entrepriseParentHref,
        periode: e.periode,
        lieuMode: e.lieuMode,
        contexteEssentiel: e.contexteEssentiel,
        blocs: e.blocs as unknown as object[],
        note: e.note,
        homeCard: alternanceCard(e.entreprise),
      })),
    });
    await log("experience", "*", "created");
    created += experiences.length;
  }

  if ((await prisma.skillGroup.count()) === 0) {
    const groups = [
      ...competencesEssentiel.map((g, position) => ({ version: "essentiel", name: g.categorie, items: g.items, position })),
    ];
    await prisma.skillGroup.createMany({ data: groups });
    created += groups.length;
  }

  // Profils LinkedIn ajoutés après le premier import (data/liens.json).
  for (const l of liensData.recommandations) {
    if (l.linkedin) await prisma.recommendation.updateMany({ where: { auteur: l.auteur, linkedin: null }, data: { linkedin: l.linkedin } });
  }
  // Champs ajoutés après le premier import (carte de Frédéric Lépy, accueil).
  await prisma.recommendation.updateMany({ where: { auteur: "Frédéric Lépy", lienTexte: null }, data: { lienTexte: "IntuitLearn", voirLinkedin: true } });

  if ((await prisma.recommendation.count()) === 0) {
    await prisma.recommendation.createMany({
      data: recommendations.map((r, position) => ({
        position,
        auteur: r.auteur,
        initiales: r.initiales,
        linkedin: r.linkedin,
        poste: r.poste,
        relation: r.relation,
        citationCourte: r.citationCourte,
        texteIntegral: r.texteIntegral,
        lettrePdf: r.lettrePdf,
        entrepriseHref: r.entrepriseHref,
        lienTexte: r.auteur === "Frédéric Lépy" ? "IntuitLearn" : null,
        voirLinkedin: r.auteur === "Frédéric Lépy",
      })),
    });
    created += recommendations.length;
  }

  const singletons: Record<string, object> = {
    profil: { identite, langues, profilCv },
    ia: iaData,
    liens: liensData,
    // Ordre du bandeau « Projets phares » (maquettes/site-mobile/projets.jpg).
    phares: { ids: ["portfolio", "watchedthis", "intuitlearn"] },
  };
  for (const [key, data] of Object.entries(singletons)) {
    await prisma.singleton.upsert({ where: { key }, create: { key, data }, update: {} });
  }

  for (const o of orientationsData.orientations) {
    await prisma.cvOrientation.upsert({ where: { id: o.id }, create: { id: o.id, data: o }, update: {} });
  }

  console.log(`Import terminé : ${created} éléments créés (les éléments déjà présents sont conservés).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
