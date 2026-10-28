import type { NextConfig } from "next";

// Référencement : l'ancienne adresse vercel.app redirige définitivement (308) vers le nom
// de domaine (clarabernadou.fr depuis le 28 octobre 2026), page par page : une seule
// adresse indexée par Google. Les déploiements de prévisualisation ne sont pas touchés.
const ANCIENNE_ADRESSE = "clarabernadou-portfolio-2026.vercel.app";
const domaine = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://clarabernadou.fr").host;

const PDF = ["./public/fonts/**", "./public/photo-clara.jpg", "./node_modules/@sparticuz/chromium/bin/**", "./node_modules/playwright-core/**"];

const nextConfig: NextConfig = {
  async redirects() {
    if (domaine === ANCIENNE_ADRESSE) return [];
    return [{ source: "/:path*", has: [{ type: "host", value: ANCIENNE_ADRESSE }], destination: `https://${domaine}/:path*`, permanent: true }];
  },
  /* config options here */
  // Génération des PDF du CV sur Vercel (étape 10) : Chromium « serverless » reste hors
  // du bundle, et les fonctions de l'administration embarquent polices et photo.
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  // Seules les 2 pages qui génèrent un PDF embarquent Chromium (environ 80 Mo) : l'inclure dans
  // toute l'administration faisait dépasser le stockage gratuit des fonctions de Vercel.
  outputFileTracingIncludes: {
    // Pages /admin/(espace)/profil et /admin/(espace)/profil/cv-oriente/[id] : parenthèses et
    // crochets étant des caractères de motif, on passe par des jokers.
    "/admin/*/profil/**": PDF,
  },
  // Envoi de la photo du profil depuis l'administration (2 Mo au plus, plus l'enveloppe).
  experimental: {
    serverActions: { bodySizeLimit: "3mb" },
  },
  // En-têtes de sécurité (ADMIN-et-SYNCHRONISATION.md, §2), sur tout le site.
  async headers() {
    const securite = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    ];
    return [
      { source: "/((?!admin).*)", headers: [...securite, { key: "X-Frame-Options", value: "SAMEORIGIN" }] },
      {
        source: "/admin/:path*",
        headers: [
          ...securite,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
