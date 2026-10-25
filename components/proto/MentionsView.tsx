"use client";

import { Fragment } from "react";
import Link from "next/link";
import { css } from "@/lib/css";

// Généré depuis docs/passation/prototype-source/mentions.source.html
// (scripts/tools/gen.mjs) : markup et styles recopiés à l'identique.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function MentionsView({ v }: { v: any }) {
  return (
    <>
      <main style={css(`max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 4.5rem; display: flex; flex-direction: column; gap: 2.5rem`)}>
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
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Nom"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"Clara Bernadou"}
            </span>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Contact"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              <a href={"mailto:clarabernadou56690@gmail.com"}>
                {"clarabernadou56690@gmail.com"}
              </a>
            </span>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Directrice de la publication"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"Clara Bernadou"}
            </span>
          </div>
        </section>
        {" "}
        <section style={css(`display: flex; flex-direction: column`)}>
          <h2 style={css(`margin: 0 0 10px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
            {"Hébergement"}
          </h2>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Hébergeur"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"Vercel Inc."}
            </span>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Adresse"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"440 N Barranca Ave #4133, Covina, CA 91723, États-Unis"}
            </span>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Téléphone"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"+1 951 383 6898"}
            </span>
          </div>
        </section>
        {" "}
        <section style={css(`display: flex; flex-direction: column`)}>
          <h2 style={css(`margin: 0 0 10px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
            {"Données personnelles"}
          </h2>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Cookies"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"Ce site ne dépose aucun cookie."}
            </span>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Vidéos YouTube"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"Les vidéos ne se chargent qu’après un clic. YouTube peut alors déposer ses propres cookies, selon sa politique."}
            </span>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"E-mails reçus"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"Utilisés uniquement pour vous répondre, jamais transmis à des tiers."}
            </span>
          </div>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Vos droits"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"Accès, rectification et suppression : "}
              <a href={"mailto:clarabernadou56690@gmail.com"}>
                {"clarabernadou56690@gmail.com"}
              </a>
              {". Vous pouvez aussi saisir la CNIL."}
            </span>
          </div>
        </section>
        {" "}
        <section style={css(`display: flex; flex-direction: column`)}>
          <h2 style={css(`margin: 0 0 10px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
            {"Propriété intellectuelle"}
          </h2>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Contenus"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"Textes, visuels, logo et livrables © Clara Bernadou, sauf mention contraire."}
            </span>
          </div>
        </section>
        {" "}
        <section style={css(`display: flex; flex-direction: column`)}>
          <h2 style={css(`margin: 0 0 10px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
            {"Droit applicable"}
          </h2>
          <div style={css(`display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; line-height: 1.5`)}>
            <span style={css(`flex: 0 0 220px; font-weight: 700`)}>
              {"Juridiction"}
            </span>
            <span style={css(`flex: 1 1 300px; color: #5B5470`)}>
              {"Droit français"}
            </span>
          </div>
        </section>
        {" "}
      </main>
    </>
  );
}
