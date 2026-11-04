import Link from "next/link";
import { css } from "@/lib/css";

// Adresse d'un projet pas encore publié (4 nov. 2026) : une page claire plutôt que la page d'erreur,
// sans rien dévoiler du projet. Pas de maquette : composée comme la page introuvable (app/not-found.tsx).
export function ProjetEnValidation() {
  return (
    <main id={"contenu"} tabIndex={-1} style={css("max-width: 1200px; margin: 0 auto; padding: 4.5rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; text-align: center")}>
      <h1 style={css("margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(40px, 5vw, 60px); letter-spacing: -0.045em; line-height: 1; text-wrap: balance")}>
        <span style={css("font-weight: 800")}>Projet</span> <span style={css("font-weight: 300; color: #6A4FB6")}>en cours de validation</span>
      </h1>
      <p style={css("margin: 0; font-size: 20px; line-height: 1.5; font-weight: 500; color: #5B5470; text-wrap: pretty")}>
        Ce projet est en cours de validation et sera bientôt en ligne.
      </p>
      <div style={css("display: flex; flex-wrap: wrap; justify-content: center; gap: 12px")}>
        <Link href="/projets" style={css("min-height: 48px; padding: 0 22px; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; border: 2px solid #6A4FB6; display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; text-decoration: none")}>
          Voir les projets
        </Link>
        <Link href="/" style={css("min-height: 48px; padding: 0 22px; border-radius: 999px; background: transparent; color: #1A1033; border: 2px solid #1A1033; display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; text-decoration: none")}>
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
