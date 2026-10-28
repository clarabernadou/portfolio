"use client";

import { Fragment } from "react";
import Link from "next/link";
import { css } from "@/lib/css";

// Généré depuis docs/passation/prototype-source/projets.source.html
// (scripts/tools/gen.mjs) : markup et styles recopiés à l'identique.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function ProjetsView({ v }: { v: any }) {
  return (
    <>
      <main id={"contenu"} tabIndex={-1} style={css(`max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 4.5rem`)}>
        {" "}
        {v.isList && (
          <>
            <div style={css(`display: flex; flex-direction: column; gap: 1.75rem`)}>
              {" "}
              <div style={css(`display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1rem`)}>
                {" "}
                <div style={css(`display: flex; flex-direction: column; gap: 10px`)}>
                  <nav aria-label={"Fil d’Ariane"} style={css(`font-size: 14px; color: #5B5470`)}>
                    <Link href={"/"} style={css(`color: #5B5470`)}>
                      {"Accueil"}
                    </Link>
                    {" / Projets"}
                  </nav>
                  <h1 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(40px, 5vw, 60px); letter-spacing: -0.045em; line-height: 1`)}>
                    <span style={css(`font-weight: 800`)}>
                      {"Tous les"}
                    </span>
                    {" "}
                    <span style={css(`font-weight: 300; color: #6A4FB6`)}>
                      {"projets"}
                    </span>
                  </h1>
                </div>
                {" "}
              </div>
              {" "}
              {v.showHonor && (
                <>
                  <section aria-labelledby={"honneur"} style={css(`display: flex; flex-direction: column; gap: 14px`)}>
                    <div style={css(`display: flex; flex-direction: column; gap: 2px`)}>
                      <h2 id={"honneur"} style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 28px; font-weight: 800; letter-spacing: -0.03em`)}>
                        {"Projets phares"}
                      </h2>
                      <span style={css(`font-size: 15px; color: #5B5470`)}>
                        {"Trois projets que je mets en avant. Les autres complètent le portfolio."}
                      </span>
                    </div>
                    <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 1.25rem`)}>
                      {v.honored.map((p: any, i_p: number) => (
                        <li key={i_p} style={css(`display: grid`)}>
                          <article style={css(`border-radius: 20px; background: #F3EFFF; border: 1.5px solid #B9A8EC; display: flex; flex-direction: column`)}>
                            <div style={css(`padding: 22px 22px 24px; display: flex; flex-direction: column; gap: 10px; flex-grow: 1`)}>
                              <div style={css(`display: flex; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 700; color: #5B5470`)}>
                                <span style={css(`letter-spacing: 0.06em; text-transform: uppercase`)}>
                                  <span>{p.type}</span>
                                </span>
                                <span>
                                  <span>{p.date}</span>
                                </span>
                              </div>
                              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1`)}>
                                <span>{p.name}</span>
                              </h3>
                              <span style={css(`font-size: 14px; font-weight: 700; color: #6A4FB6`)}>
                                <span>{p.parcours}</span>
                              </span>
                              <p style={css(`margin: 0; font-size: 16px; line-height: 1.55`)}>
                                <span>{p.ctx}</span>
                              </p>
                              <ul role={"list"} aria-label={"Technologies et livrables"} className={"liste-nue"} style={css(`display: flex; gap: 6px; flex-wrap: wrap`)}>
                                {p.tags.map((t: any, i_t: number) => (
                                    <li key={i_t} style={css(`padding: 3px 8px; border-radius: 6px; background: #FFFFFF; color: #5B5470; font-size: 13px; font-weight: 600`)}>
                                      {t}
                                    </li>
                                ))}
                              </ul>
                              <div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: auto; padding-top: 8px`)}>
                                <Link href={p.href} aria-label={`Voir le projet ${p.name}`} style={css(`min-height: 44px; padding: 0 18px; border-radius: 999px; border: 0; background: #6A4FB6; color: #FFFFFF; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; text-decoration: none`)}>
                                  {"Voir le projet"}
                                </Link>
                                {p.hasGh && (
                                  <>
                                    <a href={p.ghh} target={"_blank"} rel={"noopener noreferrer"} aria-label={`Dépôt GitHub de ${p.name}`} style={css(`min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #1A1033; color: #1A1033; display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; text-decoration: none`)}>
                                      {"GitHub ↗"}
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}
              {" "}
              {/* Aucun projet public (tous privés ou en brouillon, relecture du 28 octobre 2026) :
                  une phrase à la place des filtres et de la liste vides. */}
              {v.vide ? (
                <p style={css(`margin: 0; font-size: 17px; line-height: 1.55; color: #5B5470`)}>
                  {"Les projets sont en cours de relecture et seront publiés très prochainement."}
                </p>
              ) : (
                <>
              <h2 className={"visuellement-masque"}>{"Liste des projets"}</h2>
              <div style={css(`display: flex; flex-direction: column; gap: 16px; padding: 20px; border-radius: 20px; border: 1px solid #E4DCF7`)}>
                {" "}
                <div role={"group"} aria-labelledby={"f-type"} style={css(`display: flex; flex-wrap: wrap; gap: 8px`)}>
                  <span id={"f-type"} style={css(`flex: 0 0 auto; width: 100%; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>
                    {"Filtrer par type de projet"}
                  </span>
                  {v.types.map((c: any, i_c: number) => (
                    <Fragment key={i_c}>
                      <button type={"button"} aria-pressed={c.on} onClick={c.pick} style={css(`min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #6A4FB6; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; background: ${c.bg}; color: ${c.fg}`)}>
                        <span>{c.label}</span>{" "}
                        <span style={css(`opacity: 0.9`)}>
                          <span>{c.n}</span>
                        </span>
                        {c.on && <span className={"visuellement-masque"} aria-hidden={"true"}>{" (sélectionné)"}</span>}
                      </button>
                    </Fragment>
                  ))}
                </div>
                {" "}
                <div role={"group"} aria-labelledby={"f-par"} style={css(`display: flex; flex-wrap: wrap; gap: 8px`)}>
                  <span id={"f-par"} style={css(`flex: 0 0 auto; width: 100%; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>
                    {"Filtrer par formation ou cadre"}
                  </span>
                  {v.pars.map((c: any, i_c: number) => (
                    <Fragment key={i_c}>
                      <button type={"button"} aria-pressed={c.on} onClick={c.pick} style={css(`min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #B9A8EC; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; background: ${c.bg}; color: ${c.fg}`)}>
                        <span>{c.label}</span>{" "}
                        <span style={css(`opacity: 0.9`)}>
                          <span>{c.n}</span>
                        </span>
                        {c.on && <span className={"visuellement-masque"} aria-hidden={"true"}>{" (sélectionné)"}</span>}
                      </button>
                    </Fragment>
                  ))}
                </div>
                {" "}
              </div>
              {" "}
              <div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px`)}>
                <span style={css(`font-size: 16px; font-weight: 700`)} aria-live={"polite"}>
                  <span>{v.countLabel}</span>
                </span>{" "}
                <span style={css(`font-size: 14px; color: #5B5470`)}>
                  {"Du plus récent au plus ancien."}
                </span>
                {v.filtered && (
                  <>
                    <button type={"button"} onClick={v.reset} style={css(`min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #1A1033; background: #FFFFFF; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)}>
                      {"Réinitialiser les filtres"}
                    </button>
                  </>
                )}
              </div>
              {" "}
              <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); gap: 1.25rem`)}>
                {v.shown.map((p: any, i_p: number) => (
                  <li key={i_p} style={css(`display: grid`)}>
                    <article style={css(`border-radius: 20px; background: #FFFFFF; border: 1px solid #E4DCF7; overflow: hidden; display: flex; flex-direction: column`)}>
                      {" "}
                      <div style={css(`padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 9px; flex-grow: 1`)}>
                        {" "}
                        <div style={css(`display: flex; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 700; color: #5B5470`)}>
                          <span style={css(`letter-spacing: 0.06em; text-transform: uppercase`)}>
                            <span>{p.type}</span>
                          </span>
                          <span>
                            <span>{p.date}</span>
                          </span>
                        </div>
                        {" "}
                        <h3 id={`carte-projet-${i_p}`} tabIndex={-1} style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1`)}>
                          <span>{p.name}</span>
                        </h3>
                        {" "}
                        <span style={css(`font-size: 14px; font-weight: 700; color: #6A4FB6`)}>
                          <span>{p.parcours}</span>
                        </span>
                        {" "}
                        <p style={css(`margin: 0; font-size: 15px; line-height: 1.5; color: #5B5470`)}>
                          <span>{p.line}</span>
                        </p>
                        {" "}
                        <ul role={"list"} aria-label={"Technologies et livrables"} className={"liste-nue"} style={css(`display: flex; gap: 6px; flex-wrap: wrap`)}>
                          {p.tags.map((t: any, i_t: number) => (
                              <li key={i_t} style={css(`padding: 3px 8px; border-radius: 6px; background: #F3EFFF; color: #5B5470; font-size: 13px; font-weight: 600`)}>
                                {t}
                              </li>
                          ))}
                        </ul>
                        {" "}
                        <div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: auto; padding-top: 8px`)}>
                          {" "}
                          <Link href={p.href} aria-label={`Voir le projet ${p.name}`} style={css(`min-height: 44px; padding: 0 16px; border-radius: 999px; border: 0; background: #6A4FB6; color: #FFFFFF; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; text-decoration: none`)}>
                            {"Voir le projet"}
                          </Link>
                          {" "}
                          {p.hasGh && (
                            <>
                              <a href={p.ghh} target={"_blank"} rel={"noopener noreferrer"} aria-label={`Dépôt GitHub de ${p.name}`} style={css(`min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #1A1033; color: #1A1033; display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; text-decoration: none`)}>
                                {"GitHub "}
                                <svg width={"16"} height={"16"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                                  <path d={"M7 17L17 7M9 7h8v8"} />
                                </svg>
                              </a>
                            </>
                          )}
                          {" "}
                        </div>
                        {" "}
                      </div>
                      {" "}
                    </article>
                  </li>
                ))}
              </ul>
              <div style={css(`display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 4px`)}>
                <span aria-live={"polite"} style={css(`font-size: 15px; color: #5B5470`)}>
                  <span>{v.shownLabel}</span>
                </span>
                {v.hasMore && (
                  <>
                    <button type={"button"} onClick={v.more} style={css(`min-height: 48px; padding: 0 24px; border-radius: 999px; border: 1.5px solid #1A1033; background: #FFFFFF; color: #1A1033; font: inherit; font-size: 16px; font-weight: 700; cursor: pointer`)}>
                      <span>{v.moreLabel}</span>
                    </button>
                  </>
                )}
              </div>
                </>
              )}
              {" "}
            </div>
          </>
        )}
        {" "}
        {v.isDetail && (
          <>
            <article style={css(`display: flex; flex-direction: column; gap: 2rem`)}>
              {" "}
              <div style={css(`display: flex; flex-direction: column; align-items: flex-start; gap: 2px`)}>
                <Link href={"/projets"} style={css(`min-height: 44px; padding: 0; border: 0; background: none; color: #6A4FB6; font: inherit; font-size: 16px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; text-decoration: none`)}>
                  <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                    <path d={"M19 12H5M11 18l-6-6 6-6"} />
                  </svg>
                  {"Retour aux projets"}
                </Link>
                <nav aria-label={"Fil d’Ariane"} style={css(`font-size: 14px; color: #5B5470`)}>
                  <Link href={"/"} style={css(`color: #5B5470`)}>
                    {"Accueil"}
                  </Link>
                  {" / Projets / "}<span>{v.cur.name}</span>
                </nav>
              </div>
              {" "}
              <header style={css(`display: flex; flex-direction: column; gap: 12px`)}>
                {" "}
                <div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 8px`)}>
                  <ul role={"list"} aria-label={"Types de projet"} className={"liste-nue"} style={css(`display: flex; flex-wrap: wrap; gap: 8px`)}>
                    {v.cur.types.map((ty: any, i_ty: number) => (
                      <li key={i_ty} style={css(`padding: 5px 10px; border-radius: 8px; background: #F3EFFF; color: #6A4FB6; font-size: 13px; font-weight: 700`)}>
                        {ty}
                      </li>
                    ))}
                  </ul>{" "}
                  <span style={css(`font-size: 14px; font-weight: 700; color: #5B5470; margin-left: 4px`)}>
                    <span>{v.cur.date}</span>
                  </span>
                </div>
                {" "}
                <h1 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(40px, 5vw, 64px); font-weight: 800; letter-spacing: -0.045em; line-height: 1`)}>
                  <span>{v.cur.name}</span>
                </h1>
                {" "}
                <p style={css(`margin: 0; font-size: 20px; line-height: 1.5; font-weight: 500`)}>
                  <span>{v.cur.line}</span>
                </p>
                {" "}
                <span style={css(`font-size: 17px; font-weight: 700; color: #6A4FB6`)}>
                  <span>{v.cur.parcours}</span>
                </span>
                {" "}
                <ul role={"list"} aria-label={"Technologies et livrables"} className={"liste-nue"} style={css(`display: flex; gap: 6px; flex-wrap: wrap`)}>
                  {v.cur.tags.map((t: any, i_t: number) => (
                      <li key={i_t} style={css(`padding: 3px 8px; border-radius: 6px; background: #F3EFFF; color: #5B5470; font-size: 13px; font-weight: 600`)}>
                        {t}
                      </li>
                  ))}
                </ul>
                {" "}
                <div style={css(`display: flex; flex-wrap: wrap; gap: 10px; padding-top: 8px`)}>
                  {" "}
                  {v.cur.hasSite && (
                    <>
                      <a href={v.cur.siteh} target={"_blank"} rel={"noopener noreferrer"} style={css(`min-height: 44px; padding: 0 16px; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; display: inline-flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 700; text-decoration: none`)}>
                        {"Voir le site "}
                        <svg width={"16"} height={"16"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                          <path d={"M7 17L17 7M9 7h8v8"} />
                        </svg>
                      </a>
                    </>
                  )}
                  {" "}
                  {v.cur.hasPdf && (
                    <>
                      <a href={v.cur.pdfh} target={"_blank"} rel={"noopener noreferrer"} style={css(`min-height: 44px; padding: 0 16px; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; display: inline-flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 700; text-decoration: none`)}>
                        {`Tous les livrables · ${v.cur.pdfFormat}`}
                      </a>
                    </>
                  )}
                  {" "}
                  {v.cur.hasGh && (
                    <>
                      <a href={v.cur.ghh} target={"_blank"} rel={"noopener noreferrer"} style={css(`min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #1A1033; color: #1A1033; display: inline-flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 700; text-decoration: none`)}>
                        {"Dépôt GitHub "}
                        <svg width={"16"} height={"16"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                          <path d={"M7 17L17 7M9 7h8v8"} />
                        </svg>
                      </a>
                    </>
                  )}
                  {" "}
                  {v.cur.hasFig && (
                    <>
                      <a href={v.cur.figh} target={"_blank"} rel={"noopener noreferrer"} style={css(`min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #1A1033; color: #1A1033; display: inline-flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 700; text-decoration: none`)}>
                        {"Maquettes Figma "}
                        <svg width={"16"} height={"16"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                          <path d={"M7 17L17 7M9 7h8v8"} />
                        </svg>
                      </a>
                    </>
                  )}
                  {" "}
                </div>
                {" "}
              </header>
              {" "}
              {v.cur.hasSteps && (
                <>
                  <section style={css(`border-radius: 24px; background: linear-gradient(135deg, #F3EFFF 0%, #E9E2FB 100%); padding: clamp(1.25rem, 3vw, 2rem)`)}>
                    <h2 style={css(`margin: 0 0 8px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 28px; font-weight: 800; letter-spacing: -0.03em`)}>
                      {"Avancement"}
                    </h2>
                    <ol style={css(`list-style: none; margin: 0; padding: 0 18px; background: #FFFFFF; border-radius: 16px`)}>
                      {v.cur.steps.map((s: any, i_s: number) => (
                        <Fragment key={i_s}>
                          <li style={css(`display: flex; align-items: center; gap: 12px; padding: 14px 0; border-top: 1px solid #E4DCF7; font-size: 16px; font-weight: 700`)}>
                            <span aria-hidden={"true"} style={css(`width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #6A4FB6; background: ${s.bg}; color: ${s.fg}; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0`)}>
                              <span>{s.mark}</span>
                            </span>
                            <span style={css(`flex-grow: 1`)}>
                              <span>{s.label}</span>
                            </span>
                            <span style={css(`font-size: 13px; font-weight: 700; color: #5B5470`)}>
                              <span>{s.state}</span>
                            </span>
                          </li>
                        </Fragment>
                      ))}
                    </ol>
                  </section>
                </>
              )}
              {" "}
              <div style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 1.25rem; align-items: stretch`)}>
                {" "}
                {v.cur.hasCtx && (
                  <>
                    <section style={css(`border-radius: 22px; border: 1px solid #E4DCF7; padding: 24px; display: flex; flex-direction: column; gap: 10px`)}>
                      <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
                        {"Contexte"}
                      </h2>
                      <p style={css(`margin: 0; font-size: 17px; line-height: 1.65`)}>
                        <span>{v.cur.ctx}</span>
                      </p>
                    </section>
                  </>
                )}
                {" "}
                {v.cur.hasSkills && (
                  <>
                    <section style={css(`border-radius: 22px; background: linear-gradient(135deg, #F3EFFF 0%, #E9E2FB 100%); padding: 24px; display: flex; flex-direction: column; gap: 12px`)}>
                      <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
                        {"Compétences validées"}
                      </h2>
                      <ul style={css(`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px`)}>
                        {v.cur.skills.map((k: any, i_k: number) => (
                          <Fragment key={i_k}>
                            <li style={css(`display: flex; gap: 10px; font-size: 16px; line-height: 1.5`)}>
                              <span aria-hidden={"true"} style={css(`width: 20px; height: 20px; margin-top: 2px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0`)}>
                                {"✓"}
                              </span>
                              <span>
                                <span>{k}</span>
                              </span>
                            </li>
                          </Fragment>
                        ))}
                      </ul>
                    </section>
                  </>
                )}
                {" "}
              </div>
              {" "}
              {v.cur.hasVideos && (
                <>
                  <section aria-labelledby={"films"} style={css(`display: flex; flex-direction: column; gap: 16px`)}>
                    <div style={css(`display: flex; flex-direction: column; gap: 6px`)}>
                      <h2 id={"films"} style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
                        {"La saga de 3 films"}
                      </h2>
                      <p style={css(`margin: 0; font-size: 17px; line-height: 1.65`)}>
                        {"Trois films de présentation bilingues pour le marché nord-américain, réalisés de A à Z : script validé, montage avec Remotion et Claude Code, voix off ElevenLabs et musique, puis déclinaisons en 16:9, 9:16 et 1:1."}
                      </p>
                    </div>
                    <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); gap: 1.25rem`)}>
                      {v.curVideos.map((v: any, i_v: number) => (
                        <li key={i_v} style={css(`display: grid`)}>
                          <article style={css(`border-radius: 20px; border: 1px solid #E4DCF7; background: #FFFFFF; overflow: hidden; display: flex; flex-direction: column`)}>
                            {v.playing && (
                              <>
                                <iframe id={`film-${v.n}`} src={v.embed} title={`Film ${v.n} sur 3 : ${v.title}`} allow={"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"} allowFullScreen referrerPolicy={"strict-origin-when-cross-origin"} style={css(`display: block; width: 100%; aspect-ratio: 16 / 9; border: 0; background: #1A1033`)} />
                              </>
                            )}
                            {v.notPlaying && (
                              <>
                                <button type={"button"} onClick={v.play} aria-label={`Lire le film ${v.n} sur 3 : ${v.title}`} style={css(`display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; width: 100%; aspect-ratio: 16 / 9; border: 0; padding: 0; cursor: pointer; background: linear-gradient(rgba(26,16,51,0.15), rgba(26,16,51,0.35)), url(${v.thumb}) center / cover no-repeat, #1A1033; color: #FFFFFF; font: inherit; font-size: 14px; font-weight: 700`)}>
                                  <span style={css(`width: 64px; height: 64px; border-radius: 50%; background: #FFFFFF; display: inline-flex; align-items: center; justify-content: center; aspect-ratio: 1 / 1; box-shadow: 0 4px 16px rgba(26,16,51,0.35)`)}>
                                    <svg width={"28"} height={"28"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"#1A1033"}>
                                      <path d={"M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"} />
                                    </svg>
                                  </span>
                                  <span style={css(`padding: 4px 12px; border-radius: 999px; background: rgba(26,16,51,0.78)`)}>
                                    {"Lire le film"}
                                  </span>
                                </button>
                              </>
                            )}
                            <div style={css(`padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 6px`)}>
                              <span style={css(`font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #5B5470`)}>
                                <span>{v.kicker}</span>
                              </span>
                              <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15`)}>
                                <span lang={v.lang}>{v.title}</span>
                              </h3>
                              <a href={v.url} target={"_blank"} rel={"noopener noreferrer"} style={css(`align-self: flex-start; min-height: 44px; display: inline-flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 700; color: #6A4FB6`)}>
                                {"Regarder sur YouTube "}
                                <svg width={"14"} height={"14"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                                  <path d={"M7 17L17 7M9 7h8v8"} />
                                </svg>
                              </a>
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}
              {v.cur.hasDocs && (
                <>
                  <section style={css(`display: flex; flex-direction: column; gap: 1rem`)}>
                    <div style={css(`display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1rem`)}>
                      <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em`)}>
                        {"Démarche et livrables"}
                      </h2>
                      {v.cur.hasPdf && (
                        <>
                          <a href={v.cur.pdfh} target={"_blank"} rel={"noopener noreferrer"} style={css(`padding: 10px 0; font-size: 15px; font-weight: 700`)}>
                            {`Tout ouvrir · ${v.cur.pdfFormat}`}
                          </a>
                        </>
                      )}
                    </div>
                    <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 1rem`)}>
                      {v.cur.docs.map((d: any, i_d: number) => (
                        <li key={i_d} style={css(`display: grid`)}>
                          <a href={d.href} target={"_blank"} rel={"noopener noreferrer"} style={css(`text-decoration: none; color: #1A1033; border-radius: 18px; background: #FFFFFF; border: 1px solid #E4DCF7; overflow: hidden; display: flex; flex-direction: column`)}>
                            {" "}
                            <div style={css(`height: 180px; background: #F3EFFF; overflow: hidden; border-bottom: 1px solid #E4DCF7`)}>
                              {d.thumb ? (
                                <img src={d.thumb} alt={`Aperçu : ${d.label}`} style={css(`width: 100%; height: 100%; object-fit: cover; object-position: top; display: block`)} />
                              ) : (
                                <span aria-hidden={"true"} style={css(`height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--font-titre); font-size: 22px; font-weight: 800; color: var(--amethyste)`)}>
                                  {d.format}
                                </span>
                              )}
                            </div>
                            {" "}
                            <div style={css(`padding: 14px 16px; display: flex; align-items: center; gap: 12px`)}>
                              <span style={css(`width: 30px; height: 30px; border-radius: 50%; background: #6A4FB6; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; flex-shrink: 0`)}>
                                <span>{d.n}</span>
                              </span>
                              <span style={css(`flex-grow: 1; font-size: 16px; font-weight: 800; line-height: 1.25`)}>
                                <span>{d.label}</span>
                                <span style={css(`display: block; margin-top: 2px; font-size: 13px; font-weight: 600; color: var(--ardoise)`)}>{d.format}</span>
                              </span>
                              <span style={css(`color: #6A4FB6; display: inline-flex`)}>
                                <svg width={"16"} height={"16"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                                  <path d={"M7 17L17 7M9 7h8v8"} />
                                </svg>
                              </span>
                            </div>
                            {" "}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}
              {" "}
              <nav aria-label={"Projets voisins"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); gap: 1rem; padding-top: 1rem; border-top: 1px solid #E4DCF7`)}>
                {" "}
                <Link href={v.prevHref} style={css(`text-align: left; min-height: 72px; border: 1px solid #E4DCF7; border-radius: 18px; background: #FFFFFF; padding: 16px 20px; font: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 4px; text-decoration: none; box-sizing: border-box`)}>
                  <span style={css(`font-size: 13px; font-weight: 700; color: #5B5470`)}>
                    {"← Projet précédent"}
                  </span>
                  <span style={css(`font-size: 18px; font-weight: 800; color: #1A1033`)}>
                    <span>{v.prevName}</span>
                  </span>
                </Link>
                {" "}
                <Link href={v.nextHref} style={css(`text-align: right; min-height: 72px; border: 1px solid #E4DCF7; border-radius: 18px; background: #FFFFFF; padding: 16px 20px; font: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; text-decoration: none; box-sizing: border-box`)}>
                  <span style={css(`font-size: 13px; font-weight: 700; color: #5B5470`)}>
                    {"Projet suivant →"}
                  </span>
                  <span style={css(`font-size: 18px; font-weight: 800; color: #1A1033`)}>
                    <span>{v.nextName}</span>
                  </span>
                </Link>
                {" "}
              </nav>
              {" "}
            </article>
          </>
        )}
        {" "}
      </main>
    </>
  );
}
