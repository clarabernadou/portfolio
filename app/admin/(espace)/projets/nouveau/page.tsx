import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { fetchRepo, moisAnnee, parseRepoUrl, prettyName } from "@/lib/admin/github";
import { slugify } from "@/lib/admin/projects";
import { EMPTY, formContext } from "../form-data";
import { duplicateFromForm, type ProjectInput } from "../actions";

export const metadata: Metadata = { title: "Nouveau projet" };
export const dynamic = "force-dynamic";

// Modèles de départ (ADMIN-et-SYNCHRONISATION.md §5) : ils choisissent le type et le cadre ;
// le texte reste à écrire par Clara.
const MODELES: Record<string, { titre: string; texte: string; puces: string[]; data: Partial<ProjectInput>; note: string }> = {
  formation: {
    titre: "Projet de formation OpenClassrooms",
    texte: "Type, cadre et compétences validées de la formation, livrables en PDF.",
    puces: ["Cadre", "Compétences", "Livrables"],
    data: {},
    note: "Choisis la formation dans « Cadre » : les compétences validées proposées viennent de ses autres projets.",
  },
  audit: {
    titre: "Audit",
    texte: "Constats, recommandations, plan d’action, livrable PDF.",
    puces: ["UX / UI", "Livrable PDF"],
    data: { types: ["UX / UI"], parcours: "Audit indépendant" },
    note: "Champs préremplis : type UX / UI et cadre « Audit indépendant ». Vérifie-les avant d’enregistrer.",
  },
  perso: {
    titre: "Projet personnel",
    texte: "Dépôt GitHub, maquettes Figma, stack et avancement.",
    puces: ["Développement", "GitHub", "Figma"],
    data: { types: ["Développement"], parcours: "Projet personnel" },
    note: "Champs préremplis : type Développement et cadre « Projet personnel ». Vérifie-les avant d’enregistrer.",
  },
  entreprise: {
    titre: "Projet en entreprise",
    texte: "Cadre alternance, contexte, rôle, sans livrable public.",
    puces: ["Alternance", "Contexte"],
    data: { parcours: "Alternance · Fruggr" },
    note: "Champ prérempli : cadre « Alternance · Fruggr ». Vérifie-le avant d’enregistrer.",
  },
};

type Search = { depart?: string; modele?: string; github?: string };

export default async function NouveauProjet({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  let initial: ProjectInput | null = null;
  let note: string | undefined;
  let erreur: string | null = null;

  if (sp.github) {
    const ref = parseRepoUrl(sp.github);
    if (!ref) erreur = "Cette adresse n’est pas celle d’un dépôt GitHub (https://github.com/compte/depot).";
    else {
      try {
        const r = await fetchRepo(ref.owner, ref.repo);
        const name = prettyName(r.name);
        initial = { ...EMPTY, name, id: slugify(name), line: r.description, tags: r.languages, github: r.url, date: moisAnnee(r.pushedAt), types: ["Développement"] };
        note = "Préremplis depuis GitHub : nom, description, tags (langages), lien et date du dernier commit. Vérifie-les avant d’enregistrer.";
      } catch (e) {
        erreur = e instanceof Error ? e.message : "GitHub n’a pas répondu.";
      }
    }
  } else if (sp.modele && MODELES[sp.modele]) {
    initial = { ...EMPTY, ...MODELES[sp.modele].data };
    note = MODELES[sp.modele].note;
  } else if (sp.depart === "vide") {
    initial = EMPTY;
  }

  if (initial) return <ProjectForm initial={initial} note={note} {...await formContext()} />;

  const projets = await db().project.findMany({ where: { deletedAt: null }, orderBy: { position: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <div>
        <div className="adm-crumb">
          <Link href="/admin/projets">Projets</Link> / Nouveau
        </div>
        <h1 className="adm-h1">Nouveau projet</h1>
        <p className="adm-sub">Choisis le point de départ le plus proche : le formulaire se remplit pour toi.</p>
      </div>
      <div className="adm-grid-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <form className="adm-card" action="/admin/projets/nouveau" style={{ borderColor: "var(--amethyste)", borderWidth: 2 }}>
          <h2 className="adm-h2">Importer depuis GitHub</h2>
          <p className="adm-sub" style={{ margin: 0 }}>
            Colle l’adresse du dépôt : le nom, la description, les langages et le lien sont préremplis.
          </p>
          <label className="adm-field">
            <span className="adm-label">Adresse du dépôt</span>
            <input className="adm-input" type="url" name="github" required defaultValue="https://github.com/clarabernadou/" aria-describedby="gh-aide" />
            <span className="adm-help" id="gh-aide">
              Préremplis : nom · description · tags (langages) · lien GitHub · date du dernier commit
            </span>
          </label>
          {erreur && (
            <p className="adm-error" role="alert" style={{ margin: 0 }}>
              {erreur}
            </p>
          )}
          <button className="adm-btn" type="submit">
            Importer le dépôt
          </button>
        </form>
        <form className="adm-card" action={duplicateFromForm}>
          <h2 className="adm-h2">Dupliquer un projet</h2>
          <p className="adm-sub" style={{ margin: 0 }}>
            Part d’un projet existant : mêmes types, cadre et structure, contenu à réécrire.
          </p>
          <label className="adm-field">
            <span className="adm-label">Projet à copier</span>
            <select className="adm-select" name="source" defaultValue="watchedthis">
              {projets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button className="adm-btn adm-btn--outline" type="submit">
            Dupliquer
          </button>
        </form>
        <div className="adm-card">
          <h2 className="adm-h2">Partir de zéro</h2>
          <p className="adm-sub" style={{ margin: 0 }}>
            Un formulaire vide, avec les champs essentiels en premier.
          </p>
          <Link className="adm-btn adm-btn--outline" href="/admin/projets/nouveau?depart=vide" style={{ marginTop: "auto" }}>
            Créer un projet vide
          </Link>
        </div>
      </div>
      <section className="adm-card" aria-labelledby="modeles">
        <div>
          <h2 className="adm-h2" id="modeles">Ou pars d’un modèle</h2>
          <p className="adm-sub">Un modèle choisit le type, le cadre, les sections utiles et les compétences à cocher.</p>
        </div>
        <div className="adm-grid-4">
          {Object.entries(MODELES).map(([k, m]) => (
            <Link key={k} href={`/admin/projets/nouveau?modele=${k}`} className="adm-card" style={{ textDecoration: "none", color: "inherit", gap: 10 }}>
              <b style={{ fontSize: 17 }}>{m.titre}</b>
              <span className="adm-help">{m.texte}</span>
              <span className="adm-checks" style={{ gap: 6 }}>
                {m.puces.map((x) => (
                  <span key={x} className="adm-pill" style={{ color: "var(--amethyste)" }}>
                    {x}
                  </span>
                ))}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
