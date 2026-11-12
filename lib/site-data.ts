import liensData from "@/data/liens.json";

// Valeurs lues directement depuis data/liens.json (source de vérité), plutôt
// que recopiées en dur dans les composants (étape 3).
export const siteNav = [
  { href: "/", label: "Accueil" },
  { href: "/projets", label: "Projets" },
  { href: "/cv", label: "CV" },
  { href: "/ia", label: "IA" },
] as const;

export const siteContact = {
  email: liensData.profil.email,
  linkedin: liensData.profil.linkedin,
  github: liensData.profil.github,
  // Servi par /media/cv : le PDF envoyé depuis l'administration s'il existe, sinon le fichier
  // d'origine du site. Un seul CV depuis le 12 nov. 2026 (la version synthétisée de Clara).
  cvPdfHref: "/media/cv/CV_Clara_Bernadou_Developpeuse_Full_Stack.pdf",
  photo: "/photo-clara.jpg",
  disponibiliteEntretiens:
    "Entretiens possibles le vendredi, le samedi et en semaine après 17 h.",
} as const;

export const siteFooterLinks = {
  mentionsLegales: { href: "/mentions-legales", label: "Mentions légales et confidentialité" },
  connexion: { href: "/admin/connexion", label: "Connexion" },
} as const;

export const hebergeur = liensData.hebergeur;
export const entreprises = liensData.entreprises;
export const formationsLiens = liensData.formations;
export const lieux = liensData.lieux;
export const recommandationsLiens = liensData.recommandations;
