import Link from "next/link";

// Élément introuvable dans l'administration (projet supprimé, adresse erronée) :
// on reste dans l'administration.
export default function AdminNotFound() {
  return (
    <div className="adm-card" style={{ maxWidth: 640 }}>
      <h1 className="adm-h1" style={{ fontSize: 28 }}>
        Introuvable
      </h1>
      <p className="adm-sub" style={{ margin: 0 }}>
        Cet élément n’existe pas ou a été supprimé.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Link className="adm-btn" href="/admin">
          Retour au tableau de bord
        </Link>
        <Link className="adm-btn adm-btn--outline" href="/admin/projets">
          Voir les projets
        </Link>
      </div>
    </div>
  );
}
