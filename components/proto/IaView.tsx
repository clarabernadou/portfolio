"use client";

import { CarteProjet } from "./LienProjet";
import { css } from "@/lib/css";
import { CartePhare } from "./CartePhare";
import { ListeLivrables } from "./ListeLivrables";
import { IaCard, IaStat } from "./IaCards";
import { IaExemples } from "./IaExemples";

// Généré depuis docs/passation/prototype-source/ia.source.html
// (scripts/tools/gen.mjs) : markup et styles recopiés à l'identique.
/* eslint-disable @typescript-eslint/no-explicit-any */

// Outils et skills mis en avant (case « Mis en avant » de l'administration ; à défaut, les 3 premiers).
const vedettes = (l: any[]) => (l.some((x) => x.vedette) ? l.filter((x) => x.vedette) : l.slice(0, 3));
const autres = (l: any[]) => {
  const v = vedettes(l);
  return l.filter((x) => !v.includes(x));
};

// Icône décorative en tête des cartes « Ce que ça a produit ».
function Icone({ d }: { d: string }) {
  return (
    <span aria-hidden={"true"} style={css(`width: 44px; height: 44px; border-radius: 14px; background: #F3EFFF; color: #6A4FB6; display: inline-flex; align-items: center; justify-content: center`)}>
      <svg width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.75"} strokeLinecap={"round"} strokeLinejoin={"round"}>
        <path d={d} />
      </svg>
    </span>
  );
}

// Miniature des petites cartes de réalisations (20 nov. 2026) : cadre neutre en attendant les images.
function Miniature() {
  return <span aria-hidden={"true"} style={css(`display: block; aspect-ratio: 16 / 9; border-radius: 14px; background: #F3EFFF; border: 1px solid #E4DCF7`)} />;
}

// Icônes décoratives des chiffres de l'intro et des outils (choisies d'après le libellé ou la catégorie).
function iconeChiffre(label: string) {
  if (/skill/i.test(label)) return "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z";
  if (/routine/i.test(label)) return "M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5";
  return "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5";
}
function iconeSkill(nom: string) {
  if (/wordpress/i.test(nom)) return "M4 4h16v16H4zM4 9h16M9 9v11";
  if (/marque/i.test(nom)) return "M20 12l-8 8-9-9V3h8zM7.5 7.5h.01";
  if (/audit/i.test(nom)) return "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5M8 11l2 2 4-4";
  if (/linkedin|visuel/i.test(nom)) return "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15 9h.01";
  if (/youtube|miniature/i.test(nom)) return "M3 6h18v12H3zM10 9l5 3-5 3z";
  if (/webinar/i.test(nom)) return "M3 6h18v12H3zM3 7l9 6 9-6";
  return "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z";
}
function iconeRoutine(titre: string) {
  if (/matin/i.test(titre)) return "M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z";
  if (/veille/i.test(titre)) return "M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5M8 17h3";
  return "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z";
}
function iconeOutil(categorie: string) {
  if (/d[ée]velopp/i.test(categorie)) return "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14";
  if (/concep|visuel|design/i.test(categorie)) return "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z";
  if (/autonom|t[âa]che/i.test(categorie)) return "M4 4l7 17 2.5-7.5L21 11z";
  return "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z";
}

// Pictogramme décoratif d'une règle de travail (20 nov. 2026, à la place de la coche).
function Pictogramme({ d }: { d: string }) {
  return (
    <span aria-hidden={"true"} style={css(`flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; background: #F3EFFF; color: #6A4FB6; display: inline-flex; align-items: center; justify-content: center`)}>
      <svg width={"19"} height={"19"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"} strokeLinecap={"round"} strokeLinejoin={"round"}>
        <path d={d} />
      </svg>
    </span>
  );
}


export function IaView({ v }: { v: any }) {
  return (
    <>
      <main id={"contenu"} tabIndex={-1} style={css(`width: var(--container); margin: 0 auto; padding: clamp(3rem, 7vw, 5rem) 0 0; display: flex; flex-direction: column; gap: var(--espace-section-demi)`)}>
        {/* Introduction plus aérée (19 nov. 2026). */}
        {/* Intro en deux colonnes sur ordinateur (20 nov. 2026) : texte à gauche, les 3 chiffres à droite (.ia-intro). */}
        <section className={"ia-intro"} style={css(`padding-bottom: clamp(0.5rem, 2vw, 1.5rem)`)}>
          <h1 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(38px, 6vw, 64px); letter-spacing: -0.045em; line-height: 1; hyphens: manual`)}>
              <span style={css(`font-weight: 800`)}>
                {"Ma façon de travailler"}
              </span>
              {" "}
              <span style={css(`font-weight: 300; color: #6A4FB6`)}>
                {"avec l’IA"}
              </span>
            </h1>
          <div style={css(`display: flex; flex-direction: column; gap: 14px`)}>
            <p style={css(`margin: 0; font-size: 22px; font-weight: 500; line-height: 1.5; color: #1A1033`)}>
              {"J’utilise l’IA tous les jours pour développer, concevoir et produire du contenu. Je choisis l’outil le plus adapté à chaque tâche, je construis des skills pour automatiser le répétitif, et je vérifie toujours le résultat avant de le livrer."}
            </p>
            {/* Phrase reprise du CV final (Compétences IA, ligne « Claude Code »), validée par Clara le 19 nov. 2026. */}
            <p style={css(`margin: 0; font-size: 17px; line-height: 1.6; color: #5B5470`)}>
              {"Claude Code est mon outil principal depuis début 2026 : je conçois, développe, teste et automatise avec lui, côté produit et marketing, avec une vérification humaine de chaque livrable avant publication."}
            </p>
          </div>
          {" "}
          <ul role={"list"} className={"liste-nue"} style={css(`display: flex; flex-direction: column; gap: 1px; background: #E4DCF7; border: 1px solid #E4DCF7; border-radius: 20px; overflow: hidden`)}>
            {v.stats.map((st: any) => (
              <IaStat key={st.label} value={st.value} label={st.label} icone={iconeChiffre(st.label)} />
            ))}
          </ul>
        </section>
        {/* Hiérarchie de la page (19 nov. 2026) : les réalisations d'abord, puis les outils et skills mis en avant
            (les autres en liste compacte), la méthode avec ses règles, et les routines. */}
        <section className={"ia-bande"} style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Ce que ça a produit"}
            </h2>
          </div>
          {v.jarvis && v.publics.includes("jarvis") && (
            <CartePhare id={"jarvis"} titre={v.jarvis.name} resume={v.jarvis.line} tags={v.jarvis.tags} href={"/projets/jarvis"} image={v.jarvis.image} infos={[v.jarvis.parcours, v.jarvis.date]} />
          )}
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 16px`)}>
            <li style={css(`display: grid`)}>
            <CarteProjet id={"portfolio"} publics={v.publics} separe style={`text-decoration: none; color: #1A1033; border-radius: 20px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 24px; display: flex; flex-direction: column; gap: 10px`} suite={<span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6`)}>{"Voir le projet →"}</span>}>
              <Miniature />
              <Icone d={"M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01"} />
              {" "}
              <h3 id={"portfolio-titre"} style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em`)}>
                {"Ce portfolio"}
              </h3>
              {" "}
              <span id={"portfolio-desc"} style={css(`font-size: 16px; line-height: 1.55; color: #5B5470`)}>
                {"Maquettes avec Claude Design, développement avec Claude Code, charte, design system et dossier de passation."}
              </span>
            </CarteProjet>
            </li>
            <li style={css(`display: grid`)}>
            <CarteProjet id={"intuitlearn"} publics={v.publics} separe style={`text-decoration: none; color: #1A1033; border-radius: 20px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 24px; display: flex; flex-direction: column; gap: 10px`} suite={<span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6`)}>{"Voir le projet →"}</span>}>
              <Miniature />
              <Icone d={"M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5M8 11l2 2 4-4"} />
              {" "}
              <h3 id={"intuitlearn-titre"} style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em`)}>
                {"Audits de sites"}
              </h3>
              {" "}
              <span id={"intuitlearn-desc"} style={css(`font-size: 16px; line-height: 1.55; color: #5B5470`)}>
                {"Skills d’audit UX, accessibilité et marque appliqués au site Fruggr et à une application tierce."}
              </span>
            </CarteProjet>
            </li>
            <li style={css(`display: grid`)}>
            <CarteProjet id={"saga-films-fruggr"} publics={v.publics} separe style={`text-decoration: none; color: #1A1033; border-radius: 20px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 24px; display: flex; flex-direction: column; gap: 10px`} suite={<span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6`)}>{"Voir le projet →"}</span>}>
              <Miniature />
              <Icone d={"M4 6h12v12H4zM16 10l4-2v8l-4-2"} />
              {" "}
              <h3 id={"saga-films-fruggr-titre"} style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em`)}>
                {"Saga de 3 films pour Fruggr"}
              </h3>
              {" "}
              <span id={"saga-films-fruggr-desc"} style={css(`font-size: 16px; line-height: 1.55; color: #5B5470`)}>
                {"Du script au rendu final : Remotion, voix off ElevenLabs, musique, déclinaison en 16:9, 9:16 et 1:1, publiée sur YouTube."}
              </span>
            </CarteProjet>
            </li>
          </ul>
        </section>
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Mes outils"}
            </h2>
            <p style={css(`margin: 0; font-size: 17px; line-height: 1.55; color: #5B5470`)}>
              {"Chaque IA a ses points forts. Je choisis la plus adaptée à chaque tâche."}
            </p>
          </div>
          {/* Outils Claude mis en avant, tous de prédilection : plus de badge sur un seul (19 nov. 2026). */}
          {/* Outils (20 nov. 2026) : une grande carte Claude (outils « Mis en avant » de l'administration, 2 × 2),
              et à côté les autres outils, « selon la tâche ». Empilées sur mobile (.ia-outils-duo). */}
          <div className={"ia-outils-duo"}>
            <div className={"ia-claude"}>
              <div style={css(`display: flex; flex-direction: column; gap: 2px`)}>
                <h3 style={css(`margin: 0; font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>{"Mon IA de prédilection"}</h3>
              </div>
              <ul role={"list"} className={"liste-nue ia-outils"}>
                {vedettes(v.tools).map((t: any) => (
                  <li key={t.name} className={"ia-outil"}>
                    <Icone d={iconeOutil(t.category)} />
                    <div style={css(`display: flex; flex-direction: column; gap: 2px`)}>
                      <h4 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 800; letter-spacing: -0.02em`)}>{t.name}</h4>
                      <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>{t.category}</span>
                    </div>
                    <p style={css(`margin: 0; font-size: 16px; line-height: 1.55; color: #5B5470`)}>{t.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            {autres(v.tools).length > 0 && (
              <div className={"ia-outils-autres"}>
                <Icone d={"M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"} />
                <h3 style={css(`margin: 4px 0 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 800; letter-spacing: -0.02em`)}>{"Aussi, selon la tâche"}</h3>
                <ul role={"list"} className={"liste-nue ia-outils-autres-liste"}>
                  {autres(v.tools).map((t: any) => (
                    <li key={t.name} style={css(`font-size: 15px; line-height: 1.4`)}>
                      <b style={css(`color: #1A1033`)}>{t.name}</b>
                      <span style={css(`display: block; color: #5B5470; font-size: 14px`)}>{t.category}</span>
                    </li>
                  ))}
                </ul>
                <p style={css(`margin: 0; font-size: 15px; font-weight: 700; color: #5B5470`)}>{"Et bien d’autres…"}</p>
              </div>
            )}
          </div>
        </section>
        <section className={"ia-bande"} style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Les skills que j’ai créés"}
            </h2>
            <p style={css(`margin: 0; font-size: 17px; line-height: 1.55; color: #5B5470`)}>
              {"Des skills Claude réutilisables, créés pour mon poste chez Digital4Better, l’entreprise où je suis alternante, et proposés à l’équipe. Chaque skill regroupe les consignes, les modèles et les vérifications d’une tâche récurrente, pour la refaire à l’identique. Ils restent internes à l’entreprise : je décris ce qu’ils font, sans en montrer le contenu."}
            </p>
          </div>
          {/* Skills en carrousel, 3 par vue, comme les recommandations (20 nov. 2026). */}
          <ListeLivrables total={v.skills.length} parVue={3} largeurMin={280} noms={{ un: "Skill", plusieurs: "skills", precedents: "Skills précédents", suivants: "Skills suivants" }}>
            {[...vedettes(v.skills), ...autres(v.skills)].map((t: any) => (
              <li key={t.name} style={css(`display: grid`)}>
                <IaCard kicker={"Skill"} title={t.name} text={t.description} icone={iconeSkill(t.name)} />
              </li>
            ))}
          </ListeLivrables>
        </section>
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Ma méthode"}
            </h2>
          </div>
          {/* Étapes sur une barre horizontale sur ordinateur, verticale sur mobile (.ia-methode, 20 nov. 2026). */}
          <ol className={"ia-methode"}>
            <li className={"ia-etape"}>
              <span className={"ia-etape-num"} aria-hidden={"true"}>
                <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                  <path d={"M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5"} />
                </svg>
              </span>
              <span className={"ia-etape-n"} aria-hidden={"true"}>{"01"}</span>
              {" "}
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Repérer"}
              </h3>
              {" "}
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Une tâche récurrente ou longue, qui se prête à l’automatisation."}
              </span>
            </li>
            <li className={"ia-etape"}>
              <span className={"ia-etape-num"} aria-hidden={"true"}>
                <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                  <path d={"M6 2v14h14M2 6h14v14"} />
                </svg>
              </span>
              <span className={"ia-etape-n"} aria-hidden={"true"}>{"02"}</span>
              {" "}
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Cadrer"}
              </h3>
              {" "}
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Le texte source fourni, le format attendu et ce que l’IA ne doit pas toucher."}
              </span>
            </li>
            <li className={"ia-etape"}>
              <span className={"ia-etape-num"} aria-hidden={"true"}>
                <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                  <path d={"M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5"} />
                </svg>
              </span>
              <span className={"ia-etape-n"} aria-hidden={"true"}>{"03"}</span>
              {" "}
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Itérer"}
              </h3>
              {" "}
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Je fais produire, je relis, je corrige avec des consignes précises."}
              </span>
            </li>
            <li className={"ia-etape"}>
              <span className={"ia-etape-num"} aria-hidden={"true"}>
                <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                  <path d={"M9 12l2 2 4-4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"} />
                </svg>
              </span>
              <span className={"ia-etape-n"} aria-hidden={"true"}>{"04"}</span>
              {" "}
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Vérifier"}
              </h3>
              {" "}
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Contrastes, cohérence avec la charte, fidélité au texte d’origine."}
              </span>
            </li>
            <li className={"ia-etape"}>
              <span className={"ia-etape-num"} aria-hidden={"true"}>
                <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                  <path d={"M4 12v7h16v-7M12 3v12M8 7l4-4 4 4"} />
                </svg>
              </span>
              <span className={"ia-etape-n"} aria-hidden={"true"}>{"05"}</span>
              {" "}
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Partager"}
              </h3>
              {" "}
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Ce qui marche devient un skill, utilisable par l’équipe."}
              </span>
            </li>
          </ol>
          {/* Règles de travail dans la méthode (19 nov. 2026) : une liste à 2 colonnes, plus lisible que 5 colonnes étroites. */}
          <div style={css(`display: flex; flex-direction: column; gap: 14px; padding: 2rem; border-radius: 24px; background: linear-gradient(135deg, #F3EFFF 0%, #E9E2FB 100%)`)}>
            <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 24px; font-weight: 800; letter-spacing: -0.03em`)}>
              {"Mes règles de travail"}
            </h3>
            <p style={css(`margin: 0; font-size: 17px; line-height: 1.55; color: #5B5470`)}>
              {"Utiliser l’IA vite ne sert à rien si le résultat n’est pas fiable. Voici ce que je m’impose."}
            </p>
            <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr)); gap: 14px; margin-top: 6px`)}>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px 22px; border-radius: 16px; background: #FFFFFF`)}>
              <span style={css(`display: flex; align-items: center; gap: 10px`)}>
                <Pictogramme d={"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM5.6 5.6l12.8 12.8"} />
                <b style={css(`font-size: 17px; color: #1A1033`)}>{"Ne rien inventer"}</b>
              </span>
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>{"L’IA travaille à partir des textes et des données que je fournis, sans supposition : quand une information manque, elle pose la question."}</span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px 22px; border-radius: 16px; background: #FFFFFF`)}>
              <span style={css(`display: flex; align-items: center; gap: 10px`)}>
                <Pictogramme d={"M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 10.5-4M16 19l2 2 4-4"} />
                <b style={css(`font-size: 17px; color: #1A1033`)}>{"Garder l’humain dans la boucle"}</b>
              </span>
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>{"Chaque livrable est relu et validé par moi, puis par les personnes concernées si besoin, avant toute publication."}</span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px 22px; border-radius: 16px; background: #FFFFFF`)}>
              <span style={css(`display: flex; align-items: center; gap: 10px`)}>
                <Pictogramme d={"M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4"} />
                <b style={css(`font-size: 17px; color: #1A1033`)}>{"Verrouiller le périmètre"}</b>
              </span>
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>{"Je précise ce que l’IA ne doit pas modifier et les étapes de vérification imposées."}</span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px 22px; border-radius: 16px; background: #FFFFFF`)}>
              <span style={css(`display: flex; align-items: center; gap: 10px`)}>
                <Pictogramme d={"M15 7a4 4 0 1 1-3.9 4.9L3 20v-3h3v-3h3l2.1-2.1A4 4 0 0 1 15 7z"} />
                <b style={css(`font-size: 17px; color: #1A1033`)}>{"Protéger les secrets"}</b>
              </span>
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>{"Je ne confie jamais à l’IA de clés d’API, de secrets, de jetons ni d’identifiants."}</span>
            </li>
            </ul>
          </div>
        </section>
        <section className={"ia-bande"} style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Mes routines"}
            </h2>
            <p style={css(`margin: 0; font-size: 17px; line-height: 1.55; color: #5B5470`)}>
              {"Elles se déclenchent toutes seules chaque matin de travail. Je les ai mises en place pour mon propre quotidien."}
            </p>
          </div>
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 16px`)}>
            {v.routines.map((t: any, i_t: number) => (
              <li key={t.title} style={css(`display: grid`)}>
                <IaCard kicker={t.when} title={t.title} text={t.description} note={t.note} icone={iconeRoutine(t.title)}>
                  {t.examples && <IaExemples ex={t.examples} routine={t.title} id={`ia-exemples-${i_t}`} />}
                </IaCard>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
