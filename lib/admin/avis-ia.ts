// Relecture des textes de l'administration par une IA (demande de Clara, 25 oct. 2026).
// Mode intégré : Google Gemini (offre gratuite, clé personnelle de Clara), réponse
// structurée affichée dans le panneau. Mode de secours : prompt complet à coller dans
// Claude, dont on extrait la version proposée de la réponse recollée.

export type Recruteur = "hybride" | "tech" | "design";

/** Relire : améliorer le texte à longueur égale. Compléter : en faire un court paragraphe plus détaillé (28 oct. 2026). */
export type Mode = "relire" | "completer";

/** Sources supplémentaires du mode « Compléter ». */
export interface Sources {
  /** Notes libres de Clara : ce que la fiche ne dit pas. */
  notes?: string;
  /** Résumé du dépôt GitHub du projet (lib/admin/depot-ia.ts). */
  depot?: string;
}

export const RECRUTEURS: { id: Recruteur; label: string; role: string }[] = [
  {
    id: "hybride",
    label: "Profils hybrides",
    role: "une recruteuse tech exigeante, spécialisée dans les profils hybrides qui associent développement front-end et design UI/UX, habituée à repérer les textes vagues, gonflés ou invérifiables",
  },
  {
    id: "tech",
    label: "Tech",
    role: "un lead développeur exigeant qui recrute des développeurs front-end et full-stack, et qui juge d'abord la crédibilité technique : ce qui a été réellement développé, avec quelles technologies, dans quel périmètre",
  },
  {
    id: "design",
    label: "Design",
    role: "une UX lead exigeante qui recrute des designers UI/UX et des product designers, et qui juge la démarche : problème, méthodes, constats, décisions de conception, livrables et validations réellement menées",
  },
];

export interface ContexteAvis {
  /** Où le texte apparaît, par exemple « Fiche projet « WatchedThis » · Projet personnel ». */
  page: string;
  /** Libellé du champ, par exemple « Accroche ». */
  champ: string;
  /** Longueur maximale conseillée, en caractères. */
  max?: number;
  /** Autres informations de la même fiche, pour la cohérence (jamais à réécrire). */
  infos?: string;
  /** Dépôt GitHub du projet, lu par le serveur en mode « Compléter ». */
  github?: string;
}

// Consignes communes aux 2 modes (Gemini dans l'administration, ou copie pour Claude).
export function consignesAvis(ctx: ContexteAvis, recruteur: Recruteur, profil?: string, mode: Mode = "relire"): string {
  const r = RECRUTEURS.find((x) => x.id === recruteur) ?? RECRUTEURS[0];
  const completer = mode === "completer";
  return [
    `Tu es ${r.role}.`,
    "",
    completer
      ? "Tu aides Clara Bernadou, développeuse front-end & UI/UX designer, qui cherche un CDI de développeuse front-end ou full-stack avec une double compétence UI/UX, disponible en mars 2027, à compléter un texte de son portfolio. Ton objectif : transformer ce texte trop court en un petit paragraphe détaillé et concret (3 à 5 phrases) qui explique ce que Clara a réellement fait, avec quels outils et quelles compétences, uniquement à partir des sources fournies. Pas plusieurs paragraphes."
      : "Tu relis un texte du portfolio et du CV de Clara Bernadou, développeuse front-end & UI/UX designer, qui cherche un CDI de développeuse front-end ou full-stack avec une double compétence UI/UX, disponible en mars 2027. Ton objectif : rendre ce texte plus clair, plus concret et plus crédible pour un recruteur, sans jamais l'embellir.",
    "",
    "## Règles absolues",
    "1. Ne rien inventer : aucune technologie, aucun chiffre, aucun résultat, aucune responsabilité, aucune méthode, aucun test utilisateur ni aucune mise en production qui ne figure pas dans le texte ou dans les informations fournies. Si une précision rendrait le texte meilleur mais manque, pose une question au lieu de la deviner.",
    "2. Respecter le cadre : un projet de formation reste un projet de formation, un projet personnel reste personnel ; une recommandation n'est pas un résultat obtenu ; un prototype n'est pas une interface en production ; une participation n'est pas un pilotage.",
    "3. Écrire en français, sur un ton professionnel, direct et humain : pas de superlatifs, pas de formules creuses (« passionnée », « dynamique », « de bout en bout » sans preuve), pas de jargon inutile. Les chiffres s'écrivent en chiffres.",
    "4. Garder la voix du texte d'origine (« je » ou formulation impersonnelle) et sa forme (phrase, puce, titre).",
    ctx.max
      ? `5. La version proposée fait au plus ${ctx.max} caractères, espaces compris.`
      : completer
        ? "5. La version proposée fait au plus 600 caractères, espaces compris."
        : "5. La version proposée reste à peu près de la même longueur que l'original, ou plus courte.",
    completer
      ? "6. N'allonge jamais artificiellement : si les sources ne permettent pas d'en dire plus, propose ce qui est sourcé, même court, et pose des questions précises pour compléter le reste."
      : "6. Si le texte est déjà bon, dis-le et propose-le tel quel ou avec des retouches minimes : ne réécris pas pour réécrire.",
    "7. La version proposée est en texte brut, sans mise en forme Markdown.",
    "8. Ne change jamais la nature d'un projet ou d'une expérience : création ou refonte, formation ou travail en entreprise, seule ou en équipe, prototype ou mise en production. En cas de doute, reprends exactement la formulation des sources.",
    "9. Toute information de ta version proposée qui ne figure ni dans le texte, ni dans les informations de la fiche, ni dans le profil de Clara, ni dans ses notes, ni dans son dépôt GitHub doit être listée dans « affirmationsNonSourcees » (tableau vide sinon).",
    ...(completer
      ? [
          "10. N'utilise pas ce que tu crois savoir du projet (par exemple l'énoncé public d'un projet de formation) : seules les sources fournies comptent.",
          "11. Le code du dépôt GitHub montre ce que Clara a réellement réalisé : tu peux citer une technique que tu y constates (par exemple une mise en page avec Flexbox ou des media queries), en restant factuel, sans juger la qualité du code et sans en exagérer la portée.",
        ]
      : []),
    ...(profil?.trim() ? ["", "## Ce qu'il faut savoir sur Clara (source fiable, à respecter)", profil.trim()] : []),
  ].join("\n");
}

/** Le texte à relire et son contexte. */
export function demandeAvis(texte: string, ctx: ContexteAvis, sources: Sources = {}, mode: Mode = "relire"): string {
  return [
    "## Le texte à relire",
    `- Emplacement : ${ctx.page}`,
    `- Champ : ${ctx.champ}`,
    ctx.max ? `- Longueur maximale : ${ctx.max} caractères, espaces compris (le texte actuel en fait ${texte.length})` : `- Longueur actuelle : ${texte.length} caractères`,
    "",
    "<<<TEXTE",
    texte.trim() || "(champ vide)",
    "TEXTE>>>",
    ...(ctx.infos?.trim()
      ? ["", "## Autres informations de la même fiche", "Pour la cohérence uniquement : ne les réécris pas, et n'en tire aucun fait qui n'y figure pas.", "", ctx.infos.trim()]
      : []),
    ...(sources.notes?.trim() ? ["", "## Notes de Clara (source fiable)", sources.notes.trim()] : []),
    ...(sources.depot?.trim() ? ["", "## Dépôt GitHub du projet (source fiable : son propre code)", sources.depot.trim()] : []),
    ...(mode === "completer"
      ? ["", "## Ta tâche", "Compléter le texte : la version proposée est un petit paragraphe de 3 à 5 phrases, nettement plus détaillé et concret que le texte actuel, construit uniquement avec les faits des sources ci-dessus (fiche, profil, notes, dépôt). Si les sources ne permettent vraiment pas d'en dire plus, dis-le dans le verdict et pose tes questions."]
      : []),
  ].join("\n");
}

/** Réponse structurée de l'IA (mode intégré). */
export interface Avis {
  verdict: string;
  pointsForts: string[];
  aAmeliorer: { point: string; raison: string }[];
  questions: string[];
  proposition: string;
  affirmationsNonSourcees: string[];
}

/** Schéma JSON imposé à la réponse (mode intégré). */
export const SCHEMA_AVIS = {
  type: "object",
  properties: {
    verdict: { type: "string", description: "1 ou 2 phrases." },
    pointsForts: { type: "array", items: { type: "string" }, description: "1 à 3 points forts." },
    aAmeliorer: {
      type: "array",
      description: "Classés du plus important au moins important.",
      items: { type: "object", properties: { point: { type: "string" }, raison: { type: "string" } }, required: ["point", "raison"] },
    },
    questions: { type: "array", items: { type: "string" }, description: "Seulement si une information manque ; sinon tableau vide." },
    proposition: { type: "string", description: "Le texte réécrit, en texte brut." },
    affirmationsNonSourcees: { type: "array", items: { type: "string" }, description: "Informations de la proposition absentes des sources ; tableau vide sinon." },
  },
  required: ["verdict", "pointsForts", "aAmeliorer", "questions", "proposition", "affirmationsNonSourcees"],
} as const;

/** Prompt complet à copier dans Claude (mode de secours, sans service relié). */
export function promptAvis(texte: string, ctx: ContexteAvis, recruteur: Recruteur, profil?: string, mode: Mode = "relire", sources: Sources = {}): string {
  return [
    consignesAvis(ctx, recruteur, profil, mode),
    "",
    demandeAvis(texte, ctx, sources, mode),
    "",
    "## Format de ta réponse (respecte-le exactement)",
    "**Verdict** : 1 ou 2 phrases.",
    "",
    "**Points forts** : 1 à 3 puces.",
    "",
    "**À améliorer** : des puces classées de la plus importante à la moins importante, chacune avec la raison.",
    "",
    "**Questions pour Clara** : seulement si une information manque pour améliorer le texte sans rien inventer ; sinon écris « Aucune ».",
    "",
    "**Version proposée** : le texte réécrit, entre ces 2 marqueurs, chacun seul sur sa ligne :",
    "<<<PROPOSITION",
    "(le texte proposé)",
    "PROPOSITION>>>",
    "",
    "**Longueur** : le nombre de caractères de la version proposée.",
  ].join("\n");
}

/** Extrait la version proposée d'une réponse recollée ; null si les marqueurs manquent. */
export function extraireProposition(reponse: string): string | null {
  const m = reponse.match(/<<<\s*PROPOSITION\s*\n([\s\S]*?)\n\s*PROPOSITION\s*>>>/);
  const texte = m?.[1]?.trim();
  return texte ? texte : null;
}
