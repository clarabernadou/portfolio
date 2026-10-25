import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Icon } from "@/components/admin/icons";
import { FormationForm } from "@/components/admin/FormationForm";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { moveFormation, type FormationInput } from "./actions";

export const metadata: Metadata = { title: "Formations" };
export const dynamic = "force-dynamic";

const VIDE: FormationInput = { id: null, intitule: "", url: "", annees: "", diplome: "", niveauComplet: "OpenClassrooms · ", mode: "En alternance", statut: "En cours", projets: "", competencesAcquises: [], mentionComplementaire: "" };

// Maquette : docs/passation/maquettes/admin/Admin-formations.jpg.
export default async function Formations({ searchParams }: { searchParams: Promise<{ id?: string; nouvelle?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const prisma = db();
  const [rows, projets] = await Promise.all([
    prisma.formation.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] }),
    prisma.project.groupBy({ by: ["parcours"], where: { deletedAt: null }, _count: true }),
  ]);
  const selected = sp.nouvelle ? null : (rows.find((r) => r.id === Number(sp.id)) ?? rows[0]);
  const initial: FormationInput = selected
    ? {
        id: selected.id,
        intitule: selected.intitule,
        url: selected.url ?? "",
        annees: selected.annees,
        diplome: selected.diplome,
        niveauComplet: selected.niveauComplet,
        mode: selected.mode,
        statut: selected.statut,
        projets: selected.projets,
        competencesAcquises: (selected.competencesAcquises as string[] | null) ?? [],
        mentionComplementaire: selected.mentionComplementaire ?? "",
      }
    : VIDE;
  const rattaches = projets.find((p) => p.parcours === initial.intitule)?._count ?? 0;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">Formations</h1>
          <p className="adm-sub">Les formations de la frise de l’accueil et du CV.</p>
        </div>
        <Link className="adm-btn" href="/admin/formations?nouvelle=1">
          <Icon name="plus" />
          Ajouter une formation
        </Link>
      </div>
      <div className="adm-split">
        <ul className="adm-cards" aria-label="Formations, de la plus récente à la plus ancienne">
          {rows.map((r, i) => (
            <li key={r.id} className="adm-card adm-item" aria-current={selected?.id === r.id ? "true" : undefined}>
              <MoveButtons name={r.intitule} first={i === 0} last={i === rows.length - 1} onMove={moveFormation.bind(null, r.id)} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <small className="adm-item-kicker">{r.annees}</small>
                <b className="adm-item-title">{r.intitule}</b>
                <small className="adm-help">
                  {r.diplome} · {r.projets}
                </small>
                <span className="adm-checks" style={{ gap: 6, marginTop: 6 }}>
                  <span className={`adm-badge adm-badge--${r.statut === "En cours" ? "cours" : "publie"}`}>{r.statut}</span>
                  <span className="adm-badge adm-badge--brouillon">{r.mode}</span>
                </span>
              </span>
              <Link className="adm-icon-btn" href={`/admin/formations?id=${r.id}`} aria-label={`Modifier « ${r.intitule} »`}>
                <Icon name="edit" size={16} />
              </Link>
            </li>
          ))}
          <li>
            <Link className="adm-btn adm-btn--outline" style={{ width: "100%" }} href="/admin/formations?nouvelle=1">
              <Icon name="plus" />
              Ajouter une formation
            </Link>
          </li>
        </ul>
        <FormationForm key={initial.id ?? "nouvelle"} initial={initial} rattaches={rattaches} />
      </div>
    </>
  );
}
