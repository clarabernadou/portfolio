// Retour d'expérience d'un projet (demande de Clara, 4 nov. 2026) : difficultés rencontrées et
// solutions, ce qu'elle en a retenu, ce qu'elle améliorerait aujourd'hui. Saisi dans l'administration,
// affiché sur la fiche publique dès qu'un champ est rempli. Sans dépendance serveur.
import { cleDate } from "@/lib/admin/projects";

export interface Retour {
  difficultes: string;
  appris: string;
  ameliorations: string;
}
export type CleRetour = keyof Retour;

export const RETOUR_VIDE: Retour = {
  difficultes: "",
  appris: "",
  ameliorations: "",
};

export const CHAMPS_RETOUR: {
  cle: CleRetour;
  titre: string;
  aide: string;
  max: number;
}[] = [
  {
    cle: "difficultes",
    titre: "Difficultés rencontrées",
    aide: "Ce qui a résisté, et comment tu t’en es sortie.",
    max: 600,
  },
  {
    cle: "appris",
    titre: "Ce que j’en ai retenu",
    aide: "Ce que tu sais faire depuis, ou ce qui a changé ta façon de travailler.",
    max: 600,
  },
  {
    cle: "ameliorations",
    titre: "Ce que j’améliorerais aujourd’hui",
    aide: "Avec ton niveau actuel, ou avec plus de temps.",
    max: 600,
  },
];

/** Lit la colonne JSON (absente, partielle ou mal formée) en un retour complet. */
export function lireRetour(v: unknown): Retour {
  const o = (v && typeof v === "object" ? v : {}) as Partial<Record<CleRetour, unknown>>;
  const t = (x: unknown) => (typeof x === "string" ? x : "");
  return {
    difficultes: t(o.difficultes),
    appris: t(o.appris),
    ameliorations: t(o.ameliorations),
  };
}

export const champsRemplis = (r: Retour) => CHAMPS_RETOUR.filter((c) => r[c.cle].trim()).length;
export const retourComplet = (r: Retour) => champsRemplis(r) === CHAMPS_RETOUR.length;

// ── Pistes pour remplir le retour ───────────────────────────────────────────────────────
// Des questions, jamais des réponses : rien n'est affirmé à la place de Clara. Elles sont tirées
// des tags, du cadre et de la date du projet, pour raviver le souvenir des projets anciens.

export type ProjetPistes = {
  tags: string[];
  types: string[];
  parcours: string;
  date: string;
};

type Piste = { motif: RegExp } & Partial<Record<CleRetour, string>>;

const PISTES_TAGS: Piste[] = [
  {
    motif: /^(react|redux|redux toolkit|react router)$/i,
    difficultes: "L’état partagé entre composants (props, Redux, contexte) t’a-t-il posé problème ?",
    ameliorations: "Découperais-tu les composants autrement, ou ajouterais-tu des tests avec Testing Library ?",
  },
  {
    motif: /^(angular|rxjs)$/i,
    difficultes: "Les observables RxJS (abonnements, désabonnements, enchaînements) t’ont-ils bloquée à un moment ?",
  },
  {
    motif: /^(spring boot|spring security|java|maven)$/i,
    difficultes: "La configuration du back-end (Spring Security, JWT, CORS) a-t-elle résisté ?",
  },
  {
    motif: /^(node\.js|express|api rest|api|nestjs)$/i,
    difficultes: "Gestion des erreurs, codes HTTP, authentification par jeton : quel point de l’API a été le plus délicat ?",
  },
  {
    motif: /^(mysql|sql|sequelize|mongodb|prisma|modélisation)$/i,
    difficultes: "La modélisation des données t’a-t-elle obligée à revenir en arrière ?",
  },
  {
    motif: /^(tests|tests unitaires|tests automatisés|jest|cypress|junit|tdd|testing library|plan de test|gherkin)$/i,
    difficultes: "Quelle partie était la plus difficile à tester (asynchrone, simulations, base de test) ?",
    appris: "Qu’est-ce que l’écriture des tests a changé dans ta façon de coder ?",
  },
  {
    motif: /^(ci\/cd|docker|git)$/i,
    difficultes: "Pipeline qui échoue, image Docker, variables d’environnement : quel problème as-tu dû résoudre ?",
  },
  {
    motif: /^(css|scss|html|html \/ css|responsive|flexbox|mobile-first|tailwind css|animations)$/i,
    difficultes: "Une mise en page résistait-elle sur mobile ou sur un navigateur précis ?",
    ameliorations: "Organiserais-tu les styles autrement aujourd’hui (variables, Grid, composants) ?",
  },
  {
    motif: /^javascript$/i,
    ameliorations: "Le referais-tu en TypeScript ou avec un framework ?",
  },
  {
    motif: /^typescript$/i,
    appris: "Le typage t’a-t-il évité des erreurs, ou en a-t-il révélé ?",
  },
  {
    motif: /^(accessibilité|rgpd)$/i,
    difficultes: "Un critère (contraste, clavier, lecteur d’écran, données personnelles) était-il difficile à respecter ?",
  },
  {
    motif: /^(performance|seo|google analytics|chrome devtools)$/i,
    difficultes: "Quelle mesure a été la plus difficile à améliorer, et comment l’as-tu fait ?",
  },
  {
    motif: /^(figma|wireframes|prototype|prototypage|ui|style guide|charte graphique|framer|design graphique|identité de marque)$/i,
    difficultes: "Une maquette a-t-elle dû changer après un retour (mentor, utilisateurs, contrainte technique) ?",
  },
  {
    motif: /^(ux research|atomic ux research|entretiens|tests utilisateurs|tri de cartes|personas|recherche|recherche utilisateur|recherche secondaire|hypothèses)$/i,
    difficultes: "Recrutement des participants, questions biaisées, résultats contradictoires : qu’est-ce qui a été le plus délicat ?",
    appris: "Un résultat de recherche t’a-t-il surprise ou fait changer d’avis ?",
    ameliorations: "Avec plus de temps, quelle méthode aurais-tu ajoutée, ou avec combien de participants de plus ?",
  },
  {
    motif: /^(audit|recommandations ux|bastien et scapin|ergonomie|audit de présence web)$/i,
    difficultes: "Comment as-tu priorisé les constats, et lequel a été le plus difficile à justifier ?",
    ameliorations: "Quelles recommandations ont été appliquées, ou le seraient en premier ?",
  },
  {
    motif: /^(atelier|co-conception|design thinking)$/i,
    difficultes: "Animer l’atelier : tenir le temps, faire participer tout le monde ?",
  },
  {
    motif: /^(gestion de projet|agile|méthode agile|scrum|cahier des charges|chiffrage|spécifications techniques|spécifications fonctionnelles|gestion des risques|roadmap|cadrage|faisabilité|user stories)$/i,
    difficultes: "Un chiffrage ou un découpage a-t-il été difficile à estimer ou à justifier ?",
    appris: "Qu’est-ce que ce cadrage t’a appris sur le travail avec une équipe de développement ?",
  },
  {
    motif: /^(vidéo|remotion|motion design|premiere pro|écriture de script|elevenlabs)$/i,
    difficultes: "Qu’est-ce qui a été le plus long : le script, l’animation ou le rendu ?",
  },
  {
    motif: /^wordpress$/i,
    difficultes: "Les limites de l’éditeur ou du thème t’ont-elles obligée à contourner quelque chose ?",
  },
  {
    motif: /^(claude code|claude design)$/i,
    appris: "Où l’IA t’a-t-elle fait gagner du temps, et où as-tu dû la corriger ?",
  },
];

const GENERALES: Retour = {
  difficultes: "Qu’est-ce qui t’a pris le plus de temps, et pourquoi ?",
  appris: "Quelle compétence de ce projet réutilises-tu aujourd’hui ?",
  ameliorations: "Avec une semaine de plus, que ferais-tu en premier ?",
};

const MAX_PISTES = 4;

export function pistesRetour(p: ProjetPistes, maintenant = new Date()): Record<CleRetour, string[]> {
  const pistes: Record<CleRetour, string[]> = {
    difficultes: [],
    appris: [],
    ameliorations: [],
  };
  const ajouter = (cle: CleRetour, q?: string) => {
    if (q && !pistes[cle].includes(q)) pistes[cle].push(q);
  };
  // Le cadre d'abord : il change le plus la nature du retour.
  if (p.parcours === "En entreprise") {
    ajouter("difficultes", "Une contrainte d’équipe (délais, validation, code ou charte existants) a-t-elle compliqué le travail ? Reste général sur ce qui est confidentiel.");
    ajouter("appris", "Qu’as-tu appris en travaillant avec l’équipe (produit, développement, marketing) ?");
  } else if (p.parcours === "Projet personnel") {
    ajouter("difficultes", "Quel choix technique ou de design as-tu dû revoir en cours de route ?");
  } else if (p.parcours === "Audit indépendant") {
    ajouter("appris", "Qu’a retenu le commanditaire de l’audit, et qu’en as-tu tiré pour tes prochains audits ?");
  } else {
    ajouter("difficultes", "Quelle partie du sujet était la plus floue ou la plus nouvelle pour toi ?");
    ajouter("appris", "Qu’ont dit ton mentor ou le jury à la soutenance ?");
  }
  if (/en cours/i.test(p.date)) ajouter("ameliorations", "Qu’est-ce qui reste à faire, et dans quel ordre ?");
  const cle = cleDate(p.date);
  // Projet de plus de 2 ans : le recul est justement ce qui intéresse un recruteur.
  if (cle !== null && maintenant.getFullYear() * 12 + maintenant.getMonth() - cle >= 24) ajouter("ameliorations", "Avec ton niveau actuel, qu’est-ce que tu ferais autrement ?");
  for (const piste of PISTES_TAGS) if (p.tags.some((t) => piste.motif.test(t.trim()))) for (const c of ["difficultes", "appris", "ameliorations"] as const) ajouter(c, piste[c]);
  for (const c of ["difficultes", "appris", "ameliorations"] as const) {
    pistes[c] = pistes[c].slice(0, MAX_PISTES - 1);
    ajouter(c, GENERALES[c]);
  }
  return pistes;
}

// ── Priorité pour un recruteur ──────────────────────────────────────────────────────────
// Ordre des projets à détailler (poste visé : développeuse front-end & UI/UX designer) :
// l'expérience en entreprise, puis les projets mis en avant, les projets personnels, les
// formations les plus proches du poste et les plus récentes, et ceux qui ont de quoi être montrés.

export type ProjetPriorite = {
  parcours: string;
  types: string[];
  date: string;
  featured: boolean;
  onHome: boolean;
  docs: number;
  github: boolean;
  site: boolean;
};

const CADRES: Record<string, [number, string]> = {
  "En entreprise": [100, "Expérience en entreprise"],
  "Projet personnel": [80, "Projet personnel"],
  "Audit indépendant": [70, "Audit pour un client"],
  "UX Design": [45, "Formation UX, la plus récente"],
  "Application - JavaScript & React": [40, "Formation React, cœur du poste front-end"],
  "Full Stack - Java & Angular": [35, "Formation Full-Stack"],
  "Développeur Web": [20, "Formation Développeur Web"],
};

export function prioriteRecruteur(p: ProjetPriorite): {
  score: number;
  raisons: string[];
} {
  const raisons: string[] = [];
  let score = 0;
  const [poids, raison] = CADRES[p.parcours] ?? [30, p.parcours];
  score += poids;
  raisons.push(raison);
  if (p.featured) {
    score += 30;
    raisons.push("Projet phare");
  }
  if (p.onHome) {
    score += 20;
    raisons.push("Sur l’accueil");
  }
  if (p.types.includes("Développement") || p.types.includes("UX / UI")) score += 10;
  const cle = cleDate(p.date);
  if (cle !== null) score += Math.max(0, Math.min(15, (Math.floor(cle / 12) - 2021) * 3));
  if (p.docs > 0 || p.github || p.site) {
    score += 5;
    raisons.push(p.github ? "Code à montrer" : p.site ? "Site en ligne" : "Livrables à montrer");
  }
  return { score, raisons };
}
