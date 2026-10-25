"use client";

import { Fragment } from "react";
import { css } from "@/lib/css";
import { CvExperience, CvFormation, Etiquettes } from "./Parcours";
import { Lieu } from "./Lieu";

// Généré depuis docs/passation/prototype-source/cv.source.html
// (scripts/tools/gen.mjs) : markup et styles recopiés à l'identique.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function CvView({ v }: { v: any }) {
  return (
    <>
      <main id={"contenu"} tabIndex={-1} style={css(`max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 4rem; display: flex; flex-direction: column; gap: 3rem`)}>
        {" "}
        <section className={"cv-hero"}>
          {" "}
          <div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 24px`)}>
            {" "}
            <img src={v.photoUrl} alt={v.profil.photoAlt} width={"136"} height={"136"} style={css(`width: 136px; height: 136px; border-radius: 50%; object-fit: cover; border: 4px solid #FFFFFF; box-shadow: 0 0 0 2px #B9A8EC, 0 8px 24px rgba(26,16,51,0.12); flex-shrink: 0; box-sizing: border-box; min-width: 136px; min-height: 136px; max-width: 136px; max-height: 136px; aspect-ratio: 1 / 1`)} />
            {" "}
            <div style={css(`flex: 1 1 320px; min-width: 0; display: flex; flex-direction: column; gap: 12px`)}>
              {" "}
              <h1 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(40px, 5vw, 60px); font-weight: 700; letter-spacing: -0.04em; line-height: 0.98`)}>
                {v.profil.nom}
              </h1>
              {" "}
              <div style={css(`font-size: 20px; font-weight: 700; color: #6A4FB6`)}>
                {v.profil.intitule}
              </div>
              {" "}
              <div style={css(`display: flex; flex-wrap: wrap; gap: 8px; font-size: 15px; margin-top: 8px`)}>
                <span style={css(`padding: 6px 12px; border-radius: 999px; background: var(--brume); font-weight: 700`)}>
                  {v.dispo}
                </span>
                <span style={css(`padding: 6px 12px; border-radius: 999px; border: 1px solid var(--bordure)`)}>
                  <Lieu text={v.profil.lieu} />
                </span>
                <span style={css(`padding: 6px 12px; border-radius: 999px; border: 1px solid var(--bordure)`)}>
                  {v.profil.mobilite}
                </span>
              </div>
            </div>
          </div>
          {/* Coordonnées, comme sur le CV papier : e-mail, téléphone, LinkedIn, GitHub. */}
          <ul className={"cv-contacts"} aria-label={"Coordonnées"}>
            {v.contacts.map((c: any) => (
              <li key={c.href}>
                <a href={c.href} {...(c.externe ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <svg width={"16"} height={"16"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                    <path d={c.icone} />
                  </svg>
                  <span className={"cv-contact-txt"}>
                    {c.texte}
                    {c.externe && (
                      <svg width={"12"} height={"12"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                        <path d={"M7 17L17 7M9 7h8v8"} />
                      </svg>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        {/* Barre du CV, juste au-dessus du contenu : téléchargement du PDF. */}
        <div style={css(`display: flex; flex-direction: column; gap: 2rem`)}>
        <div className={"cv-version"}>
          {/* Seule la version essentielle est publique, sur la page comme dans le PDF. */}
          <div className={"cv-dl"}>
            <a href={v.cvUrl} target={"_blank"} rel={"noopener noreferrer"} className={"cv-dl-btn"} style={css(`padding: 0 22px; border-radius: 999px; background: var(--amethyste); color: var(--fond); border: 2px solid var(--amethyste); display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 16px; font-weight: 700; text-decoration: none`)}>
              <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                <path d={"M12 4v12M7 11l5 5 5-5M4 20h16"} />
              </svg>
              {"Télécharger le PDF"}
            </a>
          </div>
        </div>
        <div style={css(`display: flex; flex-wrap: wrap; gap: 3rem; align-items: flex-start`)}>
          {" "}
          <aside style={css(`flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 1.5rem; border-radius: 24px; background: linear-gradient(135deg, #F3EFFF 0%, #E9E2FB 100%); padding: 26px`)}>
            {" "}
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
              {"Compétences"}
            </h2>
            {" "}
            <div style={css(`display: flex; flex-direction: column; gap: 1.5rem`)}>
              {v.skillsEssentiel.map((g: any) => (
                <div key={g.name} style={css(`display: flex; flex-direction: column; gap: 8px`)}>
                  <h3 style={css(`margin: 0; font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>{g.name}</h3>
                  <Etiquettes items={g.items} style={`padding: 4px 10px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; font-size: 14px; font-weight: 700`} />
                </div>
              ))}
            </div>
            {" "}
            <div style={css(`display: flex; flex-direction: column; gap: 10px`)}>
              <h3 style={css(`margin: 0; font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>
                {"Langues"}
              </h3>
              <div style={css(`display: flex; flex-direction: column; gap: 12px`)}>
                {v.profil.langues.map((l: any) => (
                  <div key={l.nom} style={css(`display: flex; flex-wrap: wrap; gap: 2px 12px; align-items: baseline; font-size: 15px`)}>
                    <b style={css(`flex: 0 0 76px`)}>{l.nom}</b>{" "}
                    {l.niveau.length === 1 ? (
                      <span style={css(`color: #5B5470; flex: 1 1 200px`)}>{l.niveau[0]}</span>
                    ) : (
                      <div style={css(`display: flex; flex-direction: column; gap: 4px; color: #5B5470; flex: 1 1 200px`)}>
                        {l.niveau.map((n: string) => (
                          <span key={n}>{n}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {" "}
          </aside>
          {" "}
          <div style={css(`flex: 1.7 1 460px; min-width: 0; display: flex; flex-direction: column; gap: 2.5rem`)}>
            {" "}
            <section>
              <p style={css(`margin: 0; padding: 18px 20px; border-radius: 16px; background: #F3EFFF; font-size: 17px; line-height: 1.6`)}>
                {v.profil.profilEssentiel}
              </p>
            </section>
            <section>
              <h2 style={css(`margin: 0 0 6px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 32px; font-weight: 800; letter-spacing: -0.03em`)}>
                {"Expériences professionnelles"}
              </h2>
              {v.experiences.map((e: any, i_e: number) => (
                <CvExperience key={i_e} e={e} full={v.isFull} />
              ))}
            </section>
            <section>
              <h2 style={css(`margin: 0 0 6px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 32px; font-weight: 800; letter-spacing: -0.03em`)}>
                {"Formations"}
              </h2>
              {v.formations.map((f: any, i_f: number) => (
                <CvFormation key={i_f} f={f} full={v.isFull} />
              ))}
            </section>
            {" "}
          </div>
          {" "}
        </div>
        </div>
      </main>
    </>
  );
}
