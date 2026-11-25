"use client";

import { useId } from "react";
import { TextArea, TextField } from "./fields";
import { CHAMPS_EVALUATION, datePrecise, moisDeSoutenance, type Evaluation } from "@/lib/evaluation";

// Section « Retour de l'évaluateur » de la fiche projet (demande de Clara, 23 nov. 2026), sous le retour
// d'expérience. Distincte de celui-ci : c'est l'évaluation de soutenance OpenClassrooms, reproduite mot pour mot
// (25 nov. 2026) : aucune aide de l'IA sur ces champs. Limites strictes (lib/evaluation.ts).
// Date de soutenance : mois et année en texte, ou date précise (champ date facultatif), dans la même colonne.
export function EvaluationForm({ valeur, onChange }: { valeur: Evaluation; onChange: (e: Evaluation) => void }) {
  const titreId = useId();
  const [mois, ...textes] = CHAMPS_EVALUATION;
  const precise = datePrecise(valeur.mois) ? valeur.mois.trim() : "";
  return (
    <section className="adm-card" id="evaluation" aria-labelledby={titreId}>
      <div>
        <h2 className="adm-h2" id={titreId}>
          Retour de l’évaluateur
        </h2>
        <p className="adm-sub">Ce que l’évaluateur a écrit à la soutenance, recopié mot pour mot. Le bloc s’affiche sur la fiche publique, sous le retour d’expérience, dès qu’un champ est rempli, avec la mention « Évaluation de soutenance OpenClassrooms, reproduite telle quelle. »</p>
      </div>
      <div className="adm-grid-2">
        <TextField
          label={mois.libelle}
          value={moisDeSoutenance(valeur.mois)}
          onChange={(v) => onChange({ ...valeur, mois: v })}
          placeholder="octobre 2026"
          help={precise ? "Déduit de la date précise. Vide la date précise pour saisir seulement le mois." : `${mois.aide} ${valeur.mois.length} / ${mois.max} caractères.`}
        />
        <TextField
          label="Date précise de soutenance (facultatif)"
          type="date"
          value={precise}
          onChange={(v) => onChange({ ...valeur, mois: v || moisDeSoutenance(valeur.mois) })}
          help="Avec le jour : la fiche affiche « Soutenance réalisée le 20 octobre 2026 ». Sans : « Soutenance réalisée en octobre 2026 »."
        />
      </div>
      {textes.map((c) => (
        <TextArea key={c.cle} label={c.libelle} value={valeur[c.cle]} onChange={(v) => onChange({ ...valeur, [c.cle]: v })} max={c.max} rows={4} help={c.aide} ia={false} />
      ))}
    </section>
  );
}
