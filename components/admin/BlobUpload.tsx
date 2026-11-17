"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import { Icon } from "./icons";

// Envoi direct d'un fichier vers Vercel Blob (les livrables dépassent souvent la limite
// d'envoi des fonctions) ; renvoie son adresse publique.
function envoyerVersBlob(folder: string, file: File, onProgress: (pourcent: number) => void) {
  const nom = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "_");
  return upload(`livrables/${folder}/${nom}`, file, {
    access: "public",
    handleUploadUrl: "/api/admin/blob",
    multipart: file.size > 8 * 1024 * 1024,
    onUploadProgress: (p) => onProgress(p.percentage),
  }).then((b) => b.url);
}

// Bouton « Envoyer un fichier » : son adresse publique remplit le champ.
export function BlobUpload({ folder, accept, label, onDone }: { folder: string; accept: string; label: string; onDone: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [etat, setEtat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const envoyer = async (file: File) => {
    setError(null);
    setEtat("Envoi… 0 %");
    try {
      onDone(await envoyerVersBlob(folder, file, (p) => setEtat(`Envoi… ${Math.round(p)} %`)));
      setEtat("Fichier envoyé.");
    } catch (e) {
      setEtat(null);
      setError(e instanceof Error ? e.message : "L’envoi a échoué.");
    }
  };

  return (
    <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <button type="button" className="adm-btn adm-btn--outline" style={{ minHeight: 40, fontSize: 14 }} onClick={() => input.current?.click()}>
        <Icon name="upload" />
        {label}
      </button>
      <input ref={input} type="file" accept={accept} hidden onChange={(e) => e.target.files?.[0] && envoyer(e.target.files[0])} />
      <span className="adm-help" role="status" aria-live="polite">
        {etat}
      </span>
      {error && (
        <span className="adm-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}

export interface FichierEnvoye {
  url: string;
  /** Nom du fichier sans son extension, pour pré-remplir un titre. */
  nom: string;
}

// Bouton « Envoyer plusieurs fichiers » : chaque fichier choisi part vers Vercel Blob,
// trois à la fois, et ceux qui sont arrivés sont ajoutés à la liste dans l'ordre du choix.
// Ils se configurent ensuite un par un (titre, description…).
export function BlobUploadMulti({ folder, accept, label, onDone }: { folder: string; accept: string; label: string; onDone: (fichiers: FichierEnvoye[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [etat, setEtat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const envoyer = async (liste: File[]) => {
    if (!liste.length) return;
    setError(null);
    setEnCours(true);
    const total = liste.length;
    const progression = new Array<number>(total).fill(0);
    const afficher = () => {
      const faits = progression.filter((p) => p >= 100).length;
      const moyenne = progression.reduce((a, b) => a + b, 0) / total;
      setEtat(`Envoi… ${faits} sur ${total} (${Math.round(moyenne)} %)`);
    };
    afficher();
    const resultats: (FichierEnvoye | null)[] = new Array(total).fill(null);
    const echecs: string[] = [];
    let suivant = 0;
    const ouvrier = async () => {
      while (suivant < total) {
        const i = suivant++;
        const file = liste[i];
        try {
          const url = await envoyerVersBlob(folder, file, (p) => {
            progression[i] = p;
            afficher();
          });
          progression[i] = 100;
          afficher();
          resultats[i] = { url, nom: file.name.replace(/\.[^.]+$/, "") };
        } catch {
          progression[i] = 100;
          echecs.push(file.name);
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, total) }, ouvrier));
    const ok = resultats.filter((r): r is FichierEnvoye => r !== null);
    if (ok.length) onDone(ok);
    setEnCours(false);
    setEtat(ok.length ? `${ok.length} fichier${ok.length > 1 ? "s" : ""} ajouté${ok.length > 1 ? "s" : ""} : complète-les ci-dessous, puis enregistre.` : null);
    if (echecs.length) setError(`Envoi impossible : ${echecs.join(", ")}.`);
    if (input.current) input.current.value = "";
  };

  return (
    <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <button type="button" className="adm-btn adm-btn--outline" style={{ minHeight: 40, fontSize: 14 }} disabled={enCours} onClick={() => input.current?.click()}>
        <Icon name="upload" />
        {label}
      </button>
      <input ref={input} type="file" accept={accept} multiple hidden onChange={(e) => envoyer(Array.from(e.target.files ?? []))} />
      <span className="adm-help" role="status" aria-live="polite">
        {etat}
      </span>
      {error && (
        <span className="adm-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
