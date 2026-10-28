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

const CLARA = "Clara Bernadou, développeuse front-end & UI/UX designer, qui cherche un CDI de développeuse front-end ou full-stack avec une double compétence UI/UX, disponible en mars 2027";
const REGLE_INVENTER =
  "Ne rien inventer : aucune technologie, aucun chiffre, aucun résultat, aucune responsabilité, aucune méthode, aucun test utilisateur ni aucune mise en production qui ne figure pas dans le texte ou dans les informations fournies. Si une précision rendrait le texte meilleur mais manque, pose une question au lieu de la deviner.";
const REGLE_CADRE =
  "Respecter le cadre : un projet de formation reste un projet de formation, un projet personnel reste personnel ; une recommandation n'est pas un résultat obtenu ; un prototype n'est pas une interface en production ; une participation n'est pas un pilotage.";
const REGLE_TON =
  "Écrire en français, sur un ton professionnel, direct et humain : pas de superlatifs, pas de formules creuses (« passionnée », « dynamique », « de bout en bout » sans preuve), pas de jargon inutile. Les chiffres s'écrivent en chiffres.";
const REGLE_NATURE =
  "Ne change jamais la nature d'un projet ou d'une expérience : création ou refonte, formation ou travail en entreprise, seule ou en équipe, prototype ou mise en production. En cas de doute, reprends exactement la formulation des sources.";
const REGLE_SAVOIR = "N'utilise pas ce que tu crois savoir du projet (par exemple l'énoncé public d'un projet de formation) : seules les sources fournies comptent.";
const REGLE_CODE =
  "Le code du dépôt GitHub montre ce que Clara a réellement réalisé : tu peux citer une technique que tu y constates (par exemple une mise en page avec Flexbox ou des media queries), en restant factuel, sans juger la qualité du code et sans en exagérer la portée.";
const profilClara = (profil?: string) => (profil?.trim() ? ["", "## Ce qu'il faut savoir sur Clara (source fiable, à respecter)", profil.trim()] : []);

// Consignes communes aux 2 modes (Gemini dans l'administration, ou copie pour Claude).
export function consignesAvis(ctx: ContexteAvis, recruteur: Recruteur, profil?: string, mode: Mode = "relire"): string {
  const r = RECRUTEURS.find((x) => x.id === recruteur) ?? RECRUTEURS[0];
  const completer = mode === "completer";
  return [
    `Tu es ${r.role}.`,
    "",
    completer
      ? `Tu aides ${CLARA}, à compléter un texte de son portfolio. Ton objectif : transformer ce texte trop court en un petit paragraphe détaillé et concret (3 à 5 phrases) qui explique ce que Clara a réellement fait, avec quels outils et quelles compétences, uniquement à partir des sources fournies. Pas plusieurs paragraphes.`
      : `Tu relis un texte du portfolio et du CV de ${CLARA}. Ton objectif : rendre ce texte plus clair, plus concret et plus crédible pour un recruteur, sans jamais l'embellir.`,
    "",
    "## Règles absolues",
    `1. ${REGLE_INVENTER}`,
    `2. ${REGLE_CADRE}`,
    `3. ${REGLE_TON}`,
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
    `8. ${REGLE_NATURE}`,
    "9. Toute information de ta version proposée qui ne figure ni dans le texte, ni dans les informations de la fiche, ni dans le profil de Clara, ni dans ses notes, ni dans son dépôt GitHub doit être listée dans « affirmationsNonSourcees » (tableau vide sinon).",
    ...(completer ? [`10. ${REGLE_SAVOIR}`, `11. ${REGLE_CODE}`] : []),
    ...profilClara(profil),
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

// ── Compléter la fiche entière (28 oct. 2026) ──────────────────────────────────────────
// Un seul appel propose tous les textes d'une fiche projet, plus des tags tirés des sources.

export type CleFiche = "accroche" | "contexte" | "carte";

/** Les champs de texte d'une fiche projet que l'IA peut compléter, dans l'ordre du formulaire. */
export const CHAMPS_FICHE: { cle: CleFiche; champ: string; max: number; role: string }[] = [
  { cle: "accroche", champ: "Accroche", max: 140, role: "une seule phrase, affichée sur la carte du projet dans la page Projets : ce que le projet est, et ce que Clara y a fait" },
  { cle: "contexte", champ: "Contexte", max: 500, role: "un petit paragraphe de 3 à 5 phrases, en tête de la fiche du projet : le cadre, ce que Clara a réellement réalisé, avec quels outils et quelles méthodes" },
  { cle: "carte", champ: "Accroche de la carte d'accueil", max: 140, role: "une seule phrase, affichée sur la carte du projet à l'accueil, différente de l'accroche si possible" },
];

export interface FicheIA {
  /** Où se trouve la fiche, par exemple « Fiche projet « Booki » · cadre : Formation ». */
  page: string;
  /** Les autres informations de la fiche (cadre, types, tags, étapes, compétences, livrables). */
  infos?: string;
  github?: string;
  /** Textes actuels ; un champ absent n'est pas à compléter (pas de carte d'accueil, par exemple). */
  valeurs: Partial<Record<CleFiche, string>>;
  tags: string[];
}

export function consignesFiche(recruteur: Recruteur, profil?: string): string {
  const r = RECRUTEURS.find((x) => x.id === recruteur) ?? RECRUTEURS[0];
  return [
    `Tu es ${r.role}.`,
    "",
    `Tu aides ${CLARA}, à compléter la fiche d'un projet de son portfolio. Ton objectif : proposer pour chaque champ demandé un texte concret, précis et crédible, construit uniquement à partir des sources fournies (fiche, profil, notes, dépôt GitHub), et repérer les technologies ou méthodes clairement attestées par ces sources qui manquent dans les tags.`,
    "",
    "## Règles absolues",
    `1. ${REGLE_INVENTER}`,
    `2. ${REGLE_CADRE}`,
    `3. ${REGLE_TON}`,
    `4. ${REGLE_NATURE}`,
    `5. ${REGLE_SAVOIR}`,
    `6. ${REGLE_CODE}`,
    "7. Chaque proposition respecte la longueur maximale de son champ, espaces compris, et reste en texte brut, sans Markdown. Garde la voix des textes actuels (« je » ou formulation impersonnelle).",
    "8. Les champs se complètent sans se répéter mot pour mot : l'accroche résume, le contexte détaille.",
    "9. N'allonge jamais artificiellement : si les sources ne permettent pas d'en dire plus, propose ce qui est sourcé, même court, et pose des questions précises. Si un texte actuel est déjà bon, propose-le tel quel.",
    "10. Pour chaque champ, liste dans « nonSourcees » toute information de ta proposition qui ne figure dans aucune source (tableau vide sinon).",
    "11. « tagsProposes » : au plus 5 tags courts (technologie, outil ou méthode) clairement attestés par les sources et absents des tags actuels ; tableau vide sinon.",
    ...profilClara(profil),
  ].join("\n");
}

export function demandeFiche(fiche: FicheIA, sources: Sources = {}): string {
  const champs = CHAMPS_FICHE.filter((c) => fiche.valeurs[c.cle] !== undefined);
  return [
    "## La fiche à compléter",
    `- Emplacement : ${fiche.page}`,
    `- Tags actuels : ${fiche.tags.join(", ") || "aucun"}`,
    "",
    ...champs.flatMap((c) => {
      const v = fiche.valeurs[c.cle] ?? "";
      return [`### ${c.champ} (clé « ${c.cle} ») : ${c.role} ; au plus ${c.max} caractères (actuellement ${v.length})`, `<<<${c.cle.toUpperCase()}`, v.trim() || "(champ vide)", `${c.cle.toUpperCase()}>>>`, ""];
    }),
    ...(fiche.infos?.trim() ? ["## Autres informations de la fiche", "Pour la cohérence uniquement : n'en tire aucun fait qui n'y figure pas.", "", fiche.infos.trim()] : []),
    ...(sources.notes?.trim() ? ["", "## Notes de Clara (source fiable)", sources.notes.trim()] : []),
    ...(sources.depot?.trim() ? ["", "## Dépôt GitHub du projet (source fiable : son propre code)", sources.depot.trim()] : []),
    "",
    "## Ta tâche",
    `Propose un texte pour ${champs.length > 1 ? `chacun de ces champs : ${champs.map((c) => c.cle).join(", ")}` : `le champ ${champs[0]?.cle ?? "accroche"}`}, puis les tags manquants. Laisse « proposition » vide pour un champ qui n'est pas demandé.`,
  ].join("\n");
}

/** Proposition pour un champ de la fiche. */
export interface PropositionChamp {
  proposition: string;
  nonSourcees: string[];
}

/** Réponse structurée de l'IA pour une fiche entière. */
export interface AvisFiche {
  verdict: string;
  pointsForts: string[];
  aAmeliorer: { point: string; raison: string }[];
  questions: string[];
  champs: Partial<Record<CleFiche, PropositionChamp>>;
  tagsProposes: string[];
}

const SCHEMA_CHAMP = {
  type: "object",
  properties: { proposition: { type: "string", description: "Le texte proposé, en texte brut ; vide si le champ n'est pas demandé." }, nonSourcees: { type: "array", items: { type: "string" } } },
  required: ["proposition", "nonSourcees"],
} as const;

export const SCHEMA_FICHE = {
  type: "object",
  properties: {
    verdict: SCHEMA_AVIS.properties.verdict,
    pointsForts: SCHEMA_AVIS.properties.pointsForts,
    aAmeliorer: SCHEMA_AVIS.properties.aAmeliorer,
    questions: SCHEMA_AVIS.properties.questions,
    accroche: SCHEMA_CHAMP,
    contexte: SCHEMA_CHAMP,
    carte: SCHEMA_CHAMP,
    tagsProposes: { type: "array", items: { type: "string" }, description: "Au plus 5 tags attestés par les sources et absents des tags actuels." },
  },
  required: ["verdict", "pointsForts", "aAmeliorer", "questions", "accroche", "contexte", "carte", "tagsProposes"],
} as const;

/** Remet en forme la réponse brute de Gemini pour une fiche ; null si elle est inutilisable. */
export function normaliserFiche(brut: unknown, fiche: Pick<FicheIA, "valeurs" | "tags">): AvisFiche | null {
  if (!brut || typeof brut !== "object") return null;
  const b = brut as Record<string, unknown>;
  const liste = (v: unknown) => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter((s) => s && s.toLowerCase() !== "aucune") : []);
  const champs: AvisFiche["champs"] = {};
  for (const c of CHAMPS_FICHE) {
    if (fiche.valeurs[c.cle] === undefined) continue;
    const v = b[c.cle] as { proposition?: unknown; nonSourcees?: unknown } | undefined;
    const proposition = typeof v?.proposition === "string" ? v.proposition.trim() : "";
    if (proposition) champs[c.cle] = { proposition, nonSourcees: liste(v?.nonSourcees) };
  }
  if (typeof b.verdict !== "string" || Object.keys(champs).length === 0) return null;
  const deja = new Set(fiche.tags.map((t) => t.toLowerCase()));
  return {
    verdict: b.verdict,
    pointsForts: liste(b.pointsForts),
    aAmeliorer: Array.isArray(b.aAmeliorer) ? b.aAmeliorer.map((a) => ({ point: String(a?.point ?? ""), raison: String(a?.raison ?? "") })).filter((a) => a.point) : [],
    questions: liste(b.questions),
    champs,
    tagsProposes: [...new Set(liste(b.tagsProposes))].filter((t) => !deja.has(t.toLowerCase())).slice(0, 5),
  };
}

/** Prompt complet à copier dans Claude pour la fiche entière (mode de secours). */
export function promptFiche(fiche: FicheIA, recruteur: Recruteur, profil?: string, sources: Sources = {}): string {
  const champs = CHAMPS_FICHE.filter((c) => fiche.valeurs[c.cle] !== undefined);
  return [
    consignesFiche(recruteur, profil),
    "",
    demandeFiche(fiche, sources),
    "",
    "## Format de ta réponse (respecte-le exactement)",
    "**Verdict** : 1 ou 2 phrases sur la fiche.",
    "",
    "**Questions pour Clara** : seulement si une information manque ; sinon écris « Aucune ».",
    "",
    "**Propositions** : chaque texte entre ses 2 marqueurs, chacun seul sur sa ligne, suivi de la liste de ce qui n'est pas sourcé :",
    ...champs.flatMap((c) => [`<<<${c.cle.toUpperCase()}`, `(${c.champ.toLowerCase()} proposée)`, `${c.cle.toUpperCase()}>>>`]),
    "",
    "**Tags proposés** : entre ces marqueurs, séparés par des virgules (vide si aucun) :",
    "<<<TAGS",
    "(tag 1, tag 2)",
    "TAGS>>>",
  ].join("\n");
}

const entre = (reponse: string, cle: string) => reponse.match(new RegExp(`<<<\\s*${cle}\\s*\\n([\\s\\S]*?)\\n\\s*${cle}\\s*>>>`))?.[1]?.trim() ?? "";

/** Extrait les propositions d'une réponse de Claude recollée ; null si aucun marqueur n'est trouvé. */
export function extraireFiche(reponse: string, fiche: Pick<FicheIA, "valeurs" | "tags">): Pick<AvisFiche, "champs" | "tagsProposes"> | null {
  const champs: AvisFiche["champs"] = {};
  for (const c of CHAMPS_FICHE) {
    const t = fiche.valeurs[c.cle] !== undefined ? entre(reponse, c.cle.toUpperCase()) : "";
    if (t) champs[c.cle] = { proposition: t, nonSourcees: [] };
  }
  if (Object.keys(champs).length === 0) return null;
  const deja = new Set(fiche.tags.map((t) => t.toLowerCase()));
  const tags = entre(reponse, "TAGS")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t && !deja.has(t.toLowerCase()));
  return { champs, tagsProposes: [...new Set(tags)].slice(0, 5) };
}
