import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Connexion à la base MySQL (TiDB Cloud) par l'adaptateur officiel de Prisma 7.
// DATABASE_URL vient de .env.local en local et des variables Vercel en ligne.
// TiDB Cloud exige TLS : il est activé dès que l'hôte n'est pas local.
export function adapterFromUrl(url: string) {
  const u = new URL(url);
  const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
  return new PrismaMariaDb({
    host: u.hostname,
    port: Number(u.port || 4000),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    // Le délai par défaut du pool (1 s) ne suffit pas à la poignée de main TLS
    // avec TiDB Cloud (Francfort) : la connexion échouait au premier appel.
    connectTimeout: 10_000,
    acquireTimeout: 15_000,
    ...(local ? {} : { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } }),
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function db(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL manquante (voir .env.example).");
    globalForPrisma.prisma = new PrismaClient({ adapter: adapterFromUrl(url) });
  }
  return globalForPrisma.prisma;
}
