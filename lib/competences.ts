// Compétences mises en pratique d'une fiche projet (24 nov. 2026) : ajout d'une nouvelle compétence depuis
// l'administration. Une compétence ajoutée est cochée, enregistrée avec la fiche, puis proposée sur les autres fiches
// du même cadre (suggestions calculées d'après la base). Doublons refusés sans tenir compte de la casse, des accents,
// des espaces ni du point final ; 80 caractères au plus. Les compétences existantes ne sont pas modifiées.
// Sans dépendance serveur.

export const COMPETENCE_MAX = 80;

/** Clé de comparaison : minuscules, sans accents, espaces réduits, sans point final. */
export const cleCompetence = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[.\s]+$/, "")
    .trim();

export type ResultatAjout =
  | { ok: true; cochees: string[]; message: string }
  | { ok: false; message: string };

/**
 * Ajoute une compétence saisie. `cochees` : compétences cochées sur la fiche ; `proposees` : celles de la liste (autres
 * fiches du même cadre). Une compétence déjà proposée mais non cochée est cochée, sous son écriture existante.
 */
export function ajouterCompetence(saisie: string, cochees: string[], proposees: string[]): ResultatAjout {
  const texte = saisie.replace(/\s+/g, " ").trim();
  if (!texte) return { ok: false, message: "Écris la compétence avant de valider." };
  if (texte.length > COMPETENCE_MAX) return { ok: false, message: `${COMPETENCE_MAX} caractères au plus (${texte.length}).` };
  const cle = cleCompetence(texte);
  const dejaCochee = cochees.find((c) => cleCompetence(c) === cle);
  if (dejaCochee) return { ok: false, message: `« ${dejaCochee} » est déjà cochée.` };
  const proposee = proposees.find((c) => cleCompetence(c) === cle);
  if (proposee) return { ok: true, cochees: [...cochees, proposee], message: `« ${proposee} » existait déjà dans la liste : elle est cochée.` };
  return { ok: true, cochees: [...cochees, texte], message: `« ${texte} » ajoutée et cochée.` };
}

/** Contrôle à l'enregistrement : pas de doublon, pas de compétence trop longue. */
export function verifierCompetences(liste: string[]): { ok: true; data: string[] } | { ok: false; error: string } {
  const vues = new Set<string>();
  const data: string[] = [];
  for (const brute of liste) {
    const c = brute.replace(/\s+/g, " ").trim();
    if (!c) continue;
    if (c.length > COMPETENCE_MAX) return { ok: false, error: `Compétence « ${c.slice(0, 40)}… » : ${COMPETENCE_MAX} caractères au plus.` };
    const cle = cleCompetence(c);
    if (vues.has(cle)) continue;
    vues.add(cle);
    data.push(c);
  }
  return { ok: true, data };
}
