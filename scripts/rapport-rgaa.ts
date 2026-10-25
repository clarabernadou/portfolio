// Rapport d'audit RGAA en PDF (charte du portfolio, PDF balisé) et grille CSV, depuis
// data/rgaa-audit.json : npx tsx scripts/rapport-rgaa.ts [--publier]
// Sortie dans docs/audit/ (ignoré par Git). --publier envoie le PDF sur Vercel Blob
// (BLOB_READ_WRITE_TOKEN de .env.local) et affiche son adresse, à reporter dans
// RAPPORT_PDF (lib/accessibilite.ts).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
try {
  process.loadEnvFile(".env.local");
} catch {
  // Pas de .env.local : pas de publication possible.
}

const { criteres, compte, dateAudit, ECHANTILLON, nonConformes, referentiel, taux } = await import("../lib/accessibilite");
const { loadAssets, renderPdf } = await import("../lib/pdf/server");
const { siteUrl } = await import("../lib/site-url");

const NOM = "Rapport_audit_accessibilite_RGAA_Clara_Bernadou.pdf";
const OUT = path.join(process.cwd(), "docs/audit");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const dateFr = new Date(`${dateAudit}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const tauxFr = String(taux).replace(".", ",");
const site = siteUrl.replace(/^https?:\/\//, "");

// Correction recommandée pour chaque critère encore non conforme.
const A_FAIRE: Record<string, string> = {
  "4.1": "Ajouter sous chaque film une transcription (bloc dépliable ou lien adjacent) reprenant la voix off et les textes affichés à l’écran.",
  "4.3": "Publier sur YouTube des sous-titres relus, en anglais et si possible en français, à partir du script validé.",
  "4.5": "Visionner les films ; si des textes affichés ne sont pas dits par la voix off, les intégrer à la transcription (4.1).",
  "13.3": "Dérogation pour charge disproportionnée déclarée : le contenu est résumé sur chaque fiche projet et une version accessible est fournie sur demande.",
};
const LIBELLE = { C: "Conforme", NC: "Non conforme", NA: "Non applicable" } as const;

const themes = [...new Set(criteres.map((c) => c.theme))];
const corriges = criteres.filter((c) => c.constat.startsWith("Corrigé"));

const html = (a: { manrope: string; bricolage: string }) => `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Rapport d’audit d’accessibilité (RGAA) · Clara Bernadou</title>
<style>
@font-face{font-family:'Manrope';src:url('${a.manrope}');font-weight:200 800}
@font-face{font-family:'Bricolage Grotesque';src:url('${a.bricolage}');font-weight:200 800}
@page{size:A4;margin:16mm 15mm 18mm}
*{box-sizing:border-box}
body{margin:0;font-family:'Manrope',sans-serif;color:#1A1033;font-size:10.5pt;line-height:1.5}
h1,h2,h3{font-family:'Bricolage Grotesque',sans-serif;font-variation-settings:'opsz' 96;letter-spacing:-0.03em;margin:0}
h1{font-size:34pt;line-height:1;font-weight:800}
h1 span,h2 span{font-weight:300;color:#6A4FB6}
h2{font-size:20pt;font-weight:800;margin:0 0 10px}
h3{font-size:13pt;font-weight:800;margin:14px 0 6px}
p{margin:0 0 8px}
a{color:#6A4FB6}
.couv{display:flex;flex-direction:column;gap:14px;padding:22px 24px;border-radius:18px;background:linear-gradient(135deg,#F3EFFF 0%,#E9E2FB 100%);margin-bottom:18px}
.sur{font-size:9pt;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#5B5470}
.chiffres{display:flex;gap:10px}
.chiffres div{flex:1;background:#FFFFFF;border-radius:14px;padding:12px 14px}
.chiffres b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:24pt;font-weight:800;color:#6A4FB6;line-height:1.1}
.etat{font-size:12pt;font-weight:800}
section{margin-bottom:18px}
ul{margin:0 0 8px;padding-left:18px}li{margin-bottom:4px}
.nc{border:1px solid #E4DCF7;border-left:4px solid #B42318;border-radius:12px;padding:10px 14px;margin-bottom:8px;break-inside:avoid}
.nc p{margin:4px 0 0}
table{width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:6px;break-inside:avoid}
caption{text-align:left;font-family:'Bricolage Grotesque',sans-serif;font-size:13pt;font-weight:800;padding:10px 0 6px}
th{text-align:left;background:#F3EFFF;color:#1A1033;padding:6px 8px;font-weight:800}
td{padding:6px 8px;border-top:1px solid #E4DCF7;vertical-align:top}
tr{break-inside:avoid}
td.n{white-space:nowrap;font-weight:800;width:38px}
td.s{width:92px}
.st{display:inline-block;padding:2px 7px;border-radius:6px;font-weight:800;font-size:8pt;white-space:nowrap}
.st-C{background:#E7F6EE;color:#067647}.st-NC{background:#FDECEC;color:#B42318}.st-NA{background:#F3EFFF;color:#5B5470}
.petit{color:#5B5470;font-size:9pt}
.saut{break-before:page}
</style></head><body>
<header class="couv">
  <span class="sur">Audit d’accessibilité · ${esc(referentiel)}</span>
  <h1>Rapport <span>d’audit</span></h1>
  <p>Portfolio de Clara Bernadou · ${esc(site)}<br>Audit interne du ${dateFr}</p>
  <div class="chiffres">
    <div><b>${tauxFr} %</b>de critères respectés</div>
    <div><b>${compte("C")}</b>critères conformes</div>
    <div><b>${compte("NC")}</b>non conformes</div>
    <div><b>${compte("NA")}</b>non applicables</div>
  </div>
  <p class="etat">État de conformité : partiellement conforme</p>
</header>

<section>
  <h2>Synthèse</h2>
  <p>Le taux de conformité se calcule sur les critères applicables : ${compte("C")} critères conformes sur ${compte("C") + compte("NC")}. Un premier passage a relevé 14 non-conformités ; ${corriges.length} ont été corrigées le jour même, et les corrections ont été vérifiées de nouveau.</p>
  <p>Ce site personnel n’est pas soumis à l’obligation légale d’accessibilité : cet audit est volontaire.</p>
</section>

<section>
  <h2>Non-conformités <span>restantes</span></h2>
  ${nonConformes
    .map(
      (c) => `<div class="nc"><h3 style="margin:0">Critère ${c.n} · ${esc(c.theme)}</h3><p class="petit">${esc(c.titre)}</p><p><b>Constat (${esc(c.pages)}) :</b> ${esc(c.constat)}</p><p><b>Action :</b> ${esc(A_FAIRE[c.n] ?? "")}</p></div>`,
    )
    .join("")}
</section>

<section>
  <h2>Corrections <span>apportées</span></h2>
  <ul>${corriges.map((c) => `<li><b>${c.n}</b> ${esc(c.constat.replace(/^Corrigé : /, ""))}</li>`).join("")}</ul>
</section>

<section>
  <h2>Méthode</h2>
  <h3>Pages vérifiées</h3>
  <ul>${ECHANTILLON.map((p) => `<li>${esc(p.label)}${p.href ? ` (${esc(p.href)})` : ""}</li>`).join("")}<li>Pages ajoutées après l’audit et vérifiées avec les mêmes outils : Accessibilité, Plan du site</li></ul>
  <h3>Environnement et outils</h3>
  <ul>
    <li>Navigateur Chromium (Playwright) sur macOS, à 1440, 390 et 320 pixels de large.</li>
    <li>Tests automatiques : axe-core (règles WCAG 2.1 A et AA) et validateur HTML Nu.</li>
    <li>Vérifications manuelles : lecture du code, parcours au clavier, affichage sans styles, contrastes mesurés, analyse des PDF téléchargeables.</li>
  </ul>
  <h3>Limites</h3>
  <ul>
    <li>Aucun test avec un lecteur d’écran : les critères qui en dépendent ont été évalués sur les rôles, noms et attributs calculés.</li>
    <li>Les films n’ont pas été visionnés pour les critères 4.5 et 13.7.</li>
  </ul>
</section>

<section class="saut">
  <h2>Grille <span>des 106 critères</span></h2>
  ${themes
    .map(
      (t) => `<table><caption>${esc(t)}</caption><thead><tr><th scope="col">N°</th><th scope="col">Critère et constat</th><th scope="col">Statut</th></tr></thead><tbody>${criteres
        .filter((c) => c.theme === t)
        .map(
          (c) => `<tr><td class="n">${c.n}</td><td>${esc(c.titre)}<br><span class="petit">${esc(c.constat)}</span></td><td class="s"><span class="st st-${c.statut}">${LIBELLE[c.statut]}</span></td></tr>`,
        )
        .join("")}</tbody></table>`,
    )
    .join("")}
</section>
</body></html>`;

const assets = await loadAssets();
const { pdf, pages } = await renderPdf(html(assets));
await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, NOM), pdf);
const csv = [
  "Critère;Thématique;Intitulé;Statut;Pages;Constat",
  ...criteres.map((c) => [c.n, c.theme, c.titre, LIBELLE[c.statut], c.pages, c.constat].map((v) => `"${v.replace(/"/g, '""')}"`).join(";")),
].join("\n");
await writeFile(path.join(OUT, "Grille_RGAA_Clara_Bernadou.csv"), "﻿" + csv);
console.log(`docs/audit/${NOM} (${pages} pages) et grille CSV générés.`);

if (process.argv.includes("--publier")) {
  const { put } = await import("@vercel/blob");
  const b = await put(`accessibilite/${NOM}`, pdf, { access: "public", contentType: "application/pdf", addRandomSuffix: false, allowOverwrite: true });
  console.log(`Publié : ${b.url}`);
}
process.exit(0);
