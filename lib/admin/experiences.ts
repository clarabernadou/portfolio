import type { ExperienceBloc } from "@/lib/types";

// Puces d'une expérience : liste unique avec drapeaux (écran) ⇄ deux listes (base).
export interface Puce {
  text: string;
  essentiel: boolean;
  complet: boolean;
}

export interface BlocInput {
  name: string;
  period: string;
  puces: Puce[];
  technologies: string[];
}

// Une puce présente dans les deux versions (même texte) porte les deux drapeaux ;
// sinon chaque texte garde le drapeau de sa version. La fusion garde l'ordre des
// deux listes : réenregistrer sans rien changer ne modifie pas le CV.
export function toBloc(b: ExperienceBloc): BlocInput {
  const puces = b.bulletsComplet.map((text) => ({ text, essentiel: b.bulletsEssentiel.includes(text), complet: true }));
  let pending: string[] = [];
  for (const text of b.bulletsEssentiel) {
    if (!b.bulletsComplet.includes(text)) {
      pending.push(text);
      continue;
    }
    const at = puces.findIndex((p) => p.text === text);
    puces.splice(at, 0, ...pending.map((t) => ({ text: t, essentiel: true, complet: false })));
    pending = [];
  }
  puces.push(...pending.map((t) => ({ text: t, essentiel: true, complet: false })));
  return { name: b.name ?? "", period: b.period ?? "", puces, technologies: b.technologies ?? [] };
}

export function fromBloc(b: BlocInput): ExperienceBloc {
  return {
    ...(b.name.trim() ? { name: b.name.trim() } : {}),
    ...(b.period.trim() ? { period: b.period.trim() } : {}),
    bulletsEssentiel: b.puces.filter((p) => p.essentiel && p.text.trim()).map((p) => p.text.trim()),
    bulletsComplet: b.puces.filter((p) => p.complet && p.text.trim()).map((p) => p.text.trim()),
    ...(b.technologies.length ? { technologies: b.technologies } : {}),
  };
}
