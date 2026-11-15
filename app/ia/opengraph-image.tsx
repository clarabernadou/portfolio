import { ogPage } from "@/lib/og";

// Image de partage propre à la page (lib/og.tsx).
const og = ogPage("Ma façon de travailler avec l’IA", "Outils, skills et routines");
export const alt = og.alt;
export const size = og.size;
export const contentType = og.contentType;
export default og.image;
