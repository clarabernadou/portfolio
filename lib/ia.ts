import iaData from "@/data/ia.json";
import type { IaContent } from "./types";

// Repères déjà calculés et validés dans data/ia.json (README §5) : passage
// typé tel quel, sans recalcul qui risquerait de diverger du chiffre validé.
export function getIaContent(): IaContent {
  return iaData as IaContent;
}
