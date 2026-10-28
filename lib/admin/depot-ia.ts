// Résumé d'un dépôt GitHub de Clara, source du mode « Compléter » de l'avis de l'IA :
// README, langages, fichiers à la racine, dépendances et, sans README, le code des
// fichiers principaux. Seuls les dépôts publics de Clara sont lus (jamais un autre compte).
import { parseRepoUrl } from "./github";

const PROPRIETAIRE = "clarabernadou";
// Assez pour décrire le projet, assez peu pour que Gemini réponde avant le délai de coupure.
const LIMITE = 8_000;
const SOURCES = /\.(html?|css|scss|js|jsx|ts|tsx|java|vue|md)$/i;

// Délai de coupure fait main (voir app/api/admin/avis-ia/route.ts) : GitHub ne doit jamais bloquer l'analyse.
async function lire(url: string, brut = false): Promise<unknown> {
  const ctrl = new AbortController();
  const minuterie = setTimeout(() => ctrl.abort(), 6000);
  const headers: Record<string, string> = { Accept: brut ? "application/vnd.github.raw" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_SYNC_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_SYNC_TOKEN}`;
  try {
    const coupure = new Promise<never>((_, rejeter) => ctrl.signal.addEventListener("abort", () => rejeter(new Error("délai"))));
    const r = await Promise.race([fetch(url, { headers, cache: "no-store", signal: ctrl.signal }), coupure]);
    if (!r.ok) return null;
    return await Promise.race([brut ? r.text() : r.json(), coupure]);
  } catch {
    return null;
  } finally {
    clearTimeout(minuterie);
  }
}

/** Texte décrivant le dépôt, ou chaîne vide (adresse absente, autre compte, dépôt illisible). */
export async function resumeDepot(adresse?: string): Promise<string> {
  const r = adresse ? parseRepoUrl(adresse) : null;
  if (!r || r.owner.toLowerCase() !== PROPRIETAIRE) return "";
  const api = `https://api.github.com/repos/${r.owner}/${r.repo}`;
  const [infos, langages, racine, readme] = await Promise.all([lire(api), lire(`${api}/languages`), lire(`${api}/contents`), lire(`${api}/readme`, true)]);
  if (!infos) return "";
  const fichiers = Array.isArray(racine) ? (racine as { name: string; type: string; size: number; download_url: string | null }[]) : [];
  const parties = [`Adresse : https://github.com/${r.owner}/${r.repo}`];
  const desc = (infos as { description?: string | null }).description;
  if (desc) parties.push(`Description : ${desc}`);
  if (langages && typeof langages === "object") parties.push(`Langages : ${Object.keys(langages).join(", ")}`);
  parties.push(`Fichiers et dossiers à la racine : ${fichiers.map((f) => (f.type === "dir" ? `${f.name}/` : f.name)).join(", ")}`);

  let reste = LIMITE;
  const ajouter = (titre: string, brut: string) => {
    if (reste <= 0) return;
    // Code compacté : sans commentaires ni espaces superflus, il en dit autant en 2 à 3 fois moins de place.
    const contenu = brut.replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim();
    const extrait = contenu.slice(0, Math.min(reste, 5000));
    reste -= extrait.length;
    parties.push(`\n### ${titre}${extrait.length < contenu.length ? " (extrait)" : ""}\n${extrait}`);
  };
  if (typeof readme === "string" && readme.trim()) ajouter("README", readme);
  const paquet = fichiers.find((f) => f.name === "package.json");
  if (paquet?.download_url) {
    const p = (await lire(paquet.download_url, true)) as string | null;
    try {
      const j = JSON.parse(p ?? "") as { dependencies?: object; devDependencies?: object };
      parties.push(`Dépendances (package.json) : ${[...Object.keys(j.dependencies ?? {}), ...Object.keys(j.devDependencies ?? {})].join(", ")}`);
    } catch {
      /* package.json illisible : ignoré */
    }
  }
  // Sans README, le code des fichiers principaux de la racine montre ce qui a été réalisé.
  if (!(typeof readme === "string" && readme.trim())) {
    for (const f of fichiers.filter((x) => x.type === "file" && SOURCES.test(x.name) && x.size < 60_000 && x.download_url).slice(0, 6)) {
      const contenu = (await lire(f.download_url!, true)) as string | null;
      if (contenu) ajouter(`Fichier ${f.name}`, contenu);
    }
  }
  return parties.join("\n");
}
