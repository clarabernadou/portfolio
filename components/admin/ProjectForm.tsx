"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { saveProject, deleteProject, restoreProject, siteGithub, type ProjectInput } from "@/app/admin/(espace)/projets/actions";
import { Checks, InlineInput, ListEditor, SelectField, TagInput, TextArea, TextField, Toggle } from "./fields";
import { RestoreBanner, SaveBar, useDraft } from "./SaveBar";
import { useToast } from "./Toast";
import { Icon } from "./icons";
import { BlobUpload } from "./BlobUpload";
import { slugify } from "@/lib/admin/projects";
import { IaPage } from "./AvisIA";
import { CompleterFicheIA } from "./CompleterFicheIA";
import { ACCEPT_LIVRABLES } from "@/lib/livrables";

const ETAPES = ["Fait", "En cours", "À venir"];

export interface ProjectFormProps {
  initial: ProjectInput;
  cadres: string[];
  types: string[];
  tagSuggestions: Record<string, string[]>;
  skillSuggestions: Record<string, string[]>;
  counts: { onHome: number; featured: number };
  note?: string;
  updatedAt?: string;
}

// Maquette : docs/passation/maquettes/admin/Admin-projet-edition.jpg.
export function ProjectForm({ initial, cadres, types: TYPES, tagSuggestions, skillSuggestions, counts, note, updatedAt }: ProjectFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !initial.originalId;
  const draft = useDraft<ProjectInput>(`admin-projet-${initial.originalId ?? "nouveau"}`, initial);
  const p = draft.value;
  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) => draft.setValue({ ...p, [k]: v });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [cherche, setCherche] = useState(false);
  const autoSlug = isNew && (!p.id || p.id === slugify(initial.name));
  const skills = [...new Set([...(skillSuggestions[p.parcours] ?? []), ...p.skillsValidated])];

  const save = (status: ProjectInput["status"]) =>
    start(async () => {
      setError(null);
      const input = { ...p, status, id: p.id || slugify(p.name) };
      const r = await saveProject(input);
      if (!r.ok) {
        if (r.session) {
          router.push(`/admin/connexion?expire=1&callbackUrl=${encodeURIComponent(location.pathname)}`);
          return;
        }
        setError(r.error);
        return;
      }
      draft.markSaved(input);
      toast({ message: status === "draft" ? "Brouillon enregistré." : "Projet publié." });
      if (isNew || r.id !== initial.originalId) router.replace(`/admin/projets/${r.id}`);
      else router.refresh();
    });

  return (
    <IaPage page={`Fiche projet « ${p.name || "nouveau projet"} » du portfolio · cadre : ${p.parcours || "non précisé"} · types : ${p.types.join(", ") || "non précisés"}`} infos={[`Accroche : ${p.line}`, `Contexte : ${p.context}`, `Tags : ${p.tags.join(", ")}`, `Étapes : ${p.steps.map((s) => `${s.label} (${s.status})`).join(" ; ")}`, `Compétences validées : ${p.skillsValidated.join(", ")}`, `Livrables : ${p.docs.map((d) => d.label).join(", ") || "aucun"}`].join("\n")} github={p.github ?? undefined}>
    <>
      <div>
        <div className="adm-crumb">
          <Link href="/admin/projets">Projets</Link> / {isNew ? "Nouveau" : initial.name}
        </div>
        <h1 className="adm-h1">{isNew ? "Nouveau projet" : `Modifier « ${initial.name} »`}</h1>
      </div>
      <RestoreBanner show={!!draft.restorable} onRestore={draft.restore} onDismiss={draft.dismiss} />

      <div className="adm-edit">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {note && (
            <p className="adm-note" style={{ margin: 0 }}>
              <Icon name="check" /> {note}
            </p>
          )}

          <section className="adm-card" aria-labelledby="s-infos">
            <h2 className="adm-h2" id="s-infos">Informations</h2>
            <div className="adm-grid-2">
              <TextField label="Nom du projet" required value={p.name} onChange={(v) => draft.setValue({ ...p, name: v, id: autoSlug ? slugify(v) : p.id })} />
              <TextField label="Adresse de la page" value={p.id} onChange={(v) => set("id", slugify(v))} help={`/projets/${p.id || "…"}${autoSlug ? " · automatique" : ""}`} />
              <TextField label="Date" value={p.date} onChange={(v) => set("date", v)} help="Texte libre : « août 2026 », « projet perso », « oct. 2026 · en cours »." />
              <SelectField label="Cadre" required value={p.parcours} onChange={(v) => set("parcours", v)} options={cadres} placeholder="Choisir…" help="Formation, audit, entreprise ou projet perso." />
            </div>
            <Checks legend="Types" options={TYPES} value={p.types} onChange={(v) => set("types", v)} help="Un projet peut avoir plusieurs types." />
          </section>

          <section className="adm-card" aria-labelledby="s-contenu">
            <div className="adm-card-tete">
              <h2 className="adm-h2" id="s-contenu">Contenu</h2>
              <CompleterFicheIA
                fiche={{
                  page: `Fiche projet « ${p.name || "nouveau projet"} » du portfolio · cadre : ${p.parcours || "non précisé"} · types : ${p.types.join(", ") || "non précisés"}`,
                  infos: [`Date : ${p.date || "non précisée"}`, `Étapes : ${p.steps.map((s) => `${s.label} (${s.status})`).join(" ; ") || "aucune"}`, `Compétences validées : ${p.skillsValidated.join(", ") || "aucune"}`, `Livrables : ${p.docs.map((d) => d.label).join(", ") || "aucun"}`].join("\n"),
                  github: p.github || undefined,
                  valeurs: { accroche: p.line, contexte: p.context, ...(p.onHome && p.homeCard ? { carte: p.homeCard.line } : {}) },
                  tags: p.tags,
                }}
                onAppliquer={({ valeurs, tags }) => {
                  draft.setValue({
                    ...p,
                    line: valeurs.accroche ?? p.line,
                    context: valeurs.contexte ?? p.context,
                    homeCard: p.homeCard && valeurs.carte !== undefined ? { ...p.homeCard, line: valeurs.carte } : p.homeCard,
                    tags: [...p.tags, ...tags],
                  });
                  toast({ message: "Propositions appliquées : relis la fiche, puis enregistre." });
                }}
              />
            </div>
            <TextArea label="Accroche" value={p.line} onChange={(v) => set("line", v)} max={140} rows={2} help="Une phrase, affichée sur la carte du projet." />
            <TextArea label="Contexte" value={p.context} onChange={(v) => set("context", v)} max={500} rows={5} />
            <TagInput label="Tags" value={p.tags} onChange={(v) => set("tags", v)} suggestions={tagSuggestions[p.parcours] ?? []} />
            <Checks
              legend="Compétences validées"
              options={skills}
              value={p.skillsValidated}
              onChange={(v) => set("skillsValidated", v)}
              help={skills.length ? "Proposées d’après les autres projets du même cadre : coche celles que le projet valide." : "Aucune compétence proposée pour ce cadre : ajoute-les ci-dessous."}
            />
            <TagInput label="Ajouter une compétence validée" value={[]} onChange={(v) => set("skillsValidated", [...p.skillsValidated, ...v.filter((x) => !p.skillsValidated.includes(x))])} />
          </section>

          <section className="adm-card" aria-labelledby="s-liens">
            <h2 className="adm-h2" id="s-liens">Liens et livrables</h2>
            <div className="adm-grid-2">
              <TextField label="Dépôt GitHub" type="url" value={p.github} onChange={(v) => set("github", v)} placeholder="https://github.com/…" help="Optionnel." />
              <TextField label="Maquette Figma" type="url" value={p.figma} onChange={(v) => set("figma", v)} placeholder="https://figma.com/…" help="Optionnel." />
            </div>
            <TextField
              label="Site en ligne"
              type="url"
              value={p.site}
              onChange={(v) => set("site", v)}
              placeholder="https://…"
              help="Optionnel. Affiché en tête de la fiche du projet : « Voir le site »."
            />
            {p.github && !p.site && (
              <div>
                <button
                  type="button"
                  className="adm-btn adm-btn--outline"
                  disabled={cherche}
                  onClick={async () => {
                    setCherche(true);
                    const r = await siteGithub(p.github);
                    setCherche(false);
                    if (r.ok) {
                      set("site", r.site);
                      toast({ message: "Adresse du site reprise de GitHub : vérifie-la, puis enregistre." });
                    } else toast({ message: r.error });
                  }}
                >
                  <Icon name="sync" />
                  {cherche ? "Recherche sur GitHub…" : "Reprendre l’adresse du site depuis GitHub"}
                </button>
              </div>
            )}
            <ListEditor
              label="Livrables"
              items={p.docs}
              onChange={(v) => set("docs", v)}
              addLabel="Ajouter un livrable"
              make={() => ({ label: "", href: "", thumb: "" })}
              itemName={(d, i) => d.label || `le livrable ${i + 1}`}
              empty={
                <>
                  <b>Aucun livrable</b>Un livrable peut être un PDF, une image, un document Word, une présentation, un tableur, une vidéo… Un PDF peut aussi être découpé en plusieurs livrables : indique l’adresse du fichier suivie de la page de début (…pdf#page=12).
                </>
              }
              render={(d, setD) => (
                <>
                  <InlineInput label="Titre du livrable" placeholder="Titre" value={d.label} onChange={(v) => setD({ ...d, label: v })} />
                  <InlineInput label="Fichier du livrable" placeholder="Envoie le fichier, ou colle son adresse (…pdf#page=12 pour une page)" value={d.href} onChange={(v) => setD({ ...d, href: v })} />
                  <BlobUpload folder={p.id || "nouveau"} accept={ACCEPT_LIVRABLES} label="Envoyer un fichier" onDone={(url) => setD({ ...d, href: url })} />
                  <InlineInput label="Aperçu du livrable (image)" placeholder="Aperçu (image, facultatif) : envoie-la ou colle son adresse" value={d.thumb ?? ""} onChange={(v) => setD({ ...d, thumb: v })} />
                  <BlobUpload folder={p.id || "nouveau"} accept="image/jpeg,image/png,image/webp" label="Envoyer un aperçu" onDone={(url) => setD({ ...d, thumb: url })} />
                </>
              )}
            />
            <ListEditor
              label="Vidéos YouTube"
              items={p.videos}
              onChange={(v) => set("videos", v)}
              addLabel="Ajouter une vidéo"
              make={() => ({ title: "", kicker: "", url: "" })}
              itemName={(d, i) => d.title || `la vidéo ${i + 1}`}
              empty={
                <>
                  <b>Aucune vidéo</b>Colle un lien YouTube : la vignette s’affiche sur la fiche et la vidéo se charge seulement au clic du visiteur.
                </>
              }
              render={(d, setD) => (
                <>
                  <InlineInput label="Lien YouTube" placeholder="https://www.youtube.com/watch?v=…" value={d.url} onChange={(v) => setD({ ...d, url: v })} />
                  <InlineInput label="Titre de la vidéo" placeholder="Titre" value={d.title} onChange={(v) => setD({ ...d, title: v })} />
                  <InlineInput label="Surtitre de la vidéo" placeholder="Surtitre (par défaut « Film 1 sur 3 »)" value={d.kicker} onChange={(v) => setD({ ...d, kicker: v })} />
                </>
              )}
            />
            <ListEditor
              label="Étapes d’avancement"
              items={p.steps}
              onChange={(v) => set("steps", v)}
              addLabel="Ajouter une étape"
              make={() => ({ label: "", status: "À venir" })}
              itemName={(d, i) => d.label || `l’étape ${i + 1}`}
              empty={
                <>
                  <b>Aucune étape</b>Pour un projet en cours, les étapes s’affichent sur sa fiche.
                </>
              }
              render={(d, setD) => (
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 140px", gap: 8 }}>
                  <InlineInput label="Nom de l’étape" placeholder="Étape" value={d.label} onChange={(v) => setD({ ...d, label: v })} />
                  <select className="adm-select" aria-label="État de l’étape" value={d.status} onChange={(e) => setD({ ...d, status: e.target.value })}>
                    {ETAPES.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </div>
              )}
            />
          </section>

          <section className="adm-card" aria-labelledby="s-affichage">
            <h2 className="adm-h2" id="s-affichage">Affichage sur le site</h2>
            <Toggle label="Public" help="Désactive pour le passer en privé : il n’apparaît plus sur le site (liste, fiche, accueil), sans être supprimé." checked={p.visible} onChange={(v) => set("visible", v)} />
            <Toggle
              label="Afficher à l’accueil"
              help={`${counts.onHome} projets sur 9${counts.onHome >= 9 && !initial.onHome ? " : retire d’abord l’un d’eux." : "."}`}
              checked={p.onHome}
              onChange={(v) => draft.setValue({ ...p, onHome: v, homeCard: p.homeCard ?? { section: p.types.includes("Développement") ? "Développement" : "Design", eyebrow: p.parcours, line: p.line, tags: p.tags.slice(0, 3) } })}
            />
            {p.onHome && p.homeCard && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 52 }}>
                <SelectField label="Rubrique de l’accueil" value={p.homeCard.section} onChange={(v) => set("homeCard", { ...p.homeCard!, section: v })} options={["En entreprise", "Design", "Développement"]} />
                <TextField label="Surtitre de la carte" value={p.homeCard.eyebrow} onChange={(v) => set("homeCard", { ...p.homeCard!, eyebrow: v })} />
                <TextArea label="Accroche de la carte" value={p.homeCard.line} onChange={(v) => set("homeCard", { ...p.homeCard!, line: v })} rows={2} />
                <TagInput label="Tags de la carte" value={p.homeCard.tags} onChange={(v) => set("homeCard", { ...p.homeCard!, tags: v })} suggestions={p.tags} />
              </div>
            )}
            <Toggle
              label="Projet phare"
              help={`${counts.featured} projets sur 3 maximum : en tête de la page Projets et dans le CV.`}
              checked={p.featured}
              onChange={(v) => set("featured", v)}
            />
          </section>
        </div>

        <aside className="adm-aside" aria-label="Aperçu et publication">
          <div className="adm-card">
            <div>
              <h2 className="adm-h2">Aperçu</h2>
              <p className="adm-sub">Comme sur la page Projets.</p>
            </div>
            <div style={{ border: "1px solid var(--bordure)", borderRadius: "var(--r-lg)", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ardoise)" }}>
                <span>{p.types.join(" · ") || "Type"}</span>
                <span style={{ textTransform: "none", letterSpacing: 0 }}>{p.date}</span>
              </span>
              <b style={{ fontFamily: "var(--font-titre)", fontSize: 22, letterSpacing: "-0.03em" }}>{p.name || "Nom du projet"}</b>
              <span style={{ color: "var(--amethyste)", fontSize: 13, fontWeight: 700 }}>{p.parcours}</span>
              <span style={{ fontSize: 14, color: "var(--ardoise)" }}>{p.line}</span>
              <span className="adm-checks" style={{ gap: 6 }}>
                {p.tags.map((t) => (
                  <span key={t} className="adm-tag">
                    {t}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <div className="adm-card">
            <h2 className="adm-h2">Publication</h2>
            <p className="adm-help" style={{ margin: 0 }}>
              Statut actuel : <b>{initial.status === "draft" ? "Brouillon" : isNew ? "Nouveau" : !initial.visible ? "Privé" : "Publié"}</b>
              {updatedAt ? ` · dernière modification : ${updatedAt}` : ""}
            </p>
            {!isNew && (
              <a className="adm-btn adm-btn--outline" href={`/projets/${initial.originalId}`} target="_blank" rel="noopener noreferrer">
                <Icon name="external" />
                Voir sur le site
              </a>
            )}
            {!isNew && (
              <button
                type="button"
                className="adm-btn adm-btn--danger"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm(`Supprimer « ${initial.name} » ? Tu pourras annuler pendant 10 secondes.`)) return;
                  const id = initial.originalId!;
                  start(async () => {
                    await deleteProject(id);
                    draft.markSaved(p);
                    toast({ message: `« ${initial.name} » supprimé.`, undo: () => restoreProject(id) });
                    router.push("/admin/projets");
                  });
                }}
              >
                <Icon name="trash" />
                Supprimer le projet
              </button>
            )}
          </div>
        </aside>
      </div>

      <SaveBar dirty={draft.dirty} error={error}>
        {draft.dirty && (
          <button type="button" className="adm-btn adm-btn--link" onClick={draft.reset}>
            Annuler
          </button>
        )}
        <button type="button" className="adm-btn adm-btn--outline" disabled={pending} onClick={() => save("draft")}>
          Enregistrer le brouillon
        </button>
        <button type="button" className="adm-btn" disabled={pending} onClick={() => save("published")}>
          Publier
        </button>
      </SaveBar>
    </>
    </IaPage>
  );
}
