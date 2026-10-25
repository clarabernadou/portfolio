"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProfile } from "@/app/admin/(espace)/profil/actions";
import type { SiteProfile } from "@/lib/data-shared";
import { TextArea, TextField } from "./fields";
import { RestoreBanner, SaveBar, useDraft } from "./SaveBar";
import { useToast } from "./Toast";
import { Icon } from "./icons";
import { IaPage } from "./AvisIA";

// Maquette : docs/passation/maquettes/admin/Admin-profil-cv.jpg (colonne de gauche).
export function ProfileForm({ initial }: { initial: SiteProfile }) {
  const router = useRouter();
  const toast = useToast();
  const draft = useDraft<SiteProfile>("admin-profil", initial);
  const p = draft.value;
  const set = <K extends keyof SiteProfile>(k: K, v: SiteProfile[K]) => draft.setValue({ ...p, [k]: v });
  const [version, setVersion] = useState<"essentiel" | "complet">("essentiel");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      setError(null);
      const r = await saveProfile(p);
      if (!r.ok) {
        if (r.session) return router.push("/admin/connexion?expire=1&callbackUrl=/admin/profil");
        return setError(r.error);
      }
      draft.markSaved(p);
      toast({ message: "Profil enregistré." });
      router.refresh();
    });

  return (
    <IaPage page={"Profil de Clara : en-tête du CV, accueil et pied de page du portfolio"} infos={[`Intitulé : ${p.intitule}`, `Disponibilité : ${p.contrat} · ${p.disponibilite}`, `Lieu : ${p.lieu}`, `Texte de profil du CV : ${p.profilEssentiel}`].join("\n")}>
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <RestoreBanner show={!!draft.restorable} onRestore={draft.restore} onDismiss={draft.dismiss} />
      <section className="adm-card" aria-labelledby="p-identite">
        <h2 className="adm-h2" id="p-identite">Identité</h2>
        <div className="adm-grid-2">
          <TextField label="Nom" required value={p.nom} onChange={(v) => set("nom", v)} />
          <TextField ia label="Intitulé" value={p.intitule} onChange={(v) => set("intitule", v)} />
          <TextField label="Contrat recherché" value={p.contrat} onChange={(v) => set("contrat", v)} placeholder="CDI" />
          <TextField label="Disponibilité" value={p.disponibilite} onChange={(v) => set("disponibilite", v)} placeholder="disponible en mars 2027" help={`Affiché : « ${[p.contrat, p.disponibilite].filter(Boolean).join(" · ")} »`} />
          <TextField label="Lieu et télétravail" value={p.lieu} onChange={(v) => set("lieu", v)} help="Vannes et Auray deviennent des liens vers leur carte." />
          <TextField label="Mobilité" value={p.mobilite} onChange={(v) => set("mobilite", v)} />
          <TextField label="E-mail de contact" type="email" value={p.email} onChange={(v) => set("email", v)} />
          <TextField label="Téléphone" type="tel" value={p.telephone} onChange={(v) => set("telephone", v)} />
          <TextField label="LinkedIn" type="url" value={p.linkedin} onChange={(v) => set("linkedin", v)} />
          <TextField label="GitHub" type="url" value={p.github} onChange={(v) => set("github", v)} />
        </div>
        <TextField label="Disponibilités d’entretien" value={p.entretiens} onChange={(v) => set("entretiens", v)} help="Phrase reprise dans le pied de page du site." />
        <TextField ia label="Accroche de l’accueil" value={p.accroche} onChange={(v) => set("accroche", v)} />
        <TextField label="Texte alternatif de la photo" value={p.photoAlt} onChange={(v) => set("photoAlt", v)} help="Lu par les lecteurs d’écran à la place de la photo du CV." />
      </section>

      <section className="adm-card" aria-labelledby="p-profil">
        <h2 className="adm-h2" id="p-profil">Profil du CV</h2>
        <div role="group" aria-label="Version du profil" style={{ display: "inline-flex", alignSelf: "flex-start", padding: 4, borderRadius: 999, background: "var(--brume)", border: "1px solid var(--bordure)" }}>
          {(["essentiel", "complet"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={version === v} onClick={() => setVersion(v)} className="adm-btn" style={{ minHeight: 40, border: 0, background: version === v ? "var(--amethyste)" : "transparent", color: version === v ? "var(--fond)" : "var(--encre)" }}>
              {v === "essentiel" ? "Essentiel" : "Complet"}
            </button>
          ))}
        </div>
        {version === "essentiel" ? (
          <TextArea label="Profil · version essentielle" value={p.profilEssentiel} onChange={(v) => set("profilEssentiel", v)} rows={4} />
        ) : (
          <TextArea label="Profil · version complète" value={p.profilComplet} onChange={(v) => set("profilComplet", v)} rows={6} />
        )}
      </section>

      <section className="adm-card" aria-labelledby="p-ia">
        <h2 className="adm-h2" id="p-ia">Ce que l’IA doit savoir sur moi</h2>
        <TextArea
          ia={false}
          label="Profil pour l’avis de l’IA"
          value={p.noteIA ?? ""}
          onChange={(v) => set("noteIA", v)}
          rows={16}
          help="Privé : jamais affiché sur le site. Envoyé à Gemini avec chaque demande d’avis de l’IA, pour qu’il te connaisse. Pas d’information sensible (téléphone, adresse, clients, chiffres internes)."
        />
      </section>

      <section className="adm-card" aria-labelledby="p-langues">
        <h2 className="adm-h2" id="p-langues">Langues</h2>
        {p.langues.map((l, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "180px minmax(0,1fr) auto", gap: 10, alignItems: "start" }}>
            <input className="adm-input" aria-label={`Langue ${i + 1}`} value={l.nom} onChange={(e) => set("langues", p.langues.map((x, k) => (k === i ? { ...x, nom: e.target.value } : x)))} />
            <textarea className="adm-textarea" style={{ minHeight: 44 }} aria-label={`Niveau en ${l.nom || `langue ${i + 1}`} (une ligne par compétence)`} value={l.niveau.join("\n")} onChange={(e) => set("langues", p.langues.map((x, k) => (k === i ? { ...x, niveau: e.target.value.split("\n") } : x)))} />
            <button type="button" className="adm-icon-btn adm-icon-btn--danger" aria-label={`Retirer ${l.nom || `la langue ${i + 1}`}`} onClick={() => set("langues", p.langues.filter((_, k) => k !== i))}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
        <span className="adm-help">Une ligne par niveau (« Lecture et écrit : C1 », puis « Compréhension orale : bonne »…).</span>
        <button type="button" className="adm-btn adm-btn--link" style={{ alignSelf: "center" }} onClick={() => set("langues", [...p.langues, { nom: "", niveau: [""] }])}>
          <Icon name="plus" />
          Ajouter une langue
        </button>
      </section>

      <SaveBar dirty={draft.dirty} error={error}>
        {draft.dirty && (
          <button type="button" className="adm-btn adm-btn--link" onClick={draft.reset}>
            Annuler
          </button>
        )}
        <button type="button" className="adm-btn" disabled={pending || !draft.dirty} onClick={save}>
          Enregistrer
        </button>
      </SaveBar>
    </div>
    </IaPage>
  );
}
