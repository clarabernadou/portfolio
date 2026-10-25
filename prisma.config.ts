import { defineConfig } from "prisma/config";

// Les secrets restent dans .env.local (ignoré par Git), comme pour Next.js.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Pas de .env.local (CI, Vercel) : les variables viennent de l'environnement.
}

// TiDB Cloud refuse les connexions non chiffrées : pour les migrations, on exige
// TLS dès que la base n'est pas locale (le site, lui, passe par lib/db.ts).
function withTls(url: string | undefined): string {
  if (!url) return "";
  const u = new URL(url);
  const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
  if (!local && !u.searchParams.has("sslaccept")) u.searchParams.set("sslaccept", "strict");
  return u.toString();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: withTls(process.env.DATABASE_URL),
  },
});
