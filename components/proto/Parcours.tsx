import { Fragment } from "react";
import { css } from "@/lib/css";
import type { SiteExperience, SiteFormation } from "@/lib/data-shared";

// Expériences et formations rendues depuis les données (étape 9), avec le markup
// et les styles recopiés tels quels de CvView / AccueilView (sources du prototype).

const TAG_TECHNO = `padding: 4px 10px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; font-size: 14px; font-weight: 700`;
const TAG_INFO = `padding: 5px 11px; border-radius: 8px; background: #F3EFFF; color: #1A1033; font-size: 14px; font-weight: 600`;
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

function Puces({ items }: { items: string[] }) {
  return (
    <ul style={css(`list-style: none; margin: 4px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: 16px; line-height: 1.5`)}>
      {items.map((b, i) => (
        <li key={i} style={css(`display: flex; gap: 10px`)}>
          <span style={css(`width: 6px; height: 6px; margin-top: 9px; border-radius: 50%; background: #6A4FB6; flex-shrink: 0`)} />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function Technos({ items }: { items: string[] }) {
  return (
    <div style={css(`margin-top: 6px`)}>
      <div style={css(`display: flex; flex-wrap: wrap; gap: 6px`)}>
        {items.map((t) => (
          <span key={t} style={css(TAG_TECHNO)}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function EnTeteBloc({ name, period }: { name?: string; period?: string }) {
  return (
    <div style={css(`display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px`)}>
      <span style={css(`font-size: 16px; font-weight: 800`)}>{name}</span>
      {period && <span style={css(`font-size: 14px; font-weight: 700; color: #5B5470`)}>{period}</span>}
    </div>
  );
}

export function CvExperience({ e, full }: { e: SiteExperience; full: boolean }) {
  return (
    <article style={css(`display: flex; flex-wrap: wrap; gap: 8px 20px; padding: 22px 0; border-top: 1px solid #E4DCF7`)}>
      <span style={css(`flex: 0 0 150px; font-size: 14px; font-weight: 700; color: #5B5470`)}>{e.periode}</span>
      <div style={css(`flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 6px`)}>
        <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.02em`)}>{e.poste}</span>
        <Entreprise e={e} />
        <span style={css(`font-size: 14px; color: #5B5470`)}>{e.lieuMode}</span>
        <p style={css(`margin: 4px 0 0; font-size: 15px; line-height: 1.55`)}>{full ? e.contexteComplet : e.contexteEssentiel}</p>
        {e.blocs.map((b, i) => {
          const puces = full ? b.bulletsComplet : b.bulletsEssentiel;
          if (!puces.length) return null;
          if (!b.name)
            return (
              <Fragment key={i}>
                <Puces items={puces} />
                {full && b.technologies?.length ? <Technos items={b.technologies} /> : null}
              </Fragment>
            );
          return full ? (
            <div key={i} style={css(`display: flex; flex-direction: column; gap: 6px; padding: 14px 16px; border-radius: 14px; border: 1px solid #E4DCF7; margin-top: 8px`)}>
              <EnTeteBloc name={b.name} period={b.period} />
              <Puces items={puces} />
              {b.technologies?.length ? <Technos items={b.technologies} /> : null}
            </div>
          ) : (
            <div key={i} style={css(`display: flex; flex-direction: column; gap: 4px; margin-top: 8px`)}>
              <EnTeteBloc name={b.name} period={b.period} />
              <Puces items={puces} />
            </div>
          );
        })}
        {full && e.competencesAcquisesComplet?.length ? (
          <>
            <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470; margin-top: 6px`)}>{"Compétences acquises"}</span>
            <div style={css(`display: flex; flex-wrap: wrap; gap: 6px`)}>
              {e.competencesAcquisesComplet.map((c) => (
                <span key={c} style={css(TAG_INFO)}>
                  {c}
                </span>
              ))}
            </div>
          </>
        ) : null}
        {e.note && <p style={css(`margin: 8px 0 0; font-size: 15px; line-height: 1.5; color: #5B5470`)}>{`→ ${e.note}`}</p>}
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
      <span style={css(`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)`)}>{" (page de la formation sur OpenClassrooms)"}</span>
    </a>
  );
}

export function CvFormation({ f, full }: { f: SiteFormation; full: boolean }) {
  return (
    <div style={css(`display: flex; flex-wrap: wrap; gap: 8px 20px; padding: 18px 0; border-top: 1px solid #E4DCF7`)}>
      <span style={css(`flex: 0 0 150px; font-size: 14px; font-weight: 700; color: #5B5470`)}>{f.annees}</span>
      <div style={css(`flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 8px`)}>
        <div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 8px`)}>
          <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
            <LienFormation f={f} style={`color: inherit; text-decoration: none`} />
          </span>
          <span style={css(f.statut === "En cours" ? STATUT_EN_COURS : `padding: 3px 9px; border-radius: 6px; background: #E7F6EE; color: #067647; font-size: 13px; font-weight: 800`)}>{f.statut}</span>
          <span style={css(MODE)}>{f.mode}</span>
        </div>
        <span style={css(`font-size: 14px; color: #5B5470`)}>{`${f.niveauComplet} · ${f.projets}`}</span>
        {f.mentionComplementaire && <span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6; font-style: italic`)}>{f.mentionComplementaire}</span>}
        {full && f.competencesAcquises?.length ? (
          <div style={css(`display: flex; flex-direction: column; gap: 6px; margin-top: 4px`)}>
            <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470; margin-top: 6px`)}>{"Compétences acquises"}</span>
            <div style={css(`display: flex; flex-wrap: wrap; gap: 6px`)}>
              {f.competencesAcquises.map((c) => (
                <span key={c} style={css(TAG_INFO)}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function CarteAlternance({ e }: { e: SiteExperience }) {
  return (
    <article style={css(`border-radius: 20px; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 8px`)}>
      <span style={css(`font-size: 14px; font-weight: 700; color: #5B5470`)}>{e.periode}</span>
      <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.02em`)}>{e.poste}</span>
      <Entreprise e={e} />
      <span style={css(`font-size: 14px; color: #5B5470`)}>{e.homeCard?.lieuMode ?? e.lieuMode}</span>
      <div style={css(`display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px`)}>
        {(e.homeCard?.technologies ?? []).map((t) => (
          <span key={t} style={css(TAG_TECHNO)}>
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

export function FriseFormation({ f }: { f: SiteFormation }) {
  return (
    <li className={f.statut === "En cours" ? "tl-item tl-now" : "tl-item"}>
      <span className={"tl-dot"} aria-hidden={"true"} />{" "}
      <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
        <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #6A4FB6`)}>{f.annees}</span>
        <span style={css(`font-size: 17px; font-weight: 800; line-height: 1.3`)}>
          <LienFormation f={f} style={`color: inherit; text-decoration: none; `} />
        </span>
        <span style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 14px; color: #5B5470`)}>
          <b style={css(`color: #1A1033`)}>{f.diplome}</b>
          <span style={css(f.statut === "En cours" ? STATUT_EN_COURS : `padding: 3px 9px; border-radius: 6px; background: #E7F6EE; border: 0; color: #067647; font-size: 13px; font-weight: 800`)}>{f.statut}</span>
          <span style={css(MODE)}>{f.mode}</span>
        </span>
        <span style={css(`font-size: 14px; font-weight: 700; color: #6A4FB6`)}>{f.projets}</span>
      </div>
    </li>
  );
}
