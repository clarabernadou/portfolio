"use client";

import { useId } from "react";
import { TextArea } from "./fields";
import { CHAMPS_RETOUR, champsRemplis, pistesRetour, type ProjetPistes, type Retour } from "@/lib/retour";

// Section « Retour d'expérience » de la fiche projet (demande de Clara, 4 nov. 2026). Sous chaque
// champ, des pistes tirées du projet (tags, cadre, date) : des questions pour raviver le souvenir,
// jamais des réponses. Le bouton « Avis de l'IA » met en forme ce que Clara a écrit, sans rien ajouter.
const CONSIGNE_IA = "Reformule seulement ce que Clara a écrit, à la première personne : n’ajoute aucune difficulté, aucun apprentissage, aucune amélioration ni aucun fait qui ne figure pas dans son texte.";

export function RetourForm({ valeur, onChange, projet }: { valeur: Retour; onChange: (r: Retour) => void; projet: ProjetPistes }) {
  const titreId = useId();
  const pistes = pistesRetour(projet);
  const n = champsRemplis(valeur);
  return (
    <section className="adm-card" id="retour" aria-labelledby={titreId}>
      <div>
        <h2 className="adm-h2" id={titreId}>
          Retour d’expérience
        </h2>
        <p className="adm-sub">
          Ce qu’un recruteur cherche derrière le projet : les obstacles, ce que tu en as tiré, ton recul. Chaque champ rempli s’affiche sur la fiche publique.{" "}
          <b>
            {n} {n > 1 ? "champs remplis" : "champ rempli"} sur {CHAMPS_RETOUR.length}
          </b>
        </p>
      </div>
      {CHAMPS_RETOUR.map((c) => (
        <div key={c.cle} className="adm-retour-champ">
          <TextArea label={c.titre} value={valeur[c.cle]} onChange={(v) => onChange({ ...valeur, [c.cle]: v })} max={c.max} rows={4} help={c.aide} consigneIA={CONSIGNE_IA} />
          <div className="adm-retour-pistes">
            <p className="adm-label">Pistes pour t’aider</p>
            <ul>
              {pistes[c.cle].map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </section>
  );
}
