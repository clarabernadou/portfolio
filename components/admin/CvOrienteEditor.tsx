"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { generateOriente, saveOrientation } from "@/app/admin/(espace)/profil/cv-oriente/actions";
import { A4_HAUTEUR_PX, cvHtml, type CvAssets } from "@/lib/pdf/cv-html";
import { essentielFr, oriente, type CvSources, type OrientationState } from "@/lib/pdf/cv-data";
import { bulletFlags, PROFIL_MAX, type OrientationId } from "@/lib/admin/orientations";
import { TextArea, TextField } from "./fields";
import { RestoreBanner, useDraft } from "./SaveBar";
import { useToast } from "./Toast";
import { Icon } from "./icons";

type Orientation = { id: OrientationId; name: string; featured: string[]; firstFormation: string; title: string; skillOrder: { category: string; visible: boolean }[] };
type Fichier = { name: string; generatedAt: string | null };

const PREVIEW_ASSETS: CvAssets = { manrope: "/fonts/Manrope.ttf", bricolage: "/fonts/BricolageGrotesque.ttf", photo: "" };
const DESCRIPTIONS: Record<OrientationId, string> = {
  ux: "Les parcours, les maquettes et les audits passent en premier. Le développement front-end suit en complément.",
  dev: "React, TypeScript et les projets développés passent en premier. La conception d’interfaces suit en complément.",
};

// Maquette : docs/passation/maquettes/admin/Admin-cv-oriente.jpg (§5 bis).
export function CvOrienteEditor({ initial, sources, orientations, candidats, fichiers }: { initial: OrientationState; sources: CvSources; orientations: Orientation[]; candidats: string[]; fichiers: Fichier[] }) {
  const router = useRouter();
  const toast = useToast();
  const draft = useDraft<OrientationState>(`admin-cv-oriente-${initial.id}`, initial);
  const o = draft.value;
  const set = <K extends keyof OrientationState>(k: K, v: OrientationState[K]) => draft.setValue({ ...o, [k]: v });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fr = useMemo(() => essentielFr(sources), [sources]);
  const suggeres = orientations.find((x) => x.id === o.id)!.featured;

  // Aperçu A4, et taux de remplissage de la page.
  const doc = useMemo(() => oriente(sources, o), [sources, o]);
  const html = useMemo(() => cvHtml(doc, PREVIEW_ASSETS, "une-page"), [doc]);
  const frame = useRef<HTMLIFrameElement>(null);
  const [remplissage, setRemplissage] = useState<number | null>(null);
  // Mesure à chaque chargement de l'aperçu (le contenu change à chaque modification).
  const mesure = () => {
    const d = frame.current?.contentDocument;
    if (!d?.body) return;
    d.fonts.ready.then(() => setRemplissage(((d.querySelector(".page") as HTMLElement | null)?.offsetHeight ?? 0) / A4_HAUTEUR_PX));
  };
  const tient = remplissage !== null && remplissage <= 1.001;
  const bloque = !tient;

  const projets = candidats
    .map((id) => sources.projets.find((p) => p.id === id))
    .filter((p): p is CvSources["projets"][number] => !!p);

  const run = (fn: () => Promise<{ ok: boolean; error?: string; manque?: string[]; session?: boolean; name?: string }>, ok: string) =>
    start(async () => {
      setError(null);
      const r = await fn();
      if (!r.ok) {
        if (r.session) return router.push(`/admin/connexion?expire=1&callbackUrl=/admin/profil/cv-oriente/${o.id}`);
        return setError(r.error ?? "Erreur.");
      }
      draft.markSaved(o);
      toast({ message: ok });
      router.refresh();
    });

  const actions = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {draft.dirty && (
        <button type="button" className="adm-btn adm-btn--link" onClick={draft.reset}>
          Annuler
        </button>
      )}
      <button type="button" className="adm-btn adm-btn--outline" disabled={pending} onClick={() => run(() => saveOrientation(o), "Orientation enregistrée.")}>
        Enregistrer l’orientation
      </button>
      <button type="button" className="adm-btn" disabled={pending || bloque} title={bloque ? "Le contenu doit tenir sur une page." : undefined} onClick={() => run(() => generateOriente(o), "PDF généré.")}>
        {pending ? "Génération…" : "Générer le PDF"}
      </button>
    </div>
  );

  return (
    <>
      <div className="adm-head">
        <div>
          <div className="adm-crumb">
            <Link href="/admin/profil">← Profil et CV</Link>
          </div>
          <h1 className="adm-h1">CV orienté</h1>
          <p className="adm-sub">Un CV d’une page adapté au poste visé. Le contenu vient du site : tu choisis l’angle et ce qui est mis en avant.</p>
        </div>
        {actions}
      </div>
      <RestoreBanner show={!!draft.restorable} onRestore={draft.restore} onDismiss={draft.dismiss} />
      {error && (
        <div className="adm-empty" role="alert">
          <b className="adm-error">{error}</b>
        </div>
      )}

      <div className="adm-edit" style={{ gridTemplateColumns: "minmax(0, 1fr) 460px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="adm-card" aria-labelledby="o-orientation">
            <div>
              <h2 className="adm-h2" id="o-orientation">Orientation</h2>
              <p className="adm-sub">Choisir une orientation préremplit les champs ci-dessous. Tu peux tout modifier.</p>
            </div>
            <div className="adm-grid-2">
              {orientations.map((x) => (
                <Link key={x.id} href={`/admin/profil/cv-oriente/${x.id}`} aria-current={x.id === o.id ? "true" : undefined} className="adm-card adm-item" style={{ textDecoration: "none", color: "inherit", alignItems: "flex-start", flexDirection: "column", gap: 6 }}>
                  <b>{x.name}</b>
                  <small className="adm-help">{DESCRIPTIONS[x.id]}</small>
                </Link>
              ))}
            </div>
          </section>

          <section className="adm-card" aria-labelledby="o-profil">
            <div>
              <h2 className="adm-h2" id="o-profil">En-tête et profil</h2>
              <p className="adm-sub">Une page d’un seul tenant : le texte de profil reste court.</p>
            </div>
            <TextField label="Intitulé affiché" value={o.title} onChange={(v) => set("title", v)} />
            <TextArea label="Texte de profil" value={o.profile} onChange={(v) => set("profile", v)} max={PROFIL_MAX} rows={5} />
          </section>

          <section className="adm-card" aria-labelledby="o-competences">
            <div>
              <h2 className="adm-h2" id="o-competences">Compétences</h2>
              <p className="adm-sub">L’ordre des catégories suit l’orientation. Les langues restent toujours affichées.</p>
            </div>
            <ul className="adm-list">
              {o.skillOrder.map((g, i) => (
                <li key={g.category}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b>{g.category}</b>
                    <small className="adm-muted" style={{ display: "block", whiteSpace: "normal" }}>
                      {fr.skills.find((s) => s.name === g.category)?.items.join(", ") ?? "Catégorie absente de la rubrique Compétences"}
                    </small>
                  </span>
                  <button type="button" className="adm-icon-btn" aria-label={`Monter « ${g.category} »`} disabled={i === 0} onClick={() => {
                    const c = [...o.skillOrder]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; set("skillOrder", c);
                  }}>↑</button>
                  <button type="button" className="adm-icon-btn" aria-label={`Descendre « ${g.category} »`} disabled={i === o.skillOrder.length - 1} onClick={() => {
                    const c = [...o.skillOrder]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; set("skillOrder", c);
                  }}>↓</button>
                  <label className="adm-toggle" style={{ alignItems: "center" }}>
                    <input type="checkbox" role="switch" aria-label={`Afficher « ${g.category} »`} checked={g.visible} onChange={(e) => set("skillOrder", o.skillOrder.map((x, k) => (k === i ? { ...x, visible: e.target.checked } : x)))} />
                  </label>
                </li>
              ))}
            </ul>
            {fr.skills.filter((s) => !o.skillOrder.some((g) => g.category === s.name)).map((s) => (
              <button key={s.name} type="button" className="adm-btn adm-btn--link" style={{ alignSelf: "flex-start" }} onClick={() => set("skillOrder", [...o.skillOrder, { category: s.name, visible: true }])}>
                <Icon name="plus" />
                Ajouter la catégorie « {s.name} »
              </button>
            ))}
          </section>

          <section className="adm-card" aria-labelledby="o-projets">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 className="adm-h2" id="o-projets">Projets phares</h2>
                <p className="adm-sub">Trois au maximum. Les projets non cochés sont grisés tant que trois sont choisis.</p>
              </div>
              <span className="adm-pill" style={{ alignSelf: "flex-start", background: "var(--succes-fond)", color: "var(--succes)" }}>
                {o.featuredProjects.length} sur 3
              </span>
            </div>
            <ul className="adm-list">
              {projets.map((p) => {
                const coche = o.featuredProjects.includes(p.id);
                const grise = !coche && o.featuredProjects.length >= 3;
                return (
                  <li key={p.id} style={{ flexDirection: "column", alignItems: "stretch", opacity: grise ? 0.5 : 1 }}>
                    <label className="adm-check" style={{ justifyContent: "space-between", width: "100%" }}>
                      <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input type="checkbox" checked={coche} disabled={grise} onChange={(e) => set("featuredProjects", e.target.checked ? [...o.featuredProjects, p.id] : o.featuredProjects.filter((x) => x !== p.id))} />
                        <span>
                          <b>{p.name}</b>
                          <small className="adm-muted" style={{ display: "block" }}>
                            {p.homeCard?.eyebrow ?? p.parcours}
                          </small>
                        </span>
                      </span>
                      {suggeres.includes(p.id) && <span className="adm-pill">Suggéré pour cette orientation</span>}
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="adm-card" aria-labelledby="o-experiences">
            <div>
              <h2 className="adm-h2" id="o-experiences">Expériences</h2>
              <p className="adm-sub">Les puces cochées sont reprises. Les étiquettes UX et Dev indiquent pour quelle orientation chaque puce est suggérée.</p>
            </div>
            {fr.exp.map((e, i) =>
              e.blocks.map((b, k) => (
                <fieldset key={`${i}-${k}`} style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <legend className="adm-label" style={{ marginBottom: 6 }}>
                    {e.co[0].text}
                    {b.name ? ` · ${b.name}` : e.co[2] ? ` · ${e.co[2].text}` : ""}
                  </legend>
                  {b.bullets.map((t) => {
                    const f = bulletFlags(t);
                    return (
                      <label key={t} className="adm-check" style={{ justifyContent: "space-between", alignItems: "flex-start", width: "100%", padding: "6px 0", borderTop: "1px solid var(--bordure)" }}>
                        <span style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <input type="checkbox" style={{ marginTop: 3 }} checked={o.bullets.includes(t)} onChange={(ev) => set("bullets", ev.target.checked ? [...o.bullets, t] : o.bullets.filter((x) => x !== t))} />
                          {t}
                        </span>
                        <span style={{ display: "flex", gap: 4 }}>
                          {f.ux && <span className="adm-pill">UX</span>}
                          {f.dev && <span className="adm-pill">Dev</span>}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              )),
            )}
          </section>

          <section className="adm-card" aria-labelledby="o-formations">
            <div>
              <h2 className="adm-h2" id="o-formations">Formations</h2>
              <p className="adm-sub">Une ligne par formation, sans les compétences acquises, pour tenir sur une page.</p>
            </div>
            <label className="adm-field">
              <span className="adm-label">Formation mise en premier</span>
              <select className="adm-select" value={o.firstFormation} onChange={(e) => set("firstFormation", e.target.value)}>
                {fr.edu.map((f) => (
                  <option key={f.t}>{f.t}</option>
                ))}
              </select>
            </label>
          </section>

          <section className="adm-card" aria-labelledby="o-fichier">
            <h2 className="adm-h2" id="o-fichier">Nom du fichier</h2>
            <TextField label="Nom du fichier" value={o.fileName} onChange={(v) => set("fileName", v)} help="Le même nom remplace l’ancien fichier." />
          </section>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>{actions}</div>
        </div>

        <aside className="adm-aside" aria-label="Aperçu et fichiers">
          <section className="adm-card" aria-labelledby="o-apercu">
            <div>
              <h2 className="adm-h2" id="o-apercu">Aperçu · A4, une page</h2>
              <p className="adm-sub">Mis à jour à chaque changement.</p>
            </div>
            <div style={{ width: "100%", aspectRatio: "210 / 297", overflow: "hidden", border: "1px solid var(--bordure)", borderRadius: "var(--r-md)", position: "relative", background: "var(--fond)" }}>
              <iframe ref={frame} onLoad={mesure} title="Aperçu du CV orienté" srcDoc={html} style={{ width: "210mm", height: "297mm", border: 0, transform: "scale(var(--s))", transformOrigin: "0 0", ["--s" as string]: String(410 / ((210 / 25.4) * 96)) }} />
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }} aria-live="polite">
              {remplissage === null ? (
                <span className="adm-help">Mesure en cours…</span>
              ) : tient ? (
                <span className="adm-badge adm-badge--publie">Tient sur 1 page</span>
              ) : (
                <span className="adm-badge" style={{ background: "var(--fond)", color: "var(--erreur)", border: "1.5px solid var(--erreur)" }}>
                  Dépasse d’une page
                </span>
              )}
              {remplissage !== null && <span className="adm-help">Remplissage de la page : {Math.round(remplissage * 100)} %</span>}
            </div>
            {!tient && remplissage !== null && <p className="adm-help" style={{ margin: 0 }}>Raccourcis le contenu (puces, profil ou catégories) : « Générer le PDF » reste désactivé, et le texte n’est jamais réduit automatiquement.</p>}
          </section>

          <section className="adm-card" aria-labelledby="o-fichiers">
            <h2 className="adm-h2" id="o-fichiers">Fichiers générés</h2>
            {fichiers.some((f) => f.generatedAt) ? (
              <ul className="adm-list">
                {fichiers
                  .filter((f) => f.generatedAt)
                  .map((f) => (
                    <li key={f.name}>
                      <span>
                        <b>{f.name}</b>
                        <small className="adm-muted" style={{ display: "block" }}>
                          Généré le {f.generatedAt}
                        </small>
                      </span>
                      <a className="adm-btn adm-btn--link" href={`/media/cv/${f.name}`} target="_blank" rel="noopener noreferrer">
                        <Icon name="external" />
                        Télécharger
                      </a>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="adm-help" style={{ margin: 0 }}>
                Aucun fichier généré pour cette orientation.
              </p>
            )}
          </section>

          <section className="adm-card" aria-labelledby="o-preregle">
            <h2 className="adm-h2" id="o-preregle">Ce que chaque orientation prérègle</h2>
            <table className="adm-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th scope="col"><span className="adm-sr">Réglage</span></th>
                  {orientations.map((x) => (
                    <th key={x.id} scope="col">
                      {x.id === "ux" ? "UX Design" : "Développement"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Intitulé", (x: Orientation) => x.title],
                  ["Projets phares", (x: Orientation) => x.featured.map((id) => sources.projets.find((p) => p.id === id)?.name ?? id).join(", ")],
                  ["Ordre des compétences", (x: Orientation) => x.skillOrder.filter((g) => g.visible).map((g) => g.category).join(", ")],
                  ["Formation en premier", (x: Orientation) => x.firstFormation],
                ].map(([label, f]) => (
                  <tr key={label as string}>
                    <th scope="row" style={{ background: "none", textTransform: "none", letterSpacing: 0, fontSize: 13, color: "var(--encre)" }}>
                      {label as string}
                    </th>
                    {orientations.map((x) => (
                      <td key={x.id}>{(f as (x: Orientation) => string)(x)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </aside>
      </div>
    </>
  );
}
