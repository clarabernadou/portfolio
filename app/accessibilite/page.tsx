import Link from "next/link";
import { css } from "@/lib/css";
import { pageMetadata } from "@/lib/metadata";
import { getProfile } from "@/lib/data";
import { siteUrl } from "@/lib/site-url";
import { compte, dateAudit, ECHANTILLON, nonConformes, RAPPORT_PDF, referentiel, taux } from "@/lib/accessibilite";

export const metadata = pageMetadata(
  "Déclaration d’accessibilité",
  "Déclaration d’accessibilité du portfolio de Clara Bernadou : état de conformité au RGAA, contenus non accessibles et contact.",
);

// Mise en page reprise de la page des mentions légales (MentionsView).
const H2 = `margin: 0 0 10px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`;
const H3 = `margin: 0; font-size: 18px; font-weight: 800`;
const P = `margin: 0; font-size: 17px; line-height: 1.65`;
const SECTION = `display: flex; flex-direction: column; gap: 12px`;
const LISTE = `margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 8px; font-size: 17px; line-height: 1.6`;

const dateFr = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function AccessibilitePage() {
  const profil = await getProfile();
  const films = nonConformes.filter((c) => c.n.startsWith("4."));
  return (
    <main id={"contenu"} tabIndex={-1} style={css(`max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 4.5rem; display: flex; flex-direction: column; gap: 2.5rem`)}>
      <div style={css(`display: flex; flex-direction: column; gap: 10px`)}>
        <nav aria-label={"Fil d’Ariane"} style={css(`font-size: 14px; color: #5B5470`)}>
          <Link href={"/"} style={css(`color: #5B5470`)}>
            {"Accueil"}
          </Link>
          {" / Accessibilité"}
        </nav>
        <h1 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(36px, 5vw, 52px); letter-spacing: -0.045em; line-height: 1`)}>
          <span style={css(`font-weight: 800`)}>{"Déclaration"}</span>{" "}
          <span style={css(`font-weight: 300; color: #6A4FB6`)}>{"d’accessibilité"}</span>
        </h1>
      </div>

      <section style={css(SECTION)}>
        <p style={css(P)}>
          {`Je veille à ce que ce portfolio soit utilisable par tout le monde, quels que soient le matériel, le logiciel ou les capacités de chacun. Cette déclaration s’applique au site ${siteUrl.replace(/^https?:\/\//, "")}.`}
        </p>
        <p style={css(P)}>
          {"Ce site personnel n’est pas soumis à l’obligation légale d’accessibilité. Je l’évalue quand même avec le référentiel officiel français, le RGAA, qui reprend les critères européens et internationaux (WCAG 2.1, niveaux A et AA)."}
        </p>
      </section>

      <section style={css(SECTION)} aria-labelledby={"etat"}>
        <h2 id={"etat"} style={css(H2)}>
          {"État de conformité"}
        </h2>
        <p style={css(P)}>
          <b>{"Ce site est partiellement conforme"}</b>
          {` avec le ${referentiel}, en raison des non-conformités listées plus bas.`}
        </p>
      </section>

      <section style={css(SECTION)} aria-labelledby={"resultats"}>
        <h2 id={"resultats"} style={css(H2)}>
          {"Résultats des tests"}
        </h2>
        <p style={css(P)}>{`L’audit interne du ${dateFr(dateAudit)} donne les résultats suivants :`}</p>
        <ul style={css(LISTE)}>
          <li>{`${String(taux).replace(".", ",")} % des critères applicables sont respectés (${compte("C")} sur ${compte("C") + compte("NC")}) ;`}</li>
          <li>{`${compte("NC")} critères sont non conformes ;`}</li>
          <li>{`${compte("NA")} critères ne s’appliquent pas au site (par exemple, il n’a ni tableau ni formulaire).`}</li>
        </ul>
        {RAPPORT_PDF && (
          <p style={css(P)}>
            <a href={RAPPORT_PDF} target={"_blank"} rel={"noopener noreferrer"} style={css(`font-weight: 700`)}>
              {"Rapport d’audit complet, avec les 106 critères · PDF"}
            </a>
          </p>
        )}
      </section>

      <section style={css(SECTION)} aria-labelledby={"non-accessibles"}>
        <h2 id={"non-accessibles"} style={css(H2)}>
          {"Contenus non accessibles"}
        </h2>
        <h3 style={css(H3)}>{"Non-conformités"}</h3>
        <p style={css(P)}>
          {"Les 3 films de la page "}
          <Link href={"/projets/repositionnement-fruggr"}>{"Repositionnement de Fruggr"}</Link>
          {" :"}
        </p>
        <ul style={css(LISTE)}>
          {films.map((c) => (
            <li key={c.n}>{`${c.constat} (critère ${c.n})`}</li>
          ))}
        </ul>
        <h3 style={css(H3)}>{"Dérogation pour charge disproportionnée"}</h3>
        <p style={css(P)}>
          {"Les livrables de formation téléchargeables (maquettes, wireframes et diagrammes exportés de Figma en PDF) ne sont pas accessibles (critère 13.3). Leur contenu est résumé sur chaque fiche projet. Une version accessible peut être fournie sur demande."}
        </p>
        <h3 style={css(H3)}>{"Contenus non soumis à l’obligation d’accessibilité"}</h3>
        <p style={css(P)}>{"Le lecteur vidéo de YouTube, contenu tiers qui n’est pas sous mon contrôle."}</p>
      </section>

      <section style={css(SECTION)} aria-labelledby={"etablissement"}>
        <h2 id={"etablissement"} style={css(H2)}>
          {"Établissement de cette déclaration"}
        </h2>
        <p style={css(P)}>{`Cette déclaration a été établie le ${dateFr(dateAudit)}.`}</p>
        <h3 style={css(H3)}>{"Technologies utilisées"}</h3>
        <p style={css(P)}>{"HTML, CSS, JavaScript (React et Next.js) et WAI-ARIA."}</p>
        <h3 style={css(H3)}>{"Méthode et outils"}</h3>
        <ul style={css(LISTE)}>
          <li>{"Navigateur Chromium sur macOS, à 1440, 390 et 320 pixels de large ;"}</li>
          <li>{"Tests automatiques avec axe-core et le validateur HTML Nu ;"}</li>
          <li>{"Vérifications manuelles : lecture du code, navigation au clavier, affichage sans styles, contrastes."}</li>
        </ul>
        <p style={css(P)}>{"Limite : le site n’a pas encore été testé avec un lecteur d’écran."}</p>
        <h3 style={css(H3)}>{"Pages vérifiées"}</h3>
        <ul style={css(LISTE)}>
          {ECHANTILLON.map((p) => (
            <li key={p.label}>{p.href ? <Link href={p.href}>{p.label}</Link> : p.label}</li>
          ))}
        </ul>
      </section>

      <section style={css(SECTION)} aria-labelledby={"contact-a11y"}>
        <h2 id={"contact-a11y"} style={css(H2)}>
          {"Retour d’information et contact"}
        </h2>
        <p style={css(P)}>
          {"Si vous n’arrivez pas à accéder à un contenu, écrivez-moi pour obtenir une alternative accessible : "}
          <a href={`mailto:${profil.email}`}>{profil.email}</a>
          {"."}
        </p>
      </section>

      <section style={css(SECTION)} aria-labelledby={"recours"}>
        <h2 id={"recours"} style={css(H2)}>
          {"Voies de recours"}
        </h2>
        <p style={css(P)}>
          {"Si vous m’avez signalé un défaut d’accessibilité sans obtenir de réponse satisfaisante, vous pouvez saisir le Défenseur des droits : "}
          <a href={"https://formulaire.defenseurdesdroits.fr/"} target={"_blank"} rel={"noopener noreferrer"}>
            {"formulaire en ligne"}
            <span aria-hidden={"true"}>{" ↗"}</span>
          </a>
          {", délégué ou déléguée de votre région, ou courrier gratuit (Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07)."}
        </p>
      </section>
    </main>
  );
}
