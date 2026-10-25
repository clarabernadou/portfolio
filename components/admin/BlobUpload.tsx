"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import { Icon } from "./icons";

// Bouton « Envoyer un fichier » : le fichier part directement vers Vercel Blob
// (les livrables dépassent souvent la limite d'envoi des fonctions), puis son
// adresse publique remplit le champ.
export function BlobUpload({ folder, accept, label, onDone }: { folder: string; accept: string; label: string; onDone: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [etat, setEtat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const envoyer = async (file: File) => {
    setError(null);
    setEtat("Envoi… 0 %");
    try {
      const nom = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "_");
      const blob = await upload(`livrables/${folder}/${nom}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob",
        multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: (p) => setEtat(`Envoi… ${Math.round(p.percentage)} %`),
      });
      onDone(blob.url);
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
