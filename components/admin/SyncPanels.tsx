"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { runGithubSync, saveSyncSettings, syncGithubSiAncienne } from "@/app/admin/(espace)/synchronisation/actions";
import type { SyncSettings } from "@/lib/admin/sync";
import { Toggle } from "./fields";
import { useToast } from "./Toast";
import { Icon } from "./icons";

// Passage automatique de la synchronisation GitHub à l'ouverture de l'administration.
export function SyncOnOpen() {
  const router = useRouter();
  const toast = useToast();
  const fait = useRef(false);
  useEffect(() => {
    if (fait.current) return;
    fait.current = true;
    syncGithubSiAncienne().then((n) => {
      if (n > 0) {
        toast({ message: `${n} ${n > 1 ? "nouveaux projets importés" : "nouveau projet importé"} depuis GitHub.` });
        router.refresh();
      }
    });
  }, [router, toast]);
  return null;
}

export function GithubPanel({ settings, depuis, repos }: { settings: SyncSettings["github"]; depuis: string; repos: { id: number; name: string; url: string; description: string }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const reglage = (patch: Partial<SyncSettings["github"]>) => start(async () => (await saveSyncSettings({ github: patch }), router.refresh()));
  const lancer = (ids?: number[]) =>
    start(async () => {
      const r = await runGithubSync(ids);
      if (r.error) return setMsg(r.error);
      const parts = [
        r.baseline !== undefined ? `${r.baseline} dépôts existants pris comme référence` : "",
        r.created.length ? `${r.created.length} créé(s) : ${r.created.join(", ")}` : "",
        r.updated.length ? `${r.updated.length} mis à jour` : "",
        r.skipped.length ? `${r.skipped.length} avec des champs conservés (corrigés à la main)` : "",
      ].filter(Boolean);
      setMsg(parts.length ? parts.join(" · ") : "Rien de nouveau sur GitHub.");
      toast({ message: "Synchronisation GitHub terminée." });
      router.refresh();
    });

  return (
    <section className="adm-card" aria-labelledby="s-github">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span className="adm-avatar" aria-hidden="true" style={{ background: "var(--brume)", color: "var(--amethyste)" }}>
          GH
        </span>
        <div style={{ flex: 1 }}>
          <h2 className="adm-h2" id="s-github">GitHub</h2>
          <span className="adm-help">Projets</span>
        </div>
        <span className="adm-badge adm-badge--publie">Connecté</span>
      </div>
      <p style={{ margin: 0, fontSize: 15 }}>
        <b>Dernière synchronisation</b> · {depuis}
        <small className="adm-help" style={{ display: "block" }}>
          À l’ouverture du tableau de bord, puis une fois par jour.
        </small>
      </p>
      <Toggle label="Créer un projet pour chaque dépôt public" help="Nom, description, langages, lien et date" checked={settings.createProjects} onChange={(v) => reglage({ createProjects: v })} />
      <Toggle label="Ignorer les forks" checked={settings.ignoreForks} onChange={(v) => reglage({ ignoreForks: v })} />
      <Toggle label="Ignorer les dépôts archivés ou vides" checked={settings.ignoreArchivedEmpty} onChange={(v) => reglage({ ignoreArchivedEmpty: v })} />
      <Toggle label="Publier automatiquement" help="Visible sur le site tout de suite" checked={settings.autoPublish} onChange={(v) => reglage({ autoPublish: v })} />
      <Toggle label="Masquer un dépôt sans description" help="Il est créé, mais reste masqué tant qu’il n’a pas de description" checked={settings.hideWithoutDescription} onChange={(v) => reglage({ hideWithoutDescription: v })} />
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" className="adm-btn adm-btn--outline" disabled={pending} onClick={() => lancer()}>
          {pending ? "Synchronisation…" : "Synchroniser maintenant"}
        </button>
        <a className="adm-btn adm-btn--link" href="https://github.com/clarabernadou?tab=repositories" target="_blank" rel="noopener noreferrer">
          Voir les dépôts sur GitHub
        </a>
      </div>
      {msg && (
        <p className="adm-help" role="status" style={{ margin: 0 }}>
          {msg}
        </p>
      )}
      {repos.length > 0 && (
        <details>
          <summary style={{ cursor: "pointer", fontWeight: 700, minHeight: 44, display: "flex", alignItems: "center" }}>
            {repos.length} dépôts publics existants sans projet (importables un par un)
          </summary>
          <ul className="adm-list">
            {repos.map((r) => (
              <li key={r.id}>
                <span style={{ minWidth: 0 }}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>
                    {r.name}
                  </a>
                  <small className="adm-muted" style={{ display: "block", whiteSpace: "normal" }}>
                    {r.description || "Sans description"}
                  </small>
                </span>
                <button type="button" className="adm-btn adm-btn--link" disabled={pending} onClick={() => lancer([r.id])}>
                  Importer
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
