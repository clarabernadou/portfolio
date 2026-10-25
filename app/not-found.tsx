import Link from "next/link";
import { css } from "@/lib/css";

// Pas de maquette pour la 404 : composée avec les styles des sources du prototype
// (titre de page, paragraphe d'introduction, boutons principal et secondaire du héros).
export default function NotFound() {
  return (
    <main style={css("max-width: 1200px; margin: 0 auto; padding: 4.5rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; text-align: center")}>
      <span style={css("font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 64px; font-weight: 800; letter-spacing: -0.045em; line-height: 1; color: #6A4FB6")}>
        404
      </span>
      <h1 style={css("margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(40px, 5vw, 60px); letter-spacing: -0.045em; line-height: 1")}>
        <span style={css("font-weight: 800")}>Page</span> <span style={css("font-weight: 300; color: #6A4FB6")}>introuvable</span>
      </h1>
      <p style={css("margin: 0; font-size: 20px; line-height: 1.5; font-weight: 500; color: #5B5470")}>
        La page que vous cherchez n’existe pas ou a été déplacée.
      </p>
      <div style={css("display: flex; flex-wrap: wrap; justify-content: center; gap: 12px")}>
        <Link href="/" style={css("min-height: 48px; padding: 0 22px; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; border: 2px solid #6A4FB6; display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; text-decoration: none")}>
          Retour à l’accueil
        </Link>
        <Link href="/projets" style={css("min-height: 48px; padding: 0 22px; border-radius: 999px; background: transparent; color: #1A1033; border: 2px solid #1A1033; display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; text-decoration: none")}>
          Voir les projets
        </Link>
      </div>
    </main>
  );
}
