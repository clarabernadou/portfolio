// Repli quand la base est absente, repris de la base le 25 oct. 2026. Version essentielle
// seulement : la version complète du CV n'est pas publique et reste dans la base (administration).
import type { Experience } from "../types";
import { entreprises } from "../site-data";

function hrefFor(nom: string): string {
  return entreprises.find((e) => e.nom === nom)?.url ?? "#";
}

export const experiences: Experience[] = [
  {
    poste: "Développeuse Full-Stack & UI Designer",
    entreprise: "Fruggr",
    entrepriseHref: hrefFor("Fruggr"),
    entrepriseParent: "Digital4Better",
    entrepriseParentHref: hrefFor("Digital4Better"),
    periode: "mars 2025 – aujourd’hui",
    lieuMode: "Alternance · Nantes, en télétravail avec des déplacements réguliers",
    contexteEssentiel: "Plateforme SaaS de numérique responsable (gouvernance de l’IA, accessibilité, impact environnemental), utilisée par de grands comptes.",
    contexteComplet: "Plateforme SaaS de numérique responsable (gouvernance de l’IA, accessibilité, impact environnemental), utilisée par de grands comptes.",
    blocs: [
      {
        name: "Équipe Produit",
        period: "mars 2025 – juin 2026",
        bulletsEssentiel: ["Développement front-end en React et TypeScript de la plateforme : plus de 70 pull requests fusionnées en 15 mois (fonctionnalités, refontes, corrections)","Refonte de la barre de navigation, de la page d’accueil par offre et de tableaux de bord ; passage des modules Services et Infra à la nouvelle charte UI","Module d’accessibilité : génération de la déclaration d’accessibilité, repérage des quick wins, corrections de critères RGAA, export CSV","Seule designer UI/UX de l’équipe Produit après le départ de l’alternante en design, sous la supervision du PO : maquettes et évolutions sur Figma, ateliers de conception","Évolutions back-end ponctuelles en NestJS et MongoDB ; tests unitaires, relecture de code, déploiements de la préproduction à la production (Azure)"],
        bulletsComplet: ["Développement front-end en React et TypeScript de la plateforme : plus de 70 pull requests fusionnées en 15 mois (fonctionnalités, refontes, corrections)","Refonte de la barre de navigation, de la page d’accueil par offre et de tableaux de bord ; passage des modules Services et Infra à la nouvelle charte UI","Module d’accessibilité : génération de la déclaration d’accessibilité, repérage des quick wins, corrections de critères RGAA, export CSV","Seule designer UI/UX de l’équipe Produit après le départ de l’alternante en design, sous la supervision du PO : maquettes et évolutions sur Figma, ateliers de conception","Évolutions back-end ponctuelles en NestJS et MongoDB ; tests unitaires, relecture de code, déploiements de la préproduction à la production (Azure)"],
        technologies: ["React","TypeScript","Figma","NestJS","MongoDB","Azure DevOps","Azure","Zendesk","Cursor","Claude Code"],
      },
      {
        name: "Équipe Marketing : sites web et contenus",
        period: "depuis juin 2026",
        bulletsEssentiel: ["Développement du thème WordPress du site Fruggr : 9 nouveaux blocs sur mesure (frise, cartes, bannières, FAQ, cas clients), pied de page et type de contenu « ressource » ; 22 pull requests depuis juillet 2026","Nouveau site WordPress de Digital4Better : maquettes Figma et mise en page complète","Audits UI/UX, accessibilité (WCAG, RGAA) et SEO technique de sites, avec recommandations priorisées ; correction des erreurs et avertissements relevés par Semrush","Participation au repositionnement de Fruggr : saga de 3 films bilingues réalisée de A à Z, du script validé au rendu (Remotion en React, voix off ElevenLabs)"],
        bulletsComplet: ["Développement du thème WordPress du site Fruggr : 9 nouveaux blocs sur mesure (frise, cartes, bannières, FAQ, cas clients), pied de page et type de contenu « ressource » ; 22 pull requests depuis juillet 2026","Nouveau site WordPress de Digital4Better : maquettes Figma et mise en page complète","Audits UI/UX, accessibilité (WCAG, RGAA) et SEO technique de sites, avec recommandations priorisées ; correction des erreurs et avertissements relevés par Semrush","Participation au repositionnement de Fruggr : saga de 3 films bilingues réalisée de A à Z, du script validé au rendu (Remotion en React, voix off ElevenLabs)"],
        technologies: ["WordPress","Semrush","Figma","Claude Design","Nano Banana","Remotion","ElevenLabs","Premiere Pro","HubSpot"],
      },
      {
        name: "Transverse : automatisation par l’IA",
        bulletsEssentiel: ["Création de 6 skills Claude pour automatiser des tâches récurrentes de mon poste (visuels LinkedIn, intégration d’articles WordPress, audits de sites), proposés à l’équipe"],
        bulletsComplet: ["Création de 6 skills Claude pour automatiser des tâches récurrentes de mon poste (visuels LinkedIn, intégration d’articles WordPress, audits de sites), proposés à l’équipe"],
      },
    ],
  },
  {
    poste: "Développeuse Full-Stack & UI Designer",
    entreprise: "CarbonScore",
    entrepriseHref: hrefFor("CarbonScore"),
    entrepriseParent: "TechUpClimate",
    entrepriseParentHref: hrefFor("TechUpClimate"),
    periode: "déc. 2023 – fév. 2025",
    lieuMode: "Alternance · Pontoise, en télétravail",
    contexteEssentiel: "Plateforme de bilan carbone IT.",
    contexteComplet: "Plateforme de bilan carbone IT.",
    blocs: [
      {
        bulletsEssentiel: ["Intégration des maquettes, refontes de pages et évolutions de la plateforme : front-end Vue.js (Vuetify, Pinia) et TypeScript, back-end NestJS et PostgreSQL","Conception sur Figma des maquettes des nouvelles fonctionnalités","Méthode agile (dailies, tickets Jira, documentation Confluence), sur des environnements personnels, de préproduction et de production"],
        bulletsComplet: ["Intégration des maquettes, refontes de pages et évolutions de la plateforme : front-end Vue.js (Vuetify, Pinia) et TypeScript, back-end NestJS et PostgreSQL","Conception sur Figma des maquettes des nouvelles fonctionnalités","Méthode agile (dailies, tickets Jira, documentation Confluence), sur des environnements personnels, de préproduction et de production"],
        technologies: ["Vue.js","Vuetify","Pinia","TypeScript","NestJS","PostgreSQL","Figma","Jira","Confluence"],
      },
    ],
    note: "Rachat de TechUpClimate par Digital4Better en 2025 : mission poursuivie chez Fruggr, sans interruption.",
  },
];
