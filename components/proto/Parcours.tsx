import { css } from "@/lib/css";
import type { SiteExperience, SiteFormation } from "@/lib/data-shared";

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
      {period && <span style={css(`font-size: 14px; font-weight: 700; color: #5B5470`)}>{period}</span>}
    </div>
  );
}

// « Diplôme américain … : Master’s degree in … » : la partie en anglais est signalée (RGAA 8.7).
function Mention({ texte }: { texte: string }) {
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

export function CvExperience({ e }: { e: SiteExperience }) {
  return (
    <article style={css(`display: flex; flex-wrap: wrap; gap: 8px 20px; padding: 22px 0; border-top: 1px solid #E4DCF7`)}>
      <span style={css(`flex: 0 0 150px; font-size: 14px; font-weight: 700; color: #5B5470`)}>{e.periode}</span>
      <div style={css(`flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 6px`)}>
        <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.02em`)}>{e.poste}</h3>
        <Entreprise e={e} />
        <span style={css(`font-size: 14px; color: #5B5470`)}>{e.lieuMode}</span>
        <p style={css(`margin: 4px 0 0; font-size: 15px; line-height: 1.55`)}>{e.contexteEssentiel}</p>
        {e.blocs.map((b, i) => {
          const puces = b.bulletsEssentiel;
          if (!puces.length) return null;
          if (!b.name) return <Puces key={i} items={puces} />;
          return (
            <div key={i} style={css(`display: flex; flex-direction: column; gap: 4px; margin-top: 8px`)}>
              <EnTeteBloc name={b.name} period={b.period} />
              <Puces items={puces} />
            </div>
          );
        })}
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

export function CvFormation({ f }: { f: SiteFormation }) {
  return (
    <div style={css(`display: flex; flex-wrap: wrap; gap: 8px 20px; padding: 18px 0; border-top: 1px solid #E4DCF7`)}>
      <span style={css(`flex: 0 0 150px; font-size: 14px; font-weight: 700; color: #5B5470`)}>{f.annees}</span>
      <div style={css(`flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 8px`)}>
        <div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 8px`)}>
          <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 20px; font-weight: 700; letter-spacing: -0.02em`)}>
            <LienFormation f={f} style={`color: inherit; text-decoration: none`} />
          </h3>{" "}
          <span style={css(f.statut === "En cours" ? STATUT_EN_COURS : `padding: 3px 9px; border-radius: 6px; background: #E7F6EE; color: #067647; font-size: 13px; font-weight: 800`)}>{f.statut}</span>{" "}
          <span style={css(MODE)}>{f.mode}</span>
        </div>
        <span style={css(`font-size: 14px; color: #5B5470`)}>{`${f.niveauComplet} · ${f.projets}`}</span>
        {f.mentionComplementaire && (
          <span style={css(`font-size: 15px; font-weight: 700; color: #6A4FB6; font-style: italic`)}>
            <Mention texte={f.mentionComplementaire} />
          </span>
        )}
      </div>
    </div>
  );
}

export function CarteAlternance({ e }: { e: SiteExperience }) {
  return (
    <article style={css(`border-radius: 20px; background: #FFFFFF; padding: 22px; display: flex; flex-direction: column; gap: 8px`)}>
      <span style={css(`font-size: 14px; font-weight: 700; color: #5B5470`)}>{e.periode}</span>
      <h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 700; letter-spacing: -0.02em`)}>{e.poste}</h3>
      <Entreprise e={e} />
      <span style={css(`font-size: 14px; color: #5B5470`)}>{e.homeCard?.lieuMode ?? e.lieuMode}</span>
      <Etiquettes items={e.homeCard?.technologies ?? []} style={TAG_TECHNO} label={"Technologies"} marge={"4px"} />
    </article>
  );
}

export function FriseFormation({ f }: { f: SiteFormation }) {
  return (
    <li className={f.statut === "En cours" ? "tl-item tl-now" : "tl-item"}>
      <span className={"tl-dot"} aria-hidden={"true"} />{" "}
      <div style={css(`display: flex; flex-direction: column; gap: 8px`)}>
        <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #6A4FB6`)}>{f.annees}</span>
        <h4 style={css(`margin: 0; font-size: 17px; font-weight: 800; line-height: 1.3`)}>
          <LienFormation f={f} style={`color: inherit; text-decoration: none; `} />
        </h4>
        <span style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 14px; color: #5B5470`)}>
          <b style={css(`color: #1A1033`)}>{f.diplome}</b>{" "}
          <span style={css(f.statut === "En cours" ? STATUT_EN_COURS : `padding: 3px 9px; border-radius: 6px; background: #E7F6EE; border: 0; color: #067647; font-size: 13px; font-weight: 800`)}>{f.statut}</span>{" "}
          <span style={css(MODE)}>{f.mode}</span>
        </span>
        <span style={css(`font-size: 14px; font-weight: 700; color: #6A4FB6`)}>{f.projets}</span>
      </div>
    </li>
  );
}
