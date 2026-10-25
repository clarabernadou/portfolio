"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  // Le menu est ouvert pour une page donnée : changer de page le referme sans effet de bord.
  const [menuPage, setMenuPage] = useState<string | null>(null);
  const menu = menuPage === pathname;
  const setMenu = (ouvert: boolean | ((m: boolean) => boolean)) =>
    setMenuPage((p) => ((typeof ouvert === "function" ? ouvert(p === pathname) : ouvert) ? pathname : null));
  const v = {
    nav: NAV.map((n) => ({ ...n, active: n.href === "/" ? pathname === "/" : pathname.startsWith(n.href) })),
    menuOpen: menu,
    menuClosed: !menu,
    menuLabel: menu ? "Fermer le menu" : "Ouvrir le menu",
    toggleMenu: () => setMenu((m) => !m),
    closeMenu: () => setMenu(false),
  };
  // Menu mobile : Échap le ferme et rend le focus au bouton ; il se ferme aussi au changement de page.
  useEffect(() => {
    if (!menu) return;
    const touche = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuPage(null);
      // Après la fermeture (nouveau rendu), le focus revient au bouton du menu.
      setTimeout(() => document.querySelector<HTMLButtonElement>(".hdr-menu")?.focus(), 0);
    };
    document.addEventListener("keydown", touche);
    return () => document.removeEventListener("keydown", touche);
  }, [menu]);
  if (isAdmin(pathname)) return null;
  return (
    <>
      {/* Lien d'évitement (RGAA 12.7) : premier élément atteint au clavier. */}
      <a href="#contenu" className="lien-evitement">
        Aller au contenu
      </a>
      <HeaderView v={v} />
    </>
  );
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
