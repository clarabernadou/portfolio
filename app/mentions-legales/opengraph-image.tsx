import { ogPage } from "@/lib/og";

// Image de partage propre à la page (lib/og.tsx).
const og = ogPage("Mentions légales", "Et confidentialité");
export const alt = og.alt;
export const size = og.size;
export const contentType = og.contentType;
export default og.image;
