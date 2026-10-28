import type { NextConfig } from "next";

// Référencement : l'ancienne adresse vercel.app redirige définitivement (308) vers le nom
// de domaine (clarabernadou.fr depuis le 28 octobre 2026), page par page : une seule
// adresse indexée par Google. Les déploiements de prévisualisation ne sont pas touchés.
const ANCIENNE_ADRESSE = "clarabernadou-portfolio-2026.vercel.app";
const domaine = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://clarabernadou.fr").host;

const PDF = ["./public/fonts/**", "./public/photo-clara.jpg", "./node_modules/@sparticuz/chromium/bin/**", "./node_modules/playwright-core/**"];

// Politique de sécurité du contenu (renforcement du 28 octobre 2026) : le navigateur ne charge que
// les ressources des domaines réellement utilisés. Next.js insère de petits scripts en ligne,
// d'où 'unsafe-inline' (un nonce rendrait toutes les pages dynamiques et casserait le cache).
const DEV = process.env.NODE_ENV !== "production";
const BLOB = "https://*.public.blob.vercel-storage.com";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${DEV ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  `img-src 'self' data: blob: ${BLOB}`,
  `media-src 'self' ${BLOB}`,
  // Vidéos YouTube (chargées au clic) et livrables PDF.
  `frame-src 'self' https://www.youtube-nocookie.com ${BLOB}`,
  // Envoi des livrables du navigateur vers Vercel Blob (administration).
  `connect-src 'self' https://vercel.com https://*.vercel-storage.com${DEV ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  // La connexion à l'administration passe par GitHub.
  "form-action 'self' https://github.com",
  "frame-ancestors 'none'",
  ...(DEV ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  // N'annonce pas la technologie du serveur (en-tête X-Powered-By).
  poweredByHeader: false,
  async redirects() {
    if (domaine === ANCIENNE_ADRESSE) return [];
    return [{ source: "/:path*", has: [{ type: "host", value: ANCIENNE_ADRESSE }], destination: `https://${domaine}/:path*`, permanent: true }];
  },
  /* config options here */
  // Génération des PDF du CV sur Vercel (étape 10) : Chromium « serverless » reste hors
  // du bundle, et les fonctions de l'administration embarquent polices et photo.
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  // Seule la page qui génère le PDF embarque Chromium (environ 80 Mo) : l'inclure dans
  // toute l'administration faisait dépasser le stockage gratuit des fonctions de Vercel.
  outputFileTracingIncludes: {
    // Page /admin/(espace)/profil : les parenthèses étant des caractères de motif, on passe par des jokers.
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
      { key: "Content-Security-Policy", value: CSP },
      // Le site n'a aucune raison d'être affiché dans le cadre d'un autre site (anti-clickjacking).
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ];
    return [
      { source: "/((?!admin).*)", headers: securite },
      {
        source: "/admin/:path*",
        headers: [
          ...securite,
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
