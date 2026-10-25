import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter, ToTop } from "@/components/proto/SiteChrome";
import { getProfile } from "@/lib/data";
import { siteUrl } from "@/lib/site-url";
import { css } from "@/lib/css";
import { ScrollToTop } from "@/components/ScrollToTop";

const defaultDescription = "Portfolio de Clara Bernadou, développeuse front-end & UI/UX designer.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Clara Bernadou",
    template: "%s — Clara Bernadou",
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Clara Bernadou",
    title: "Clara Bernadou",
    description: defaultDescription,
    images: [{ url: "/photo-clara.jpg", width: 800, height: 800, alt: "Photo de Clara Bernadou" }],
  },
  twitter: {
    card: "summary",
    title: "Clara Bernadou",
    description: defaultDescription,
    images: ["/photo-clara.jpg"],
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
        <div style={css("width: 100%; background: #FFFFFF; font-family: 'Manrope', system-ui, sans-serif; color: #1A1033")}>
          <span id="top" />
          <ScrollToTop />
          <SiteHeader />
          {children}
          <SiteFooter profil={{ email: profil.email, entretiens: profil.entretiens, linkedin: profil.linkedin, github: profil.github }} />
          {/* Après le pied de page : affiché en bas à droite, il est atteint en dernier au clavier (RGAA 12.8). */}
          <ToTop />
        </div>
      </body>
    </html>
  );
}
