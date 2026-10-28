"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { generateEssentiel } from "@/app/admin/(espace)/profil/actions";
import { useToast } from "./Toast";
import { Icon } from "./icons";

type Fichier = { name: string; generatedAt: string | null };

// Bloc « CV en PDF » de Profil et CV (maquette Admin-profil-cv.jpg, critère 7 ter).
// Version anglaise retirée (décision de Clara, 24 oct. 2026) : CV en français seulement.
export function PdfCard({ essentiel, orientes }: { essentiel: Fichier; orientes: { id: string; name: string; fichier: Fichier }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const date = (f: Fichier) => (f.generatedAt ? `généré le ${f.generatedAt}` : "jamais généré depuis l’administration");

  return (
    <section className="adm-card" aria-labelledby="p-pdf">
      <div>
        <h2 className="adm-h2" id="p-pdf">CV en PDF</h2>
        <p className="adm-sub">Le PDF reprend le contenu du site.</p>
      </div>
      <ul className="adm-list">
        <li>
          <span>
            <b>CV</b>
            <small className="adm-muted" style={{ display: "block", whiteSpace: "normal" }}>
              {date(essentiel)}
            </small>
          </span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              type="button"
              className="adm-btn adm-btn--outline"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setError(null);
                  const r = await generateEssentiel();
                  if (!r.ok) {
                    if (r.session) return router.push("/admin/connexion?expire=1&callbackUrl=/admin/profil");
                    return setError(r.error);
                  }
                  toast({ message: `CV généré (${r.pages} pages).` });
                  router.refresh();
                })
              }
            >
              {pending ? "Génération…" : "Générer"}
            </button>
            <a className="adm-btn adm-btn--link" href={`/media/cv/${essentiel.name}`} target="_blank" rel="noopener noreferrer">
              <Icon name="external" />
              Télécharger
            </a>
          </span>
        </li>
      </ul>
      {error && (
        <div className="adm-empty" role="alert">
          <b className="adm-error">{error}</b>
        </div>
      )}
      <div className="adm-field">
        <span className="adm-label" style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ardoise)" }}>
          CV orientés · 1 page
        </span>
        <span className="adm-help">Pour candidater : un CV d’une page, orienté selon le poste visé.</span>
      </div>
      <ul className="adm-list">
        {orientes.map((o) => (
          <li key={o.id}>
            <span>
              <b>{o.name}</b>
              <small className="adm-muted" style={{ display: "block", whiteSpace: "normal" }}>
                Une page · {date(o.fichier)}
              </small>
            </span>
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Link className="adm-btn adm-btn--outline" href={`/admin/profil/cv-oriente/${o.id}`}>
                Personnaliser
              </Link>
              {o.fichier.generatedAt && (
                <a className="adm-btn adm-btn--link" href={`/media/cv/${o.fichier.name}`} target="_blank" rel="noopener noreferrer">
                  <Icon name="external" />
                  Télécharger
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
