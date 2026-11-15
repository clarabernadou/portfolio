import { ogPage } from "@/lib/og";

// Image de partage propre à la page (lib/og.tsx).
const og = ogPage("Projets", "Développement web et design UX/UI");
export const alt = og.alt;
export const size = og.size;
export const contentType = og.contentType;
export default og.image;
