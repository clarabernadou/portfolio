import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter, ToTop } from "@/components/proto/SiteChrome";
import { getProfile } from "@/lib/data";
import { siteUrl } from "@/lib/site-url";
import { css } from "@/lib/css";
import { ScrollToTop } from "@/components/ScrollToTop";

const defaultDescription = "Portfolio de Clara Bernadou, développeuse front-end (React, TypeScript) & UI/UX designer.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Clara Bernadou",
    template: "%s — Clara Bernadou",
  },
  description: defaultDescription,
  applicationName: "Clara Bernadou",
  authors: [{ name: "Clara Bernadou" }],
  creator: "Clara Bernadou",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  // Code de vérification Google Search Console (propriété « préfixe d'URL »), si défini.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Clara Bernadou",
    title: "Clara Bernadou",
    description: defaultDescription,
  },
  // Image de partage : app/opengraph-image.tsx (1200 × 630), reprise pour Twitter / X.
  twitter: {
    card: "summary_large_image",
    title: "Clara Bernadou",
    description: defaultDescription,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const profil = await getProfile();
  return (
    // data-scroll-behavior : Next.js coupe le défilement doux pendant les changements de page.
    <html lang="fr" data-scroll-behavior="smooth">
      <head>
        {/* Polices variables des sources du prototype : Bricolage Grotesque (opsz 12–96, wght 200–800)
            et Manrope (wght 200–800). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- chargement repris de la source */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Manrope:wght@200..800&display=swap"
        />
      </head>
      <body>
        {/* Pied de page toujours en bas : la page occupe au moins la hauteur de l'écran et le
            contenu s'étire, sans jamais laisser de bande blanche sous le pied de page. */}
        <div style={css("width: 100%; min-height: 100dvh; display: flex; flex-direction: column; background: #FFFFFF; font-family: 'Manrope', system-ui, sans-serif; color: #1A1033")}>
          <span id="top" tabIndex={-1} />
          <ScrollToTop />
          <SiteHeader />
          <div style={css("flex: 1 0 auto")}>{children}</div>
          <SiteFooter profil={{ email: profil.email, entretiens: profil.entretiens, linkedin: profil.linkedin, github: profil.github }} />
          {/* Après le pied de page : affiché en bas à droite, il est atteint en dernier au clavier (RGAA 12.8). */}
          <ToTop />
        </div>
      </body>
    </html>
  );
}
