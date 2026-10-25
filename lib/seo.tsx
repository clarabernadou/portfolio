import type { SiteProfile } from "@/lib/data-shared";
import { siteUrl } from "@/lib/site-url";

// Données structurées (schema.org, JSON-LD) lues par Google : la « fiche d'identité »
// qui relie le nom de Clara à son métier, à son site et à ses profils. Uniquement des
// informations déjà publiées sur le site (pas de téléphone).

const abs = (chemin: string) => (/^https?:\/\//.test(chemin) ? chemin : `${siteUrl}${chemin}`);
const ID_PERSONNE = `${siteUrl}/#clara-bernadou`;

export function personneJsonLd(profil: SiteProfile, competences: string[], photoUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: abs("/"),
    inLanguage: "fr-FR",
    mainEntity: {
      "@type": "Person",
      "@id": ID_PERSONNE,
      name: profil.nom,
      givenName: "Clara",
      familyName: "Bernadou",
      jobTitle: profil.intitule,
      description: profil.profilEssentiel,
      url: abs("/"),
      image: abs(photoUrl),
      email: `mailto:${profil.email}`,
      sameAs: [profil.linkedin, profil.github].filter(Boolean),
      address: { "@type": "PostalAddress", addressLocality: "Vannes", addressRegion: "Bretagne", addressCountry: "FR" },
      alumniOf: { "@type": "EducationalOrganization", name: "OpenClassrooms", url: "https://openclassrooms.com" },
      knowsAbout: competences,
      knowsLanguage: profil.langues.map((l) => l.nom),
    },
  };
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Clara Bernadou",
    alternateName: ["Clara Bernadou portfolio", "clarabernadou"],
    url: abs("/"),
    inLanguage: "fr-FR",
    author: { "@id": ID_PERSONNE },
  };
}

export function projetJsonLd(p: { id: string; name: string; line: string; context?: string | null; tags: string[]; github?: string | null }) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: p.name,
      headline: p.name,
      description: p.context || p.line,
      url: abs(`/projets/${p.id}`),
      inLanguage: "fr-FR",
      keywords: p.tags.join(", "),
      author: { "@type": "Person", "@id": ID_PERSONNE, name: "Clara Bernadou", url: abs("/") },
      ...(p.github ? { sameAs: p.github } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: abs("/") },
        { "@type": "ListItem", position: 2, name: "Projets", item: abs("/projets") },
        { "@type": "ListItem", position: 3, name: p.name, item: abs(`/projets/${p.id}`) },
      ],
    },
  ];
}

/** Balise <script type="application/ld+json">, échappée pour ne jamais fermer la balise. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
