"use client";

import { useId, useState } from "react";
import { COMPETENCE_MAX, ajouterCompetence } from "@/lib/competences";

// Champ « Ajouter une compétence » sous la liste à cocher des compétences mises en pratique (24 nov. 2026) :
// Entrée pour valider, comme le champ Tags, sans couper sur la virgule. La compétence ajoutée est cochée tout de suite,
// enregistrée avec la fiche, puis proposée sur les autres fiches du même cadre. Doublons refusés (lib/competences.ts).
export function AjoutCompetence({ cochees, proposees, onChange }: { cochees: string[]; proposees: string[]; onChange: (v: string[]) => void }) {
  const id = useId();
  const [saisie, setSaisie] = useState("");
  const [message, setMessage] = useState<{ texte: string; erreur: boolean } | null>(null);
  const valider = () => {
    const r = ajouterCompetence(saisie, cochees, proposees);
    setMessage({ texte: r.message, erreur: !r.ok });
    if (r.ok) {
      onChange(r.cochees);
      setSaisie("");
    }
  };
  return (
    <div className="adm-field">
      <label className="adm-label" htmlFor={id}>
        Ajouter une compétence
      </label>
      <input
        id={id}
        className="adm-input"
        value={saisie}
        maxLength={COMPETENCE_MAX}
        aria-describedby={`${id}-aide ${id}-message`}
        aria-invalid={message?.erreur || undefined}
        placeholder="Ajouter puis Entrée"
        onChange={(e) => {
          setSaisie(e.target.value);
          if (message?.erreur) setMessage(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            valider();
          }
        }}
      />
      <span className="adm-help" id={`${id}-aide`}>
        {`Un verbe à l’infinitif, par exemple « Concevoir une API REST ». Elle est cochée tout de suite et sera proposée sur les autres fiches du même cadre. ${saisie.length} / ${COMPETENCE_MAX} caractères.`}
      </span>
      <span id={`${id}-message`} role="status" className="adm-help" style={message?.erreur ? { color: "var(--erreur)", fontWeight: 700 } : undefined}>
        {message?.texte ?? ""}
      </span>
    </div>
  );
}
