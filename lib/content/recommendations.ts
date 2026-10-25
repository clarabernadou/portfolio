// Transcrit depuis docs/passation/contenu/accueil.txt (citation courte) et
// data/recommandations.json (texte intégral, pour la fenêtre « Lire en entier »).
import type { Recommendation } from "../types";
import recommandationsData from "@/data/recommandations.json";
import liensData from "@/data/liens.json";

function initiales(nom: string): string {
  return nom
    .split(" ")
    .map((mot) => mot[0])
    .join("")
    .toUpperCase();
}

// data/recommandations.json donne un chemin relatif au dossier de passation (assets/...) ;
// le fichier est servi depuis la racine du site (public/...).
function publicPdfHref(assetPath?: string | null): string | undefined {
  if (!assetPath) return undefined;
  return `/${assetPath.split("/").pop()}`;
}

export const recommendations: Recommendation[] = recommandationsData.items.map((item) => ({
  initiales: initiales(item.name),
  auteur: item.name,
  // Profils LinkedIn fournis par Clara (data/liens.json, recommandations).
  linkedin: liensData.recommandations.find((l) => l.auteur === item.name)?.linkedin ?? item.linkedin,
  poste: item.role,
  relation: item.context,
  citationCourte: item.excerpt,
  texteIntegral: item.fullText,
  lettrePdf: publicPdfHref(item.letterPdf),
  entrepriseHref: "company" in item ? item.company : undefined,
}));
