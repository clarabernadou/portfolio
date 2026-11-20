import { Fragment, type ReactNode } from "react";
import { css } from "@/lib/css";
import Link from "next/link";
import { ancreExperience, lienProjetsCadre, ligneFormation, type SiteExperience, type SiteFormation } from "@/lib/data-shared";
import type { FormationCourte } from "@/lib/types";

// Expériences et formations rendues depuis les données (étape 9), avec le markup
// et les styles recopiés tels quels de CvView / AccueilView (sources du prototype).

const TAG_TECHNO = `padding: 4px 10px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; font-size: 14px; font-weight: 700`;
const LIEN = `color: #6A4FB6; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px`;
const STATUT_EN_COURS = `padding: 3px 9px; border-radius: 6px; background: #FFFFFF; border: 1.5px dashed #6A4FB6; color: #6A4FB6; font-size: 13px; font-weight: 800`;
const MODE = `padding: 3px 9px; border-radius: 6px; background: #F3EFFF; color: #1A1033; font-size: 13px; font-weight: 700`;

function Entreprise({ e }: { e: SiteExperience }) {
  const lien = (nom: string, href?: string) =>
    href ? (
      <a href={href} target={"_blank"} rel={"noopener noreferrer"} style={css(LIEN)}>
        {nom}
      </a>
    ) : (
      <>{nom}</>
    );
  return (
    <span style={css(`font-size: 16px; font-weight: 700; color: #6A4FB6`)}>
      {lien(e.entreprise, e.entrepriseHref)}
      {e.entrepriseParent && (
        <>
          {" by "}
          {lien(e.entrepriseParent, e.entrepriseParentHref)}
        </>
      )}
    </span>
  );
}

function Puces({ items }: { items: ReactNode[] }) {
  return (
    <ul style={css(`list-style: none; margin: 4px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: 16px; line-height: 1.5`)}>
      {items.map((b, i) => (
        <li key={i} style={css(`display: flex; gap: 10px`)}>
          <span style={css(`width: 6px; height: 6px; margin-top: 9px; border-radius: 50%; background: #6A4FB6; flex-shrink: 0`)} />
          {" "}
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

// Puce dont le début est en gras, écrit « **Claude Code**, mon outil… » en base (section Compétences IA du CV).
export function PucesGras({ items }: { items: string[] }) {
  return (
    <Puces
      items={items.map((t, i) => {
        const m = /^\*\*(.+?)\*\*([\s\S]*)$/.exec(t);
        return m ? (
          <Fragment key={i}>
            <b>{m[1]}</b>
            {m[2]}
          </Fragment>
        ) : (
          t
        );
      })}
    />
  );
}

// « Stack : React, MUI… » sous l'en-tête d'un bloc d'expérience ou d'un projet, comme sur le CV.
function Stack({ texte }: { texte?: string }) {
  if (!texte) return null;
  return (
    <p style={css(`margin: 2px 0 0; font-size: 15px; line-height: 1.5; color: #5B5470`)}>
      <b style={css(`color: #1A1033`)}>{"Stack"}</b>
      {` : ${texte}`}
    </p>
  );
}

// Étiquettes balisées en liste (RGAA 9.3) : sans styles, elles restent séparées (10.2).
export function Etiquettes({ items, style, label, marge }: { items: string[]; style: string; label?: string; marge?: string }) {
  return (
    <ul role={"list"} aria-label={label} className={"liste-nue"} style={css(`display: flex; flex-wrap: wrap; gap: 6px${marge ? `; margin-top: ${marge}` : ""}`)}>
      {items.map((t) => (
        <li key={t} style={css(style)}>
          {t}
        </li>
      ))}
    </ul>
  );
}

function EnTeteBloc({ name, period }: { name?: string; period?: string }) {
  return (
    <div style={css(`display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px`)}>
      <h4 style={css(`margin: 0; font-size: 16px; font-weight: 800`)}>{name}</h4>
      {" "}
      {period && <span style={css(`font-size: 14px; font-weight: 700; color: #5B5470`)}>{period}</span>}
    </div>
  );
}

// « Diplôme américain … : Master’s degree in … » : la partie en anglais est signalée (RGAA 8.7).
// Forme courte depuis le 4 nov. 2026 : « Master’s degree in … (diplôme américain) ».
function Mention({ texte }: { texte: string }) {
  const court = /^(.+?) (\([^)]*\))$/.exec(texte);
  if (court && !/[àâçéèêëîïôûùüÿœæ]/i.test(court[1]))
    return (
      <>
        <span lang={"en"}>{court[1]}</span> {court[2]}
      </>
    );
  const i = texte.lastIndexOf(" : ");
  const fin = i < 0 ? "" : texte.slice(i + 3);
  if (!fin || /[àâçéèêëîïôûùüÿœæ]/i.test(fin)) return <>{texte}</>;
  return (
    <>
      {texte.slice(0, i + 3)}
      <span lang={"en"}>{fin}</span>
    </>
  );
}

// Dates au-dessus du titre (20 nov. 2026) : le texte prend toute la largeur de la colonne.
export function CvExperience({ e }: { e: SiteExperience }) {
  return (
    <article id={ancreExperience(e)} style={css(`scroll-margin-top: 110px; display: flex; flex-direction: column; gap: 6px; padding: 22px 0; border-top: 1px solid #E4DCF7`)}>
      <span style={css(`font-size: 14px; font-weight: 700; color: #5B5470`)}>{e.periode}</span>
      {" "}
      <div style={css(`min-width: 0; display: flex; flex-direction: column; gap: 6px`)}>
        <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.02em`)}>{e.poste}</h3>
        {" "}
        <Entreprise e={e} />
        {" "}
        <span style={css(`font-size: 14px; color: #5B5470`)}>{e.lieuMode}</span>
        {" "}
        <p style={css(`margin: 4px 0 0; font-size: 15px; line-height: 1.55`)}>{e.contexteEssentiel}</p>
        {e.blocs.map((b, i) => {
          const puces = b.bulletsEssentiel;
          if (!puces.length) return null;
          if (!b.name)
            return (
              <Fragment key={i}>
                <Stack texte={b.stack} />
                <PucesGras items={puces} />
              </Fragment>
            );
          return (
            <div key={i} style={css(`display: flex; flex-direction: column; gap: 4px; margin-top: 8px`)}>
              <EnTeteBloc name={b.name} period={b.period} />
              {" "}
              <Stack texte={b.stack} />
              <PucesGras items={puces} />
            </div>
          );
        })}
        {e.note && <p style={css(`margin: 8px 0 0; font-size: 15px; line-height: 1.5; color: #5B5470`)}>{`→ ${e.note}`}</p>}
      </div>
    </article>
  );
}

// Projet personnel du CV (profil.projetsCv) : même présentation qu'une expérience.
export function CvProjet({ p }: { p: { titre: string; lien?: string; periode: string; description?: string; stack?: string; puces: string[] } }) {
  return (
    <article style={css(`display: flex; flex-direction: column; gap: 6px; padding: 22px 0; border-top: 1px solid #E4DCF7`)}>
      <span style={css(`font-size: 14px; font-weight: 700; color: #5B5470`)}>{p.periode}</span>
      {" "}
      <div style={css(`min-width: 0; display: flex; flex-direction: column; gap: 6px`)}>
        <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.02em`)}>{p.titre}</h3>
        {p.description && <p style={css(`margin: 4px 0 0; font-size: 15px; line-height: 1.55`)}>{p.description}</p>}
        <Puces items={p.puces} />
        <Stack texte={p.stack} />
      </div>
    </article>
  );
}

function LienFormation({ f, style }: { f: SiteFormation; style: string }) {
  if (!f.url) return <>{f.intitule}</>;
  return (
    <a href={f.url} target={"_blank"} rel={"noopener noreferrer"} style={css(style)}>
      {f.intitule}
      <span aria-hidden={"true"} style={css(`color: #6A4FB6; font-size: 0.75em; margin-left: 6px`)}>
        {"↗"}
      </span>
      {" "}
      <span style={css(`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)`)}>{" (page de la formation sur OpenClassrooms)"}</span>
    </a>
  );
}

// Formation du CV, dans la colonne latérale (19 nov. 2026) : version resserrée, années au-dessus du titre.
export function CvFormation({ f }: { f: SiteFormation }) {
  return (
    <div style={css(`display: flex; flex-direction: column; gap: 6px; padding: 16px 0; border-top: 1px solid #E4DCF7`)}>
      <span style={css(`font-size: 14px; font-weight: 700; color: #5B5470`)}>{f.annees}</span>
      {" "}
      <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25`)}>
        <LienFormation f={f} style={`color: inherit; text-decoration: none`} />
      </h3>{" "}
      <div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 6px`)}>
        <span style={css(f.statut === "En cours" ? STATUT_EN_COURS : `padding: 3px 9px; border-radius: 6px; background: #E7F6EE; color: #067647; font-size: 13px; font-weight: 800`)}>{f.statut}</span>{" "}
        <span style={css(MODE)}>{f.mode}</span>{" "}
      </div>
      {" "}
      <span style={css(`font-size: 14px; color: #5B5470`)}>{ligneFormation(f)}</span>
      {" "}
      {f.mentionComplementaire && (
        <span style={css(`font-size: 14px; font-weight: 700; color: #6A4FB6; font-style: italic`)}>
          <Mention texte={f.mentionComplementaire} />
        </span>
      )}
    </div>
  );
}

// Carte d'expérience de l'accueil (20 nov. 2026) : l'entreprise en titre, le poste et la période dessous ;
// le poste actuel mis en avant (badge « Aujourd'hui », contour Améthyste). Toute la carte mène au détail
// de l'expérience sur le CV (lien étiré).
export function CarteAlternance({ e }: { e: SiteExperience }) {
  const actuel = /aujourd/i.test(e.periode);
  const id = `carte-${ancreExperience(e)}`;
  return (
    <article style={css(`position: relative; height: 100%; box-sizing: border-box; border-radius: 20px; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 8px; border: ${actuel ? "2px solid #6A4FB6" : "2px solid transparent"}`)}>
      <div style={css(`display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px`)}>
        <h3 id={`${id}-titre`} style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1`)}>
          {e.entreprise}
          {e.entrepriseParent && <span style={css(`font-weight: 300; color: #6A4FB6`)}>{` by ${e.entrepriseParent}`}</span>}
        </h3>
        {actuel && <span style={css(`padding: 3px 9px; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; font-size: 13px; font-weight: 800; letter-spacing: 0.04em`)}>{"AUJOURD’HUI"}</span>}
      </div>
      <span style={css(`font-size: 17px; font-weight: 700; color: #1A1033`)}>{e.poste}</span>
      <span style={css(`font-size: 14px; color: #5B5470`)}>{[e.periode, e.homeCard?.lieuMode ?? e.lieuMode].filter(Boolean).join(" · ")}</span>
      <Etiquettes items={e.homeCard?.technologies ?? []} style={TAG_TECHNO} label={"Technologies"} marge={"4px"} />
      <Link href={`/cv#${ancreExperience(e)}`} id={`${id}-suite`} className={"lien-etire"} aria-labelledby={`${id}-suite ${id}-titre`} style={css(`margin-top: auto; padding-top: 6px; min-height: 44px; display: inline-flex; align-items: center; font-size: 15px; font-weight: 700; color: #6A4FB6; text-decoration: none; align-self: flex-start`)}>
        {"Voir le détail sur le CV →"}
      </Link>
    </article>
  );
}

export function FriseFormation({ f }: { f: SiteFormation }) {
  return (
    <li className={f.statut === "En cours" ? "tl-item tl-now" : "tl-item"}>
      <span className={"tl-dot"} aria-hidden={"true"} />{" "}
      <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
        <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #6A4FB6`)}>{f.annees}</span>
        {" "}
        <h4 style={css(`margin: 0; font-size: 17px; font-weight: 800; line-height: 1.3`)}>
          <LienFormation f={f} style={`color: inherit; text-decoration: none; `} />
        </h4>
        {" "}
        <span style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 14px; color: #5B5470`)}>
          <span style={css(f.statut === "En cours" ? STATUT_EN_COURS : `padding: 3px 9px; border-radius: 6px; background: #E7F6EE; border: 0; color: #067647; font-size: 13px; font-weight: 800`)}>{f.statut}</span>{" "}
          <span>{[f.diplome, f.mode].filter(Boolean).join(" · ")}</span>
        </span>
        {" "}
        {/* Les projets de la formation (20 nov. 2026) : lien vers /projets filtré, s'il y en a de publiés. */}
        {f.projets &&
          ((f as SiteFormation & { nbPublies?: number }).nbPublies ? (
            <Link href={lienProjetsCadre(f.intitule)} style={css(`align-self: flex-start; min-height: 44px; display: inline-flex; align-items: center; font-size: 14px; font-weight: 700; color: #6A4FB6; text-decoration: underline; text-underline-offset: 3px`)}>
              {`${f.projets} →`}
              <span className={"visuellement-masque"}>{` (formation ${f.intitule})`}</span>
            </Link>
          ) : (
            <span style={css(`font-size: 14px; font-weight: 700; color: #6A4FB6`)}>{f.projets}</span>
          ))}
      </div>
    </li>
  );
}

// Formations courtes et certifications (accueil, sous la frise, 17 nov. 2026) : une ligne par
// organisme, dans l'ordre de l'administration ; les intitulés d'une même date partagent la date.
export function FormationsCourtes({ items }: { items: FormationCourte[] }) {
  if (!items.length) return null;
  const groupes: { organisme: string; dates: { date: string; items: FormationCourte[] }[] }[] = [];
  for (const f of items) {
    let g = groupes.find((x) => x.organisme === f.organisme);
    if (!g) groupes.push((g = { organisme: f.organisme, dates: [] }));
    const d = g.dates.find((x) => x.date === f.date);
    if (d) d.items.push(f);
    else g.dates.push({ date: f.date, items: [f] });
  }
  const certifs = items.some((f) => f.type === "certification");
  return (
    <div style={css(`display: flex; flex-direction: column; gap: 14px; padding: 28px; border-radius: 24px; background: #FFFFFF`)}>
      <h3 style={css(`margin: 0; font-size: 14px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #5B5470`)}>
        {certifs ? "Certifications et formations courtes" : "Formations courtes"}
      </h3>
      {" "}
      <ul role={"list"} className={"liste-nue"} style={css(`display: flex; flex-direction: column`)}>
        {groupes.map((g) => (
          <li key={g.organisme} style={css(`display: flex; flex-wrap: wrap; gap: 4px 20px; padding: 14px 0; border-top: 1px solid #E4DCF7`)}>
            <span style={css(`flex: 0 0 240px; font-size: 16px; font-weight: 700; color: #1A1033`)}>{g.organisme}</span>
            {" "}
            <span style={css(`flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 4px; font-size: 16px; line-height: 1.55; color: #5B5470; text-wrap: pretty`)}>
              {g.dates.map((d) => (
                <span key={d.date}>
                  {d.items.map((f, i) => (
                    <span key={f.name}>
                      {i > 0 && ", "}
                      <IntituleCourt f={f} />
                    </span>
                  ))}
                  {` · ${d.date}`}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IntituleCourt({ f }: { f: FormationCourte }) {
  const nom = (
    <>
      {f.name}
      {f.type === "certification" && <span style={css(`margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: #F3EFFF; color: #1A1033; font-size: 13px; font-weight: 700; white-space: nowrap`)}>{"Certification"}</span>}
    </>
  );
  if (!f.url) return <span style={css(`color: #1A1033`)}>{nom}</span>;
  return (
    <a href={f.url} target={"_blank"} rel={"noopener noreferrer"} style={css(`color: #1A1033; font-weight: 600`)}>
      {nom}
      <span aria-hidden={"true"} style={css(`color: #6A4FB6; font-size: 0.75em; margin-left: 6px`)}>
        {"↗"}
      </span>
      <span style={css(`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)`)}>{" (nouvel onglet)"}</span>
    </a>
  );
}
