// Formats de livrables acceptés (demande de Clara, 25 oct. 2026) : pas seulement des PDF,
// mais aussi des images, des documents Word, des présentations, des tableurs, des vidéos…

const FORMATS: { ext: string[]; nom: string; mime: string[] }[] = [
  { ext: ["pdf"], nom: "PDF", mime: ["application/pdf"] },
  { ext: ["png", "jpg", "jpeg", "webp", "gif"], nom: "Image", mime: ["image/png", "image/jpeg", "image/webp", "image/gif"] },
  { ext: ["doc", "docx", "odt", "rtf"], nom: "Document", mime: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.oasis.opendocument.text", "application/rtf"] },
  { ext: ["ppt", "pptx", "odp", "key"], nom: "Présentation", mime: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.oasis.opendocument.presentation", "application/vnd.apple.keynote"] },
  { ext: ["xls", "xlsx", "ods", "csv"], nom: "Tableur", mime: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.oasis.opendocument.spreadsheet", "text/csv"] },
  { ext: ["mp4", "webm", "mov"], nom: "Vidéo", mime: ["video/mp4", "video/webm", "video/quicktime"] },
  { ext: ["zip"], nom: "Archive ZIP", mime: ["application/zip", "application/x-zip-compressed"] },
  { ext: ["txt", "md"], nom: "Texte", mime: ["text/plain", "text/markdown"] },
];

// Extension du dernier segment du chemin seulement : « https://site.io » n'a pas d'extension « io ».
const extension = (href: string) => {
  const nom = href.split(/[?#]/)[0].replace(/^https?:\/\/[^/]+/i, "").split("/").pop() ?? "";
  return nom.includes(".") ? (nom.split(".").pop()?.toLowerCase() ?? "") : "";
};

/** Nom lisible du format d'un livrable (« PDF », « Image », « Document »…), d'après son adresse. */
export function formatLivrable(href: string | null | undefined): string {
  if (!href) return "Fichier";
  // Liens vers un service plutôt qu'un fichier (dépôt de code, maquette en ligne…).
  const hote = /^https?:\/\/(?:www\.)?([^/]+)/i.exec(href)?.[1]?.toLowerCase() ?? "";
  if (hote === "github.com") return "GitHub";
  if (hote.endsWith("figma.com")) return "Figma";
  const ext = extension(href);
  const connu = FORMATS.find((f) => f.ext.includes(ext))?.nom;
  if (connu) return connu;
  // Une page en ligne (documentation, site, prototype…) est un lien, pas un fichier (demande de
  // Clara, 1er nov. 2026). Seuls les fichiers envoyés sur Vercel Blob ou servis par le site gardent
  // leur extension.
  if (hote && !hote.endsWith("blob.vercel-storage.com")) return "Lien";
  return ext && ext.length <= 5 ? ext.toUpperCase() : "Fichier";
}

export const estImage = (href: string | null | undefined) => formatLivrable(href) === "Image";

/** Types acceptés à l'envoi (Vercel Blob) et attribut accept du champ fichier. Ni HTML ni SVG ni script. */
export const MIME_LIVRABLES = FORMATS.flatMap((f) => f.mime);
export const ACCEPT_LIVRABLES = FORMATS.flatMap((f) => f.ext.map((e) => `.${e}`)).join(",");
