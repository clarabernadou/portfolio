"use client";

import Link from "next/link";
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
      <span style={css(`width: 10px; height: 10px; border-radius: 50%; background: #6A4FB6; box-shadow: 0 0 0 4px #F3EFFF, 0 0 0 5px #B9A8EC; flex-shrink: 0`)} />
      <span style={css(`flex: 1; height: 2px; border-radius: 2px; background: linear-gradient(90deg, #B9A8EC 0%, rgba(185,168,236,0) 100%)`)} />
    </div>
  );
}

export function IaView({ v }: { v: any }) {
  return (
    <>
      <main id={"contenu"} tabIndex={-1} style={css(`max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 4.5rem; display: flex; flex-direction: column; gap: 3.25rem`)}>
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 14px`)}>
            <nav aria-label={"Fil d’Ariane"} style={css(`font-size: 14px; color: #5B5470`)}>
              <Link href={"/"} style={css(`color: #5B5470`)}>
                {"Accueil"}
              </Link>
              {" / IA"}
            </nav>
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
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr)); gap: 1px; background: #E4DCF7; border: 1px solid #E4DCF7; border-radius: 20px; overflow: hidden`)}>
            {v.stats.map((st: any) => (
              <IaStat key={st.label} value={st.value} label={st.label} />
            ))}
          </ul>
        </section>
        <Sep />
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
            {v.tools.map((t: any) => (
              <li key={t.name} style={css(`display: grid`)}>
                <IaCard kicker={t.category} title={t.name} text={t.description} favorite={t.favorite} />
              </li>
            ))}
          </ul>
        </section>
        <Sep />
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
            {v.skills.map((t: any) => (
              <li key={t.name} style={css(`display: grid`)}>
                <IaCard kicker={"Skill"} title={t.name} text={t.description} />
              </li>
            ))}
          </ul>
        </section>
        <Sep />
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Mes routines"}
            </h2>
            <p style={css(`margin: 0; font-size: 17px; line-height: 1.55; color: #5B5470`)}>
              {"Deux de ces routines se déclenchent toutes seules chaque matin ; la troisième est une pratique quotidienne. Je les ai mises en place pour mon propre quotidien."}
            </p>
          </div>
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 16px`)}>
            {v.routines.map((t: any) => (
              <li key={t.title} style={css(`display: grid`)}>
                <IaCard kicker={t.when} title={t.title} text={t.description} note={t.note}>
                  {t.examples && <IaExemples ex={t.examples} />}
                </IaCard>
              </li>
            ))}
          </ul>
        </section>
        <Sep />
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
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Repérer"}
              </h3>
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Une tâche récurrente ou longue, qui se prête à l’automatisation."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF`)}>
              <span style={css(`width: 32px; height: 32px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800`)}>
                {"2"}
              </span>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Cadrer"}
              </h3>
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Le texte source fourni, le format attendu et ce que l’IA ne doit pas toucher."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF`)}>
              <span style={css(`width: 32px; height: 32px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800`)}>
                {"3"}
              </span>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Itérer"}
              </h3>
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Je fais produire, je relis, je corrige avec des consignes précises."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF`)}>
              <span style={css(`width: 32px; height: 32px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800`)}>
                {"4"}
              </span>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Vérifier"}
              </h3>
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Contrastes, cohérence avec la charte, fidélité au texte d’origine."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF`)}>
              <span style={css(`width: 32px; height: 32px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800`)}>
                {"5"}
              </span>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Partager"}
              </h3>
              <span style={css(`font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                {"Ce qui marche devient un skill, utilisable par l’équipe."}
              </span>
            </li>
          </ol>
        </section>
        <Sep />
        <section style={css(`padding: 2rem; border-radius: 24px; background: linear-gradient(135deg, #F3EFFF 0%, #E9E2FB 100%); display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Mes règles de travail"}
            </h2>
            <p style={css(`margin: 0; font-size: 17px; line-height: 1.55; color: #5B5470`)}>
              {"Utiliser l’IA vite ne sert à rien si le résultat n’est pas fiable. Voici ce que je m’impose."}
            </p>
          </div>
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: 14px`)}>
            <li style={css(`display: flex; flex-direction: column; gap: 6px; padding: 22px 24px; border-radius: 20px; background: #FFFFFF; border-left: 4px solid #6A4FB6`)}>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Ne rien inventer"}
              </h3>
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>
                {"L’IA travaille à partir des textes et des données que je fournis."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 6px; padding: 22px 24px; border-radius: 20px; background: #FFFFFF; border-left: 4px solid #6A4FB6`)}>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Vérifier avant de livrer"}
              </h3>
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>
                {"Contrastes, cohérence de la charte et relecture, à chaque livrable."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 6px; padding: 22px 24px; border-radius: 20px; background: #FFFFFF; border-left: 4px solid #6A4FB6`)}>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Garder l’humain dans la boucle"}
              </h3>
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>
                {"Chaque livrable est relu et validé par moi, puis par les personnes concernées si besoin, avant toute publication."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 6px; padding: 22px 24px; border-radius: 20px; background: #FFFFFF; border-left: 4px solid #6A4FB6`)}>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Verrouiller le périmètre"}
              </h3>
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>
                {"Je précise ce que l’IA ne doit pas modifier et les étapes de vérification imposées."}
              </span>
            </li>
            <li style={css(`display: flex; flex-direction: column; gap: 6px; padding: 22px 24px; border-radius: 20px; background: #FFFFFF; border-left: 4px solid #6A4FB6`)}>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
                {"Protéger les secrets"}
              </h3>
              <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470`)}>
                {"Je ne confie jamais à l’IA de clés d’API, de secrets, de jetons ni d’identifiants."}
              </span>
            </li>
          </ul>
        </section>
        <Sep />
        <section style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05`)}>
              {"Ce que ça a produit"}
            </h2>
          </div>
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 16px`)}>
            <li style={css(`display: grid`)}>
            <Link href={"/projets/repositionnement-fruggr"} style={css(`text-decoration: none; color: #1A1033; border-radius: 20px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 10px`)}>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em`)}>
                {"Saga de 3 films pour Fruggr"}
              </h3>
              <span style={css(`font-size: 16px; line-height: 1.55; color: #5B5470`)}>
                {"Du script au rendu final : Remotion, voix off ElevenLabs, musique, déclinaison en 16:9, 9:16 et 1:1, publiée sur YouTube."}
              </span>
              <span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6`)}>
                {"Voir le projet →"}
              </span>
            </Link>
            </li>
            <li style={css(`display: grid`)}>
            <Link href={"/projets/portfolio"} style={css(`text-decoration: none; color: #1A1033; border-radius: 20px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 10px`)}>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em`)}>
                {"Ce portfolio"}
              </h3>
              <span style={css(`font-size: 16px; line-height: 1.55; color: #5B5470`)}>
                {"Maquettes avec Claude Design, développement avec Claude Code, charte, design system et dossier de passation."}
              </span>
              <span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6`)}>
                {"Voir le projet →"}
              </span>
            </Link>
            </li>
            <li style={css(`display: grid`)}>
            <Link href={"/projets/intuitlearn"} style={css(`text-decoration: none; color: #1A1033; border-radius: 20px; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 10px`)}>
              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em`)}>
                {"Audits de sites"}
              </h3>
              <span style={css(`font-size: 16px; line-height: 1.55; color: #5B5470`)}>
                {"Skills d’audit UX, accessibilité et marque appliqués au site Fruggr et à une application tierce."}
              </span>
              <span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6`)}>
                {"Voir le projet →"}
              </span>
            </Link>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
