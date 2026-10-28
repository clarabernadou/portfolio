"use client";

import Link from "next/link";
import { css } from "@/lib/css";

// Généré depuis docs/passation/prototype-source/mentions.source.html
// (scripts/tools/gen.mjs) : markup et styles recopiés à l'identique.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function MentionsView({ v }: { v: any }) {
  return (
    <>
      <main id={"contenu"} tabIndex={-1} style={css(`max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 4.5rem; display: flex; flex-direction: column; gap: 2.5rem`)}>
        {" "}
        <div style={css(`display: flex; flex-direction: column; gap: 10px`)}>
          <nav aria-label={"Fil d’Ariane"} style={css(`font-size: 14px; color: #5B5470`)}>
            <Link href={"/"} style={css(`color: #5B5470`)}>
              {"Accueil"}
            </Link>
            {" / Mentions légales"}
          </nav>
          <h1 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(36px, 5vw, 52px); letter-spacing: -0.045em; line-height: 1`)}>
            <span style={css(`font-weight: 800`)}>
              {"Mentions légales"}
            </span>
            {" "}
            <span style={css(`font-weight: 300; color: #6A4FB6`)}>
              {"et confidentialité"}
            </span>
          </h1>
        </div>
        {" "}
        <section style={css(`display: flex; flex-direction: column`)}>
          <h2 style={css(`margin: 0 0 10px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
            {"Éditrice du site"}
          </h2>
          <dl style={css(`margin: 0`)}>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Nom"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"Clara Bernadou"}
            </dd>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Contact"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              <a href={"mailto:contact@clarabernadou.fr"}>
                {"contact@clarabernadou.fr"}
              </a>
            </dd>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Directrice de la publication"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"Clara Bernadou"}
            </dd>
          </div>
          </dl>
        </section>
        {" "}
        <section style={css(`display: flex; flex-direction: column`)}>
          <h2 style={css(`margin: 0 0 10px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
            {"Hébergement"}
          </h2>
          <dl style={css(`margin: 0`)}>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Hébergeur"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"Vercel Inc."}
            </dd>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Adresse"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"440 N Barranca Ave #4133, Covina, CA 91723, États-Unis"}
            </dd>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Téléphone"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"+1 951 383 6898"}
            </dd>
          </div>
          </dl>
        </section>
        {" "}
        <section style={css(`display: flex; flex-direction: column`)}>
          <h2 style={css(`margin: 0 0 10px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
            {"Données personnelles"}
          </h2>
          <dl style={css(`margin: 0`)}>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Cookies"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"Ce site ne dépose aucun cookie."}
            </dd>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Vidéos YouTube"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"Les vidéos ne se chargent qu’après un clic. YouTube peut alors déposer ses propres cookies, selon sa politique."}
            </dd>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"E-mails reçus"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"Utilisés uniquement pour vous répondre, jamais transmis à des tiers."}
            </dd>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Vos droits"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"Accès, rectification et suppression : "}
              <a href={"mailto:contact@clarabernadou.fr"}>
                {"contact@clarabernadou.fr"}
              </a>
              {". Vous pouvez aussi saisir la CNIL."}
            </dd>
          </div>
          </dl>
        </section>
        {" "}
        <section style={css(`display: flex; flex-direction: column`)}>
          <h2 style={css(`margin: 0 0 10px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
            {"Propriété intellectuelle"}
          </h2>
          <dl style={css(`margin: 0`)}>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Contenus"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"Textes, visuels, logo et livrables © Clara Bernadou, sauf mention contraire."}
            </dd>
          </div>
          </dl>
        </section>
        {" "}
        <section style={css(`display: flex; flex-direction: column`)}>
          <h2 style={css(`margin: 0 0 10px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
            {"Droit applicable"}
          </h2>
          <dl style={css(`margin: 0`)}>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <dt style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Juridiction"}
            </dt>
            <dd style={css(`margin: 0; flex: 1 1 300px; color: #5B5470`)}>
              {"Droit français"}
            </dd>
          </div>
          </dl>
        </section>
        {" "}
      </main>
    </>
  );
}
