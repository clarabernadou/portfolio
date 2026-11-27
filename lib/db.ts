import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { normaliserTypoProfond } from "@/lib/typographie";

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

// Typographie à l'enregistrement (27 nov. 2026) : les textes des contenus sont normalisés (lib/typographie.ts) avant
// d'être écrits, pour que la base reste propre. Seulement les contenus affichés ; jamais les fichiers, le journal ni
// les réglages techniques (pour Singleton : seulement les clés de contenu).
const SINGLETONS_CONTENU = new Set(["profil", "ia", "formationsCourtes"]);
type Args = { data?: unknown; create?: unknown; update?: unknown; where?: { key?: string } };
const normaliserArgs = (args: Args) => ({
  ...args,
  ...(args.data !== undefined ? { data: normaliserTypoProfond(args.data) } : {}),
  ...(args.create !== undefined ? { create: normaliserTypoProfond(args.create) } : {}),
  ...(args.update !== undefined ? { update: normaliserTypoProfond(args.update) } : {}),
});
const MODELES_CONTENU = new Set(["Project", "Formation", "Experience", "SkillGroup", "Category", "Recommendation", "Singleton"]);
const ECRITURES = new Set(["create", "update", "upsert", "createMany", "updateMany"]);
const cleSingleton = (a: Args) =>
  String(a.where?.key ?? (a.data as { key?: string } | undefined)?.key ?? (a.create as { key?: string } | undefined)?.key ?? "");
function avecTypographie(client: PrismaClient): PrismaClient {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const a = args as Args;
          const contenu = MODELES_CONTENU.has(model) && ECRITURES.has(operation) && (model !== "Singleton" || SINGLETONS_CONTENU.has(cleSingleton(a)));
          return query((contenu ? normaliserArgs(a) : args) as typeof args);
        },
      },
    },
  }) as unknown as PrismaClient;
}

export function db(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL manquante (voir .env.example).");
    globalForPrisma.prisma = avecTypographie(new PrismaClient({ adapter: adapterFromUrl(url) }));
  }
  return globalForPrisma.prisma;
}
