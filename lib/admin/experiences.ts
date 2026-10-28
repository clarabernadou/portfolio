import type { ExperienceBloc } from "@/lib/types";

// Blocs d'une expérience à l'écran ⇄ en base. Le CV n'a plus qu'une version (décision de
// Clara, 28 oct. 2026) : une puce est un simple texte, rangé dans « bulletsEssentiel ».
export interface BlocInput {
  name: string;
  period: string;
  puces: string[];
}

export function toBloc(b: ExperienceBloc): BlocInput {
  return { name: b.name ?? "", period: b.period ?? "", puces: [...(b.bulletsEssentiel ?? [])] };
}

export function fromBloc(b: BlocInput): ExperienceBloc {
  return {
    ...(b.name.trim() ? { name: b.name.trim() } : {}),
    ...(b.period.trim() ? { period: b.period.trim() } : {}),
    bulletsEssentiel: b.puces.map((p) => p.trim()).filter(Boolean),
  };
}
