"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/admin/icons";

// Erreur dans la mise en page de l'administration elle-même : on reste dans l'administration,
// avec la barre latérale, sans renvoyer vers le site public (demande de Clara).
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="adm-card" role="alert" style={{ maxWidth: 640, margin: "15vh auto", fontFamily: "var(--font-texte)" }}>
      <span style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--erreur)", fontWeight: 800 }}>
        <Icon name="warning" />
        Une erreur est survenue
      </span>
      <h1 className="adm-h1" style={{ fontSize: 28 }}>
        Cet écran n’a pas pu s’afficher
      </h1>
      <p className="adm-sub" style={{ margin: 0 }}>
        Tes données sont en sécurité : rien n’a été enregistré à moitié. Tu peux réessayer, ou revenir au tableau de bord.
        {digest ? ` Référence de l’erreur : ${digest}.` : ""}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button type="button" className="adm-btn" onClick={() => retry()}>
          Réessayer
        </button>
        <Link className="adm-btn adm-btn--outline" href="/admin">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
