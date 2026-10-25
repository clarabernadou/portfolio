"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { removePhoto, uploadPhoto } from "@/app/admin/(espace)/profil/actions";
import { useToast } from "./Toast";
import { Icon } from "./icons";

// Photo du profil : image carrée, 800 px minimum (ADMIN-et-SYNCHRONISATION.md §4).
export function PhotoCard({ url, alt, custom }: { url: string; alt: string; custom: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const onFile = (file: File) => {
    setError(null);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.naturalWidth !== img.naturalHeight) return setError(`L’image n’est pas carrée (${img.naturalWidth} × ${img.naturalHeight} px).`);
      if (img.naturalWidth < 800) return setError(`L’image est trop petite (${img.naturalWidth} px) : 800 px minimum.`);
      const form = new FormData();
      form.append("photo", file);
      start(async () => {
        const r = await uploadPhoto(form);
        if (!r.ok) return setError(r.error);
        toast({ message: "Photo remplacée." });
        router.refresh();
      });
    };
    img.onerror = () => setError("Ce fichier n’est pas une image lisible.");
    img.src = URL.createObjectURL(file);
  };

  return (
    <section className="adm-card" aria-labelledby="p-photo">
      <h2 className="adm-h2" id="p-photo">Photo</h2>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} width={88} height={88} style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--halo)" }} />
        <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="adm-btn adm-btn--outline" disabled={pending} onClick={() => input.current?.click()}>
              <Icon name="upload" />
              Remplacer la photo
            </button>
            {custom && (
              <button type="button" className="adm-btn adm-btn--link" disabled={pending} onClick={() => window.confirm("Retirer la photo envoyée et revenir à la photo d’origine ?") && start(async () => (await removePhoto(), router.refresh()))}>
                Retirer
              </button>
            )}
          </span>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <span className="adm-help">Image carrée, 800 px minimum, 2 Mo au plus. Le texte alternatif se règle dans l’identité (« {alt} »).</span>
          {error && (
            <span className="adm-error" role="alert">
              {error}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
