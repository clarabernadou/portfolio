"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

// Rubriques de la barre latérale (ADMIN-et-SYNCHRONISATION.md, §3).
const RUBRIQUES = [
  { href: "/admin", label: "Tableau de bord", icon: "dashboard" },
  { href: "/admin/projets", label: "Projets", icon: "folder" },
  { href: "/admin/categories", label: "Catégories", icon: "tag" },
  { href: "/admin/formations", label: "Formations", icon: "graduation" },
  { href: "/admin/experiences", label: "Expériences", icon: "briefcase" },
  { href: "/admin/competences", label: "Compétences", icon: "lines" },
  { href: "/admin/profil", label: "Profil et CV", icon: "user" },
  { href: "/admin/page-ia", label: "Page IA", icon: "sparkle" },
  { href: "/admin/synchronisation", label: "Synchronisation", icon: "sync" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration">
      <ul className="adm-nav">
        {RUBRIQUES.map((r) => {
          const active = r.href === "/admin" ? pathname === "/admin" : pathname.startsWith(r.href);
          return (
            <li key={r.href}>
              <Link href={r.href} aria-current={active ? "page" : undefined}>
                <Icon name={r.icon} />
                {r.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
