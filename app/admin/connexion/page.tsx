import type { Metadata } from "next";
import Link from "next/link";
import { css } from "@/lib/css";
import { LogoClara } from "@/components/proto/LogoClara";
import { Suspense } from "react";
import { GitHubSignIn } from "./GitHubSignIn";

export const metadata: Metadata = {
  title: "Connexion · Administration",
  robots: { index: false, follow: false },
};

// Maquette : docs/passation/maquettes/admin/Admin-connexion.jpg.
export default async function ConnexionPage({ searchParams }: { searchParams: Promise<{ error?: string; expire?: string }> }) {
  const { error, expire } = await searchParams;
  // Messages de ADMIN-et-SYNCHRONISATION.md §2 (session expirée) et échec de connexion.
  const message = expire
    ? "Ta session a expiré. Reconnecte-toi : tes modifications non enregistrées sont conservées sur cet appareil."
    : error
      ? "La connexion n’a pas abouti. Réessaie dans un instant."
      : null;
  return (
    <main style={css(`box-sizing: border-box; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 16px; background: linear-gradient(160deg, #1A1033 0%, #2E1065 100%)`)}>
      <div style={css(`box-sizing: border-box; width: 100%; max-width: 440px; background: #FFFFFF; border-radius: 24px; padding: 36px; box-shadow: 0 24px 64px rgba(10,6,24,0.45); display: flex; flex-direction: column; gap: 14px`)}>
        <Link href={"/"} aria-label={"Clara Bernadou, accueil"} style={css(`align-self: flex-start; display: flex; min-height: 44px; align-items: center`)}>
          <LogoClara height={32} />
        </Link>
        <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>
          {"Administration"}
        </span>
        <h1 style={css(`margin: 4px 0 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 34px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.05`)}>
          {"Connexion"}
        </h1>
        <p style={css(`margin: 0; font-size: 16px; line-height: 1.5; color: #5B5470`)}>
          {"Accès réservé. Connecte-toi avec ton compte GitHub."}
        </p>
        {message && (
          <p role="alert" style={css(`margin: 0; padding: 12px 14px; border-radius: 12px; background: #F3EFFF; font-size: 15px; line-height: 1.5`)}>
            {message}
          </p>
        )}
        <Suspense>
          <GitHubSignIn />
        </Suspense>
        <Link href={"/"} style={css(`align-self: flex-start; min-height: 44px; display: inline-flex; align-items: center; font-size: 15px; font-weight: 700; color: #6A4FB6; text-decoration: none`)}>
          {"← Retour au site"}
        </Link>
      </div>
    </main>
  );
}
