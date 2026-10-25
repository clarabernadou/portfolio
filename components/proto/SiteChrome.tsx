"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { HeaderView } from "./HeaderView";
import { ToTopView } from "./ToTopView";
import { FooterView } from "./FooterView";
import { siteContact } from "@/lib/site-data";
import type { SiteProfile } from "@/lib/data-shared";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/projets", label: "Projets" },
  { href: "/cv", label: "CV" },
  { href: "/ia", label: "IA" },
];

// L'administration a sa propre mise en page, sans l'en-tête ni le pied de page du site.
const isAdmin = (pathname: string) => pathname.startsWith("/admin");

export function SiteHeader() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const v = {
    nav: NAV.map((n) => ({ ...n, active: n.href === "/" ? pathname === "/" : pathname.startsWith(n.href) })),
    menuOpen: menu,
    menuClosed: !menu,
    menuLabel: menu ? "Fermer le menu" : "Ouvrir le menu",
    toggleMenu: () => setMenu((m) => !m),
    closeMenu: () => setMenu(false),
  };
  if (isAdmin(pathname)) return null;
  return <HeaderView v={v} />;
}

// Le bouton « Retour en haut » n'existe pas dans les sources des pages IA et mentions légales.
export function ToTop() {
  const pathname = usePathname();
  if (pathname === "/ia" || pathname === "/mentions-legales" || isAdmin(pathname)) return null;
  const v = { toTop: () => window.scrollTo({ top: 0, behavior: "smooth" }) };
  return <ToTopView v={v} />;
}

export function SiteFooter({ profil }: { profil: Pick<SiteProfile, "email" | "entretiens" | "linkedin" | "github"> }) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const v = {
    cvUrl: siteContact.cvPdfHref,
    email: profil.email,
    entretiens: profil.entretiens,
    linkedin: profil.linkedin,
    github: profil.github,
    copyLabel: copied ? "Copié ✓" : "Copier",
    copy: () => {
      navigator.clipboard?.writeText(profil.email).catch(() => {});
      setCopied(true);
    },
    writeMail: () => {
      window.location.href = `mailto:${profil.email}`;
    },
  };
  if (isAdmin(pathname)) return null;
  return <FooterView v={v} />;
}
