import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Génération des PDF du CV sur Vercel (étape 10) : Chromium « serverless » reste hors
  // du bundle, et les fonctions de l'administration embarquent polices et photo.
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    "/admin/**": ["./public/fonts/**", "./public/photo-clara.jpg", "./node_modules/@sparticuz/chromium/bin/**", "./node_modules/playwright-core/**"],
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
