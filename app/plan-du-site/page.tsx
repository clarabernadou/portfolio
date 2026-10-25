import Link from "next/link";
import { css } from "@/lib/css";
import { pageMetadata } from "@/lib/metadata";
import { getSiteProjects } from "@/lib/data";

export const metadata = pageMetadata("Plan du site", "Toutes les pages du portfolio de Clara Bernadou.");

// Second système de navigation, avec le menu (RGAA 12.1) : toutes les pages publiques.
const LISTE = `margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 6px; font-size: 17px; line-height: 1.6`;
const LIEN = `display: inline-block; padding: 6px 0; font-weight: 700`;

export default async function PlanDuSitePage() {
  const projets = await getSiteProjects();
  return (
    <main id={"contenu"} tabIndex={-1} style={css(`max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 4.5rem; display: flex; flex-direction: column; gap: 2.5rem`)}>
      <div style={css(`display: flex; flex-direction: column; gap: 10px`)}>
        <nav aria-label={"Fil d’Ariane"} style={css(`font-size: 14px; color: #5B5470`)}>
          <Link href={"/"} style={css(`color: #5B5470`)}>
            {"Accueil"}
          </Link>
          {" / Plan du site"}
        </nav>
        <h1 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(36px, 5vw, 52px); letter-spacing: -0.045em; line-height: 1`)}>
          <span style={css(`font-weight: 800`)}>{"Plan"}</span>{" "}
          <span style={css(`font-weight: 300; color: #6A4FB6`)}>{"du site"}</span>
        </h1>
      </div>
      <nav aria-label={"Plan du site"}>
        <ul style={css(LISTE)}>
          <li>
            <Link href={"/"} style={css(LIEN)}>
              {"Accueil"}
            </Link>
          </li>
          <li>
            <Link href={"/projets"} style={css(LIEN)}>
              {"Projets"}
            </Link>
            <ul style={css(`${LISTE}; margin-top: 4px`)}>
              {projets.map((p) => (
                <li key={p.id}>
                  <Link href={`/projets/${p.id}`} style={css(`display: inline-block; padding: 6px 0`)}>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <Link href={"/cv"} style={css(LIEN)}>
              {"CV"}
            </Link>
          </li>
          <li>
            <Link href={"/ia"} style={css(LIEN)}>
              {"IA"}
            </Link>
          </li>
          <li>
            <Link href={"/mentions-legales"} style={css(LIEN)}>
              {"Mentions légales et confidentialité"}
            </Link>
          </li>
          <li>
            <Link href={"/accessibilite"} style={css(LIEN)}>
              {"Accessibilité"}
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
