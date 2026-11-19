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
    <main className={"zone-sombre"} style={css(`box-sizing: border-box; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 5rem 16px; background: linear-gradient(160deg, #1A1033 0%, #2E1065 100%)`)}>
      {/* « Retour au site » au-dessus de la carte, aligné sur son bord gauche (19 nov. 2026) : la carte ne
          contient que la connexion, le lien est le premier atteint au clavier, et c'est la carte seule qui est
          centrée dans l'écran (le lien est posé au-dessus, hors du flux). */}
      <div style={css(`position: relative; box-sizing: border-box; width: 100%; max-width: 440px`)}>
        <Link href={"/"} style={css(`position: absolute; left: 0; bottom: calc(100% + 12px); min-height: 44px; display: inline-flex; align-items: center; font-size: 15px; font-weight: 700; color: #C4B5FD; text-decoration: none`)}>
          {"← Retour au site"}
        </Link>
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
      </div>
      </div>
    </main>
  );
}
