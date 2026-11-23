"use client";

import { useState } from "react";
import { Toggle } from "./fields";
import { setIaPubliee } from "@/app/admin/(espace)/page-ia/actions";

// Interrupteur « Page IA publiée » (23 nov. 2026) : enregistré dès qu'on le bascule. Désactivé, /ia renvoie une
// 404, et le lien IA de la navigation, la section « L'IA, au quotidien » de l'accueil et le plan du site disparaissent.
export function PublicationIa({ initial }: { initial: boolean }) {
  const [publiee, setPubliee] = useState(initial);
  const [etat, setEtat] = useState("");
  const [enCours, setEnCours] = useState(false);

  const basculer = async (v: boolean) => {
    if (enCours) return;
    setEnCours(true);
    setPubliee(v);
    setEtat("Enregistrement…");
    const r = await setIaPubliee(v).catch(() => ({ ok: false as const, error: "L’enregistrement a échoué. Réessaie." }));
    if (r.ok) setEtat(v ? "Page IA publiée : elle est de nouveau accessible et reliée depuis le site." : "Page IA masquée : /ia renvoie une page introuvable et ses liens ont disparu du site.");
    else {
      setPubliee(!v);
      setEtat(r.error);
    }
    setEnCours(false);
  };

  return (
    <section className="adm-card" aria-labelledby="publication-ia">
      <h2 className="adm-h2" id="publication-ia">
        Publication
      </h2>
      <Toggle
        label="Page IA publiée"
        help="Désactivée : /ia renvoie une page introuvable (404), et le lien IA de la navigation, la section « L’IA, au quotidien » de l’accueil et le plan du site disparaissent. Enregistré tout de suite."
        checked={publiee}
        onChange={basculer}
      />
      <p className="adm-help" role="status">
        {etat}
      </p>
    </section>
  );
}
