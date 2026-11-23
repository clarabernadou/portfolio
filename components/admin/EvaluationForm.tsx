"use client";

import { useId } from "react";
import { TextArea, TextField } from "./fields";
import { CHAMPS_EVALUATION, type Evaluation } from "@/lib/evaluation";

// Section « Retour de l'évaluateur » de la fiche projet (demande de Clara, 23 nov. 2026), sous le retour
// d'expérience. Distincte de celui-ci : c'est l'évaluation de soutenance OpenClassrooms, reformulée.
// Limites strictes (lib/evaluation.ts) : l'enregistrement est refusé au-delà.
const CONSIGNE_IA = "Reformule seulement l’évaluation de soutenance collée par Clara : n’ajoute aucun point fort, aucun axe d’amélioration, aucune remarque ni aucun fait qui ne figure pas dans son texte. Garde un point par ligne.";

export function EvaluationForm({ valeur, onChange }: { valeur: Evaluation; onChange: (e: Evaluation) => void }) {
  const titreId = useId();
  const [mois, ...textes] = CHAMPS_EVALUATION;
  return (
    <section className="adm-card" id="evaluation" aria-labelledby={titreId}>
      <div>
        <h2 className="adm-h2" id={titreId}>
          Retour de l’évaluateur
        </h2>
        <p className="adm-sub">Ce que l’évaluateur a dit à la soutenance, reformulé. Le bloc s’affiche sur la fiche publique, sous le retour d’expérience, dès qu’un champ est rempli, avec la mention « D’après l’évaluation de soutenance OpenClassrooms, reformulée. »</p>
      </div>
      <TextField label={mois.libelle} value={valeur.mois} onChange={(v) => onChange({ ...valeur, mois: v })} placeholder="mai 2025" help={`${mois.aide} ${valeur.mois.length} / ${mois.max} caractères.`} />
      {textes.map((c) => (
        <TextArea key={c.cle} label={c.libelle} value={valeur[c.cle]} onChange={(v) => onChange({ ...valeur, [c.cle]: v })} max={c.max} rows={4} help={c.aide} consigneIA={CONSIGNE_IA} />
      ))}
    </section>
  );
}
