"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { envoyerCv } from "@/app/admin/(espace)/profil/actions";
import { useToast } from "./Toast";
import { Icon } from "./icons";

type Fichier = { name: string; generatedAt: string | null };

// Bloc « CV en PDF » de Profil et CV. Depuis le 12 nov. 2026, le CV du site est le PDF que Clara
// envoie (sa version synthétisée) : on le remplace en envoyant le nouveau fichier, au lieu de le générer.
export function PdfCard({ cv }: { cv: Fichier }) {
  const router = useRouter();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const onFile = (file: File) => {
    setError(null);
    const form = new FormData();
    form.append("cv", file);
    start(async () => {
      const r = await envoyerCv(form);
      if (input.current) input.current.value = "";
      if (!r.ok) {
        if (r.session) return router.push("/admin/connexion?expire=1&callbackUrl=/admin/profil");
        return setError(r.error);
      }
      toast({ message: "CV remplacé : le bouton « Télécharger le CV » du site sert le nouveau PDF." });
      router.refresh();
    });
  };

  return (
    <section className="adm-card" aria-labelledby="p-pdf">
      <div>
        <h2 className="adm-h2" id="p-pdf">CV en PDF</h2>
        <p className="adm-sub">Le PDF téléchargé depuis le site. Pour le mettre à jour, envoie le nouveau fichier : il remplace l’ancien, à la même adresse.</p>
      </div>
      <ul className="adm-list">
        <li>
          <span style={{ minWidth: 0 }}>
            <b style={{ overflowWrap: "anywhere" }}>{cv.name}</b>
            <small className="adm-muted" style={{ display: "block", whiteSpace: "normal" }}>
              {cv.generatedAt ? `Envoyé le ${cv.generatedAt}` : "Fichier d’origine du site (jamais remplacé)"}
            </small>
          </span>
          <a className="adm-btn adm-btn--link" href={`/media/cv/${cv.name}`} target="_blank" rel="noopener noreferrer" aria-label="Ouvrir le CV en PDF (nouvel onglet)">
            <Icon name="external" />
            Ouvrir
          </a>
        </li>
      </ul>
      <button type="button" className="adm-btn adm-btn--outline" disabled={pending} onClick={() => input.current?.click()}>
        <Icon name="upload" />
        {pending ? "Envoi…" : "Remplacer le CV"}
      </button>
      <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <span className="adm-help">Fichier PDF, 2,5 Mo au plus.</span>
      {error && (
        <div className="adm-empty" role="alert">
          <b className="adm-error">{error}</b>
        </div>
      )}
    </section>
  );
}
