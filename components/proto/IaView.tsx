"use client";

import { CarteProjet } from "./LienProjet";
import { css } from "@/lib/css";
import { IaCard, IaStat } from "./IaCards";
import { IaExemples } from "./IaExemples";

// Généré depuis docs/passation/prototype-source/ia.source.html
// (scripts/tools/gen.mjs) : markup et styles recopiés à l'identique.
/* eslint-disable @typescript-eslint/no-explicit-any */
// Séparateur décoratif entre les sections de la page IA (demande de Clara, 24 octobre 2026).
function Sep() {
  return (
    <div aria-hidden={"true"} style={css(`display: flex; align-items: center; gap: 14px; margin: -0.5rem 0`)}>
      <span style={css(`flex: 1; height: 2px; border-radius: 2px; background: linear-gradient(90deg, rgba(185,168,236,0) 0%, #B9A8EC 100%)`)} />
      {" "}
      <span style={css(`width: 10px; height: 10px; border-radius: 50%; background: #6A4FB6; box-shadow: 0 0 0 4px #F3EFFF, 0 0 0 5px #B9A8EC; flex-shrink: 0`)} />
      {" "}
      <span style={css(`flex: 1; height: 2px; border-radius: 2px; background: linear-gradient(90deg, #B9A8EC 0%, rgba(185,168,236,0) 100%)`)} />
    </div>
  );
}

// Outils et skills mis en avant (case « Mis en avant » de l'administration ; à défaut, les 3 premiers).
const vedettes = (l: any[]) => (l.some((x) => x.vedette) ? l.filter((x) => x.vedette) : l.slice(0, 3));
const autres = (l: any[]) => {
  const v = vedettes(l);
  return l.filter((x) => !v.includes(x));
};

// Liste compacte des outils ou skills qui ne sont pas mis en avant.
function Autres({ titre, items }: { titre: string; items: { nom: string; detail?: string }[] }) {
  if (!items.length) return null;
  return (
    <div style={css(`display: flex; flex-direction: column; gap: 10px; padding: 20px 22px; border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF`)}>
      <h3 style={css(`margin: 0; font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>{titre}</h3>
      <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); gap: 8px 24px`)}>
        {items.map((x) => (
          <li key={x.nom} style={css(`font-size: 16px; line-height: 1.45`)}>
            <b style={css(`color: #1A1033`)}>{x.nom}</b>
            {x.detail && <span style={css(`color: #5B5470`)}>{` · ${x.detail}`}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

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

// Coche décorative des règles de travail.
function Coche() {
  return (
    <span aria-hidden={"true"} style={css(`flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: inline-flex; align-items: center; justify-content: center; margin-top: -1px`)}>
      <svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"3"} strokeLinecap={"round"} strokeLinejoin={"round"}>
        <path d={"M5 12l5 5 9-10"} />
      </svg>
    </span>
  );
}

export function IaView({ v }: { v: any }) {
  return (
    <>
      <main id={"contenu"} tabIndex={-1} style={css(`max-width: 1200px; margin: 0 auto; padding: clamp(2.5rem, 5vw, 3.5rem) 2rem var(--espace-section); display: flex; flex-direction: column; gap: var(--espace-section-demi)`)}>
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 14px`)}>
            <h1 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(38px, 6vw, 64px); letter-spacing: -0.045em; line-height: 1`)}>
              <span style={css(`font-weight: 800`)}>
                {"Ma façon de travailler"}
              </span>
              {" "}
              <span style={css(`font-weight: 300; color: #6A4FB6`)}>
                {"avec l’IA"}
              </span>
            </h1>
            <p style={css(`margin: 0; font-size: 20px; line-height: 1.55`)}>
              {"J’utilise l’IA tous les jours pour développer, concevoir et produire du contenu. Je choisis l’outil le plus adapté à chaque tâche, je construis des skills pour automatiser le répétitif, et je vérifie toujours le résultat avant de le livrer."}
            </p>
          </div>
          {" "}
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr)); gap: 1px; background: #E4DCF7; border: 1px solid #E4DCF7; border-radius: 20px; overflow: hidden`)}>
            {v.stats.map((st: any) => (
              <IaStat key={st.label} value={st.value} label={st.label} />
            ))}
          </ul>
        </section>
        <Sep />
        {" "}
        {/* Hiérarchie de la page (19 nov. 2026) : les réalisations d'abord, puis les outils et skills mis en avant
            (les autres en liste compacte), la méthode avec ses règles, et les routines. */}
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Ce que ça a produit"}
            </h2>
          </div>
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 16px`)}>
            <li style={css(`display: grid`)}>
            <CarteProjet id={"repositionnement-fruggr"} publics={v.publics} separe style={`text-decoration: none; color: #1A1033; border-radius: 20px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 10px`} suite={<span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6`)}>{"Voir le projet →"}</span>}>
              <Icone d={"M4 6h12v12H4zM16 10l4-2v8l-4-2"} />
              {" "}
              <h3 id={"repositionnement-fruggr-titre"} style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em`)}>
                {"Saga de 3 films pour Fruggr"}
              </h3>
              {" "}
              <span id={"repositionnement-fruggr-desc"} style={css(`font-size: 16px; line-height: 1.55; color: #5B5470`)}>
                {"Du script au rendu final : Remotion, voix off ElevenLabs, musique, déclinaison en 16:9, 9:16 et 1:1, publiée sur YouTube."}
              </span>
            </CarteProjet>
            </li>
            <li style={css(`display: grid`)}>
            <CarteProjet id={"portfolio"} publics={v.publics} separe style={`text-decoration: none; color: #1A1033; border-radius: 20px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 10px`} suite={<span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6`)}>{"Voir le projet →"}</span>}>
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
            <CarteProjet id={"intuitlearn"} publics={v.publics} separe style={`text-decoration: none; color: #1A1033; border-radius: 20px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 10px`} suite={<span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6`)}>{"Voir le projet →"}</span>}>
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
          </ul>
        </section>
        <Sep />
        {" "}
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Mes outils"}
            </h2>
            <p style={css(`margin: 0; font-size: 17px; line-height: 1.55; color: #5B5470`)}>
              {"Chaque IA a ses points forts. Je choisis la plus adaptée à chaque tâche."}
            </p>
          </div>
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 16px`)}>
            {vedettes(v.tools).map((t: any) => (
              <li key={t.name} style={css(`display: grid`)}>
                <IaCard kicker={t.category} title={t.name} text={t.description} favorite={t.favorite} />
              </li>
            ))}
          </ul>
          <Autres titre={"Aussi, selon la tâche"} items={autres(v.tools).map((t: any) => ({ nom: t.name, detail: t.category }))} />
        </section>
        <Sep />
        {" "}
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Les skills que j’ai créés"}
            </h2>
            <p style={css(`margin: 0; font-size: 17px; line-height: 1.55; color: #5B5470`)}>
              {"Des skills Claude réutilisables, créés pour mon poste chez Digital4Better, l’entreprise où je suis alternante, et proposés à l’équipe. Chaque skill regroupe les consignes, les modèles et les vérifications d’une tâche récurrente, pour la refaire à l’identique. Ils restent internes à l’entreprise : je décris ce qu’ils font, sans en montrer le contenu."}
            </p>
          </div>
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 16px`)}>
            {vedettes(v.skills).map((t: any) => (
              <li key={t.name} style={css(`display: grid`)}>
                <IaCard kicker={"Skill"} title={t.name} text={t.description} />
              </li>
            ))}
          </ul>
          <Autres titre={"Autres skills"} items={autres(v.skills).map((t: any) => ({ nom: t.name }))} />
        </section>
        <Sep />
        {" "}
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Ma méthode"}
            </h2>
          </div>
          <ol style={css(`list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr)); gap: 12px`)}>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF`)}>
              <span style={css(`width: 32px; height: 32px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800`)}>
                {"1"}
              </span>
              {" "}
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Repérer"}
              </h3>
              {" "}
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Une tâche récurrente ou longue, qui se prête à l’automatisation."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF`)}>
              <span style={css(`width: 32px; height: 32px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800`)}>
                {"2"}
              </span>
              {" "}
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Cadrer"}
              </h3>
              {" "}
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Le texte source fourni, le format attendu et ce que l’IA ne doit pas toucher."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF`)}>
              <span style={css(`width: 32px; height: 32px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800`)}>
                {"3"}
              </span>
              {" "}
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Itérer"}
              </h3>
              {" "}
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Je fais produire, je relis, je corrige avec des consignes précises."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF`)}>
              <span style={css(`width: 32px; height: 32px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800`)}>
                {"4"}
              </span>
              {" "}
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Vérifier"}
              </h3>
              {" "}
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Contrastes, cohérence avec la charte, fidélité au texte d’origine."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF`)}>
              <span style={css(`width: 32px; height: 32px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800`)}>
                {"5"}
              </span>
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
            <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr)); gap: 16px 40px; margin-top: 6px`)}>
            <li style={css(`display: flex; gap: 12px; align-items: flex-start`)}>
              <Coche />
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>
                <b style={css(`color: #1A1033`)}>{"Ne rien inventer"}</b>{" : "}
                {"L’IA travaille à partir des textes et des données que je fournis."}
              </span>
            </li>
            <li style={css(`display: flex; gap: 12px; align-items: flex-start`)}>
              <Coche />
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>
                <b style={css(`color: #1A1033`)}>{"Garder l’humain dans la boucle"}</b>{" : "}
                {"Chaque livrable est relu et validé par moi, puis par les personnes concernées si besoin, avant toute publication."}
              </span>
            </li>
            <li style={css(`display: flex; gap: 12px; align-items: flex-start`)}>
              <Coche />
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>
                <b style={css(`color: #1A1033`)}>{"Verrouiller le périmètre"}</b>{" : "}
                {"Je précise ce que l’IA ne doit pas modifier et les étapes de vérification imposées."}
              </span>
            </li>
            <li style={css(`display: flex; gap: 12px; align-items: flex-start`)}>
              <Coche />
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>
                <b style={css(`color: #1A1033`)}>{"Protéger les secrets"}</b>{" : "}
                {"Je ne confie jamais à l’IA de clés d’API, de secrets, de jetons ni d’identifiants."}
              </span>
            </li>
            </ul>
          </div>
        </section>
        <Sep />
        {" "}
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
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
                <IaCard kicker={t.when} title={t.title} text={t.description} note={t.note}>
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
