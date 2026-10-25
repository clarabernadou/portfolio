import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Icon } from "@/components/admin/icons";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { MoveButtons } from "@/components/admin/MoveButtons";
import type { ExperienceBloc } from "@/lib/types";
import { toBloc } from "@/lib/admin/experiences";
import { moveExperience, type ExperienceInput } from "./actions";

export const metadata: Metadata = { title: "Expériences" };
export const dynamic = "force-dynamic";

const VIDE: ExperienceInput = {
  id: null,
  poste: "",
  entreprise: "",
  entrepriseHref: "",
  entrepriseParent: "",
  entrepriseParentHref: "",
  periode: "",
  lieuMode: "",
  contexteEssentiel: "",
  contexteComplet: "",
  blocs: [{ name: "", period: "", puces: [{ text: "", essentiel: true, complet: true }], technologies: [] }],
  competencesAcquisesComplet: [],
  note: "",
  accueil: { visible: false, lieuMode: "", technologies: [] },
};

// Maquette : docs/passation/maquettes/admin/Admin-experiences.jpg.
export default async function Experiences({ searchParams }: { searchParams: Promise<{ id?: string; nouvelle?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await db().experience.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  const r = sp.nouvelle ? null : (rows.find((x) => x.id === Number(sp.id)) ?? rows[0]);
  const hc = r?.homeCard as { lieuMode: string; technologies: string[] } | null;
  const initial: ExperienceInput = r
    ? {
        id: r.id,
        poste: r.poste,
        entreprise: r.entreprise,
        entrepriseHref: r.entrepriseHref ?? "",
        entrepriseParent: r.entrepriseParent ?? "",
        entrepriseParentHref: r.entrepriseParentHref ?? "",
        periode: r.periode,
        lieuMode: r.lieuMode,
        contexteEssentiel: r.contexteEssentiel,
        contexteComplet: r.contexteComplet,
        blocs: (r.blocs as unknown as ExperienceBloc[]).map(toBloc),
        competencesAcquisesComplet: (r.competencesAcquisesComplet as string[] | null) ?? [],
        note: r.note ?? "",
        accueil: hc ? { visible: true, lieuMode: hc.lieuMode, technologies: hc.technologies } : { visible: false, lieuMode: "", technologies: [] },
      }
    : VIDE;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">Expériences</h1>
          <p className="adm-sub">Les expériences de l’accueil et du CV, en version essentielle et complète.</p>
        </div>
        <Link className="adm-btn" href="/admin/experiences?nouvelle=1">
          <Icon name="plus" />
          Ajouter une expérience
        </Link>
      </div>
      <div className="adm-split">
        <ul className="adm-cards" aria-label="Expériences, de la plus récente à la plus ancienne">
          {rows.map((x, i) => {
            const nom = x.entrepriseParent ? `${x.entreprise} by ${x.entrepriseParent}` : x.entreprise;
            return (
              <li key={x.id} className="adm-card adm-item" aria-current={r?.id === x.id ? "true" : undefined}>
                <MoveButtons name={nom} first={i === 0} last={i === rows.length - 1} onMove={moveExperience.bind(null, x.id)} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <small className="adm-item-kicker">{x.periode}</small>
                  <b className="adm-item-title">{nom}</b>
                  <small className="adm-help">{x.poste}</small>
                </span>
                <Link className="adm-icon-btn" href={`/admin/experiences?id=${x.id}`} aria-label={`Modifier « ${nom} »`}>
                  <Icon name="edit" size={16} />
                </Link>
              </li>
            );
          })}
          <li>
            <Link className="adm-btn adm-btn--outline" style={{ width: "100%" }} href="/admin/experiences?nouvelle=1">
              <Icon name="plus" />
              Ajouter une expérience
            </Link>
          </li>
        </ul>
        <ExperienceForm key={initial.id ?? "nouvelle"} initial={initial} />
      </div>
    </>
  );
}
