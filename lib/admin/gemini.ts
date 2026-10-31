// Outils sans dépendance pour l'appel à Gemini (app/api/admin/avis-ia/route.ts, 31 oct. 2026) :
// lecture de la réponse au fil de l'eau (SSE) et heure exacte de déblocage du quota gratuit.

/** Un événement du flux de l'API Interactions (`event:` et `data:` JSON). */
export type EvenementSse = { event: string; data: Record<string, unknown> };

/** Découpe le texte reçu en événements complets ; le reste (événement incomplet) est rendu. */
export function lireSse(tampon: string): { evenements: EvenementSse[]; reste: string } {
  const blocs = tampon.replace(/\r\n/g, "\n").split("\n\n");
  const reste = blocs.pop() ?? "";
  const evenements = blocs.flatMap((bloc) => {
    let event = "";
    const data: string[] = [];
    for (const ligne of bloc.split("\n")) {
      if (ligne.startsWith("event:")) event = ligne.slice(6).trim();
      else if (ligne.startsWith("data:")) data.push(ligne.slice(5).trim());
    }
    const brut = data.join("\n");
    if (!brut || brut === "[DONE]") return [];
    try {
      const json = JSON.parse(brut) as Record<string, unknown>;
      return [{ event: event || String(json.event_type ?? ""), data: json }];
    } catch {
      return [];
    }
  });
  return { evenements, reste };
}

/** Décalage (en ms) d'un fuseau horaire par rapport à UTC à un instant donné. */
function decalage(instant: number, fuseau: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: fuseau, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" })
      .formatToParts(new Date(instant))
      .map((x) => [x.type, Number(x.value)]),
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(instant / 1000) * 1000;
}

/** Prochain minuit heure du Pacifique : remise à zéro du quota quotidien de Gemini. */
export function prochainMinuitPacifique(maintenant: Date): Date {
  const fuseau = "America/Los_Angeles";
  const local = new Date(maintenant.getTime() + decalage(maintenant.getTime(), fuseau));
  const minuit = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + 1);
  // Le décalage est celui de l'instant visé (heure d'été ou d'hiver).
  return new Date(minuit - decalage(minuit - decalage(minuit, fuseau), fuseau));
}

export type Quota = { type: "minute" | "jour" | "inconnu"; reprise: Date; repriseJour?: Date };

/**
 * Lit une erreur 429 de Google : quota du jour (« PerDay ») ou de la minute (« retryDelay »).
 * Si Google ne dit pas lequel, les deux heures possibles sont données.
 */
export function lireQuota(corps: string, maintenant: Date): Quota {
  const jour = prochainMinuitPacifique(maintenant);
  if (/PerDay|per day|daily/i.test(corps)) return { type: "jour", reprise: jour };
  const delai = /"retry_?[dD]elay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(corps);
  if (delai) return { type: "minute", reprise: new Date(maintenant.getTime() + Math.ceil(Number(delai[1])) * 1000) };
  if (/PerMinute|per minute/i.test(corps)) return { type: "minute", reprise: new Date(maintenant.getTime() + 60_000) };
  return { type: "inconnu", reprise: new Date(maintenant.getTime() + 60_000), repriseJour: jour };
}

/** « 14 h 05 », ou « demain à 9 h 00 », ou « le 2 nov. à 9 h 00 », heure de Paris. */
export function heureDeParis(instant: Date, maintenant: Date): string {
  const fuseau = "Europe/Paris";
  const jour = (d: Date) => new Intl.DateTimeFormat("fr-FR", { timeZone: fuseau, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const p = Object.fromEntries(new Intl.DateTimeFormat("fr-FR", { timeZone: fuseau, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(instant).map((x) => [x.type, x.value]));
  const proche = instant.getTime() - maintenant.getTime() < 10 * 60_000;
  const heure = `${Number(p.hour)} h ${p.minute}${proche ? ` min ${p.second} s` : ""}`;
  if (jour(instant) === jour(maintenant)) return `à ${heure}`;
  if (jour(instant) === jour(new Date(maintenant.getTime() + 86_400_000))) return `demain à ${heure}`;
  return `le ${new Intl.DateTimeFormat("fr-FR", { timeZone: fuseau, day: "numeric", month: "short" }).format(instant)} à ${heure}`;
}

/** Message honnête sur le quota épuisé, avec l'heure exacte de déblocage. */
export function messageQuota(q: Quota, maintenant: Date): string {
  if (q.type === "jour")
    return `Plus de crédit gratuit Gemini pour aujourd’hui : le quota quotidien est épuisé. Il se débloque ${heureDeParis(q.reprise, maintenant)} (heure de Paris, minuit en Californie). D’ici là, utilise l’option Claude.`;
  if (q.type === "minute") return `Trop de demandes en une minute pour l’offre gratuite de Gemini : réessaie ${heureDeParis(q.reprise, maintenant)} (heure de Paris).`;
  return `Quota gratuit de Gemini atteint, sans que Google précise lequel : si c’est la limite par minute, réessaie ${heureDeParis(q.reprise, maintenant)} ; si c’est la limite du jour, elle se débloque ${heureDeParis(q.repriseJour ?? q.reprise, maintenant)} (heure de Paris).`;
}
