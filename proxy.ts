import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAdminGithubId } from "@/lib/admin-id";

// Vérification rapide avant chaque requête /admin et /api/admin (étape 8).
// Ce n'est qu'une première barrière : chaque page et chaque API d'écriture
// revérifient la session côté serveur (requireAdmin, adminApiGuard).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/connexion") return NextResponse.next();

  // Un jeton absent, illisible ou signé avec une autre clé vaut « pas de session ».
  const token = process.env.NEXTAUTH_SECRET
    ? await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }).catch(() => null)
    : null;
  const admin = isAdminGithubId(token?.githubId);

  // Fiche projet (4 nov. 2026) : les visiteurs voient la page publique, ou « en cours de validation »
  // pour un projet non publié ; connectée, Clara voit l'aperçu à la même adresse, brouillon compris.
  const fiche = /^\/projets\/([\w-]+)$/.exec(pathname);
  if (fiche) return admin ? NextResponse.rewrite(new URL(`/apercu/projets/${fiche[1]}`, request.url)) : NextResponse.next();

  if (admin) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const login = new URL("/admin/connexion", request.url);
  login.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/apercu/:path*", "/projets/:id"],
};
