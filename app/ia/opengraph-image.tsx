import { notFound } from "next/navigation";
import { getIaPubliee } from "@/lib/data";
import { ogPage } from "@/lib/og";

// Image de partage propre à la page (lib/og.tsx) ; 404 quand la page IA est masquée (23 nov. 2026).
const og = ogPage("Ma façon de travailler avec l’IA", "Outils, skills et routines");
export const alt = og.alt;
export const size = og.size;
export const contentType = og.contentType;
export default async function Image() {
  if (!(await getIaPubliee())) notFound();
  return og.image();
}
