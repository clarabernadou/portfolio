import type { NextConfig } from "next";

// Référencement : l'ancienne adresse vercel.app redirige définitivement (308) vers le nom
// de domaine (clarabernadou.fr depuis le 28 octobre 2026), page par page : une seule
// adresse indexée par Google. Les déploiements de prévisualisation ne sont pas touchés.
const ANCIENNE_ADRESSE = "clarabernadou-portfolio-2026.vercel.app";
const domaine = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://clarabernadou.fr").host;

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
    // Anciens fichiers du CV (jusqu'au 12 nov. 2026) : vers le CV actuel.
    const anciensCv = ["/CV_Clara_Bernadou_FR.pdf", "/CV_Clara_Bernadou_FR_texte.pdf"].map((source) => ({ source, destination: "/media/cv/CV_Clara_Bernadou_Developpeuse_Full_Stack.pdf", permanent: true }));
    if (domaine === ANCIENNE_ADRESSE) return anciensCv;
    return [{ source: "/:path*", has: [{ type: "host", value: ANCIENNE_ADRESSE }], destination: `https://${domaine}/:path*`, permanent: true }, ...anciensCv];
  },
  // Chromium « serverless » reste hors du bundle (rapport RGAA, scripts). Depuis le 12 nov. 2026,
  // le CV n'est plus généré sur Vercel : aucune fonction n'embarque Chromium.
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  // Envoi de la photo du profil (2 Mo au plus) et du CV en PDF (2,5 Mo au plus), plus l'enveloppe.
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
