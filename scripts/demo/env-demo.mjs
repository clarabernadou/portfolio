// Environnement du mode démo : base de données FICTIVE, jamais la base du site.
// Utilisé par donnees-demo.ts, serveur-demo.mjs et captures-demo.mjs.
//
// - Base : DEMO_DATABASE_URL si elle est définie, sinon la base « portfolio_demo » sur le même
//   serveur que DATABASE_URL. Son nom doit contenir « demo », sinon tout s'arrête.
// - Session : un secret et un identifiant d'administratrice propres à la démo. Un jeton de démo
//   ne peut donc jamais ouvrir l'administration en ligne (signée avec un autre secret).
// - Jetons externes vidés (Vercel Blob, GitHub, OAuth) : une valeur vide n'est pas remplacée
//   par .env.local (Next.js et Node ne complètent que les variables absentes).

try {
  process.loadEnvFile(".env.local");
} catch {
  // Pas de .env.local : DEMO_DATABASE_URL doit alors être fournie.
}

export const DEMO_PORT = 3100;
export const DEMO_BASE = `http://localhost:${DEMO_PORT}`;
export const DEMO_SECRET = "demo-portfolio-donnees-fictives-jamais-en-production";
export const DEMO_ADMIN_ID = "100000001";

export function demoDatabaseUrl() {
  let url = process.env.DEMO_DATABASE_URL;
  if (!url) {
    if (!process.env.DATABASE_URL) throw new Error("Ni DEMO_DATABASE_URL ni DATABASE_URL : impossible de trouver le serveur de base de données.");
    const u = new URL(process.env.DATABASE_URL);
    u.pathname = "/portfolio_demo";
    url = u.toString();
  }
  const nom = new URL(url).pathname.slice(1);
  const site = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).pathname.slice(1) : null;
  if (!/demo/i.test(nom) || nom === site) {
    throw new Error(`Base « ${nom} » refusée : le mode démo n’écrit que dans une base dont le nom contient « demo », distincte de celle du site.`);
  }
  return url;
}

export function demoEnv() {
  return {
    ...process.env,
    DATABASE_URL: demoDatabaseUrl(),
    DEMO_DONNEES_FICTIVES: "1",
    NEXTAUTH_URL: DEMO_BASE,
    NEXTAUTH_SECRET: DEMO_SECRET,
    ADMIN_GITHUB_ID: DEMO_ADMIN_ID,
    NEXT_PUBLIC_SITE_URL: DEMO_BASE,
    BLOB_READ_WRITE_TOKEN: "",
    GITHUB_SYNC_TOKEN: "",
    GITHUB_CLIENT_ID: "",
    GITHUB_CLIENT_SECRET: "",
    CRON_SECRET: "",
  };
}
