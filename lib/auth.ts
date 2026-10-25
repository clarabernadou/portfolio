import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { redirect } from "next/navigation";
import { isAdminGithubId } from "@/lib/admin-id";

// Connexion à l'administration (étape 8) : Auth.js avec le fournisseur GitHub.
// Tout autre compte que celui de Clara revient au site, sans message (§2).
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  // Une erreur de connexion (GitHub indisponible, accès refusé) ramène à l'écran de connexion.
  // Un autre compte que celui de Clara est, lui, renvoyé au site par le rappel signIn.
  pages: { signIn: "/admin/connexion", error: "/admin/connexion" },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "github") return "/";
      return isAdminGithubId((profile as { id?: number } | undefined)?.id) ? true : "/";
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && profile) {
        token.githubId = String((profile as { id?: number }).id);
      }
      return token;
    },
    async session({ session, token }) {
      return { ...session, githubId: token.githubId as string | undefined };
    },
  },
};

export async function isAdminSession(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return isAdminGithubId((session as { githubId?: string } | null)?.githubId);
}

// À appeler en tête de chaque page /admin (sauf la connexion) : la vérification
// se fait côté serveur, pas seulement dans proxy.ts.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) redirect("/admin/connexion");
}

// À appeler en tête de chaque API d'écriture : renvoie une réponse 401 si la
// session n'est pas celle de Clara, sinon null.
export async function adminApiGuard(request: Request): Promise<Response | null> {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  if (!(await isAdminSession())) return Response.json({ error: "unauthorized" }, { status: 401 });
  return null;
}
