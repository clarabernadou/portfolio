// Gabarit HTML des CV en PDF (étapes 5 et 10). Fonction pure, sans accès aux fichiers
// ni à la base : elle sert à la génération en ligne (Vercel) et à « npm run pdf ».
// CV validé par Clara : bandeau sombre, photo, deux pages.

export type Lien = { text: string; href?: string };

export interface CvDoc {
  lang: "fr" | "en";
  title: string;
  nom: string;
  role: string;
  pills: string[];
  contact: { email: string; telephone: string; telephoneAffiche: string; linkedin: string; github: string; site: string };
  profile: string;
  h: { skills: string; langs: string; exp: string; edu: string; projets: string };
  skills: { name: string; items: string[] }[];
  langs: { nom: string; niveau: string[] }[];
  exp: {
    d: string;
    r: string;
    co: Lien[];
    mt: string;
    desc: string;
    blocks: { name?: string; period?: string; bullets: string[] }[];
    nt?: string;
  }[];
  projets: { titre: string; href?: string; d: string; bullets: string[] }[];
  edu: { d: string; t: string; url?: string; tags: { text: string; kind: "ok" | "cours" | "info" }[]; mt: string; note?: string }[];
}

export interface CvAssets {
  manrope: string;
  bricolage: string;
  photo: string;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const lien = (l: Lien) => (l.href ? `<a href="${esc(l.href)}">${esc(l.text)}</a>` : esc(l.text));
const pretty = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const ICON = {
  web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  in: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 11v5M8 8v.01M12 16v-5M16 16v-3a2 2 0 0 0-4 0"/></svg>',
  gh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
};

const BASE_CSS = (a: CvAssets) => `
@font-face{font-family:'Manrope';src:url('${a.manrope}');font-weight:200 800}
@font-face{font-family:'Bricolage Grotesque';src:url('${a.bricolage}');font-weight:200 800}
*{box-sizing:border-box}html,body{margin:0}
body{font-family:'Manrope',sans-serif;font-variant-ligatures:none;font-feature-settings:'liga' 0,'clig' 0,'dlig' 0;color:#1A1033;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#FFFFFF}
a{color:inherit;text-decoration:none}
/* Logiciels de tri (ATS) : sans ligatures, « ff » et « tt » restent lisibles à l'extraction du texte ; les titres resserrés gardent un espace net entre les mots. */
.bri{font-family:'Bricolage Grotesque',sans-serif;font-variation-settings:'opsz' 96}
h1{margin:0;letter-spacing:-0.04em;word-spacing:0.12em;line-height:1}
h1 .l{font-weight:300}h1 .b{font-weight:800}
h3{margin:0;letter-spacing:.09em;text-transform:uppercase;color:#6A4FB6;font-weight:800}
.tags{display:flex;flex-wrap:wrap;gap:3pt}
.tags span{border-radius:4pt;border:0.75pt solid #B9A8EC;background:#FFFFFF;color:#6A4FB6;font-weight:700}
.tags span.i{border:0;background:#F3EFFF;color:#1A1033;font-weight:600}
ul{margin:4pt 0 0;padding-left:10pt}li::marker{color:#6A4FB6}
.co{font-weight:800;color:#6A4FB6}
.co a{text-decoration:underline;text-underline-offset:2pt;text-decoration-thickness:0.6pt}
.mt{color:#5B5470}
.st{padding:1pt 5pt;border-radius:4pt;font-weight:800}
.st.ok{background:#E7F6EE;color:#067647}.st.cours{background:#FFFFFF;border:0.75pt dashed #6A4FB6;color:#6A4FB6}.st.info{background:#F3EFFF;color:#1A1033;font-weight:700}
.us{font-weight:700;font-style:italic;color:#6A4FB6;margin-top:2pt}
`;

// Mise en page du CV : en-tête et profil sur toute la largeur, puis deux colonnes (choix de Clara, 28 oct. 2026).
const COMPLETE_CSS = `
@page{size:A4;margin:12mm 0}
@page:first{margin-top:0}
body{font-size:9.2pt;line-height:1.42}
.hd{background:linear-gradient(160deg,#1A1033 0%,#2E1065 100%);color:#FFFFFF;padding:10mm 13mm 0}
.top{display:flex;align-items:center;gap:16pt}
.ph{width:31mm;height:31mm;border-radius:50%;object-fit:cover;border:2.5pt solid #FFFFFF;box-shadow:0 0 0 1.5pt #C4B5FD;flex-shrink:0}
.id{flex:1;min-width:0}
h1{font-size:28pt}h1 .l{color:#C4B5FD}
.ti{font-size:11.5pt;font-weight:700;color:#C4B5FD;margin-top:4pt}
.pills{display:flex;flex-wrap:wrap;gap:4pt;margin-top:8pt}
.pills span{padding:2.5pt 8pt;border-radius:99pt;background:rgba(255,255,255,0.08);border:0.75pt solid rgba(196,181,253,0.45);font-size:7.8pt;font-weight:700}
.ct{display:grid;grid-template-columns:repeat(3,auto);justify-content:start;gap:6pt 22pt;margin-top:8mm;padding:7pt 0 8pt;border-top:0.75pt solid rgba(196,181,253,0.3);font-size:7.6pt}
.ct a{display:flex;align-items:center;gap:5pt;font-weight:700;white-space:nowrap}
.ct svg{width:9pt;height:9pt;flex-shrink:0;color:#C4B5FD}
.wrap{padding:0 13mm}
.pf{margin-top:12pt;background:#F3EFFF;border-left:2.5pt solid #6A4FB6;border-radius:6pt;padding:7pt 10pt;margin-bottom:14pt;font-size:9.2pt}
/* Deux colonnes : la principale (expériences, projet) d'abord dans le document, pour l'ordre de lecture des logiciels de tri ; la latérale (compétences, langues, formations) s'affiche à gauche. */
.cols{display:grid;grid-template-columns:50mm minmax(0,1fr);grid-template-areas:"aside main";column-gap:8mm;align-items:start}
.main{grid-area:main}
.aside{grid-area:aside;border-right:1pt solid #E4DCF7;padding-right:6mm}
h2{margin:0 0 7pt;font-size:13pt;font-weight:800;letter-spacing:-0.02em;word-spacing:0.06em;break-after:avoid-page}
h2.sec{border-bottom:1pt solid #E4DCF7;padding-bottom:4pt}
section{margin-bottom:13pt}
h3{font-size:7pt;margin-bottom:3pt}
.sk{margin-bottom:7pt;break-inside:avoid}
.tags span{padding:1.5pt 5pt;font-size:7.4pt}
.lgs{break-inside:avoid}.lg{margin-bottom:5pt;font-size:8.2pt;break-inside:avoid}.lg b{font-weight:800;display:block}.lg span{display:block;color:#5B5470;font-size:7.8pt;line-height:1.35}
.ex{padding:8pt 0 9pt;border-top:1pt solid #E4DCF7}
.ex:first-of-type{border-top:0;padding-top:1pt}
.eh{display:flex;justify-content:space-between;align-items:baseline;gap:8pt;break-after:avoid}
.d{font-size:8pt;font-weight:800;color:#6A4FB6;line-height:1.35;white-space:nowrap}
.r{font-weight:800;font-size:11pt;letter-spacing:-0.02em;word-spacing:0.06em;line-height:1.15}
.co{font-size:9.2pt;margin-top:4pt}
.mt{font-size:7.9pt;margin-top:2pt}
.ds{margin-top:6pt}
.bl{margin-top:7pt}.bl > div{break-after:avoid}li{break-inside:avoid}.bt{font-weight:800;font-size:9pt}.bd{font-size:7.8pt;font-weight:700;color:#5B5470;margin-left:5pt}
li{margin:0 0 2.5pt}
.nt{font-size:8pt;color:#5B5470;margin-top:4pt}
.fo{padding:6pt 0;border-top:1pt solid #E4DCF7;break-inside:avoid}
.fo:first-of-type{border-top:0;padding-top:0}
.fo .d{display:block;margin-bottom:1pt}
.ft{font-weight:800;font-size:9pt;letter-spacing:-0.01em;word-spacing:0.06em;line-height:1.25}
.ft a::after{content:'';display:inline-block;width:6pt;height:6pt;margin-left:3pt;vertical-align:1pt;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' fill='none' stroke='%236A4FB6' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 8 8 2M3.5 2H8v4.5'/%3E%3C/svg%3E") no-repeat center/contain}
.fo .tags{margin-top:3pt}
.fo .tags .st.ok,.fo .tags .st.info{border:0}
.st{font-size:6.8pt}
.fo .mt{font-size:7.5pt;line-height:1.35;margin-top:3pt}
.us{font-size:7.5pt;line-height:1.35}
`;

function header(c: CvDoc, a: CvAssets) {
  const [prenom, ...reste] = c.nom.split(" ");
  return `<header class="hd">
  <div class="top">
    <img class="ph" src="${a.photo}" alt="${esc(c.nom)}">
    <div class="id">
      <h1 class="bri"><span class="b">${esc(prenom)}</span> <span class="l">${esc(reste.join(" "))}</span></h1>
      <div class="ti">${esc(c.role)}</div>
      <div class="pills">${c.pills.map((p) => `<span>${esc(p)}</span>`).join("")}</div>
    </div>
  </div>
  <div class="ct">
    <a href="mailto:${esc(c.contact.email)}">${ICON.mail}${esc(c.contact.email)}&#160;</a>
    <a href="${esc(c.contact.telephone)}">${ICON.tel}${esc(c.contact.telephoneAffiche)}&#160;</a>
    <a href="${esc(c.contact.site)}">${ICON.web}${esc(pretty(c.contact.site))}&#160;</a>
    <a href="${esc(c.contact.linkedin)}">${ICON.in}${esc(pretty(c.contact.linkedin))}&#160;</a>
    <a href="${esc(c.contact.github)}">${ICON.gh}${esc(pretty(c.contact.github))}&#160;</a>
  </div>
</header>`;
}

function complete(c: CvDoc, a: CvAssets) {
  const entree = (d: string, titre: string, corps: string) => `<div class="ex"><div class="eh"><div class="r bri">${esc(titre)}</div><div class="d">${esc(d)}</div></div>${corps}</div>`;
  const puces = (l: string[]) => `<ul>${l.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
  return `${header(c, a)}
<div class="wrap">
<div class="pf">${esc(c.profile)}</div>
<div class="cols">
<div class="main">
<section><h2 class="bri sec">${esc(c.h.exp)}</h2>
${c.exp
  .map((e) =>
    entree(
      e.d,
      e.r,
      `<div class="co">${e.co.map(lien).join("")}</div>
  <div class="mt">${esc(e.mt)}</div>
  <div class="ds">${esc(e.desc)}</div>
  ${e.blocks.map((b) => `<div class="bl">${b.name ? `<div><span class="bt">${esc(b.name)}</span>${b.period ? `<span class="bd">${esc(b.period)}</span>` : ""}</div>` : ""}${puces(b.bullets)}</div>`).join("")}
  ${e.nt ? `<div class="nt">→ ${esc(e.nt)}</div>` : ""}`,
    ),
  )
  .join("")}
</section>
${
  c.projets.length
    ? `<section><h2 class="bri sec">${esc(c.h.projets)}</h2>
${c.projets.map((pj) => entree(pj.d, pj.titre, `${pj.href ? `<div class="co"><a href="${esc(pj.href)}">${esc(pretty(pj.href))}</a></div>` : ""}${puces(pj.bullets)}`)).join("")}
</section>`
    : ""
}
</div>
<div class="aside">
<section><h2 class="bri sec">${esc(c.h.skills)}</h2>
  ${c.skills.map((g) => `<div class="sk"><h3>${esc(g.name)}</h3><div class="tags">${g.items.map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>`).join("")}
</section>
<section class="lgs"><h2 class="bri sec">${esc(c.h.langs)}</h2>
  ${c.langs.map((l) => `<div class="lg"><b>${esc(l.nom)}</b>${l.niveau.map((s) => `<span>${esc(s)}</span>`).join("")}</div>`).join("")}
</section>
<section><h2 class="bri sec">${esc(c.h.edu)}</h2>
${c.edu
  .map(
    (f) => `<div class="fo"><span class="d">${esc(f.d)}</span>
  <div class="ft">${f.url ? `<a href="${esc(f.url)}">${esc(f.t)}</a>` : esc(f.t)}</div>
  <div class="tags">${f.tags.map((t) => `<span class="st ${t.kind}">${esc(t.text)}</span>`).join("")}</div>
  <div class="mt">${esc(f.mt)}</div>
  ${f.note ? `<div class="us">${esc(f.note)}</div>` : ""}
</div>`,
  )
  .join("")}
</section>
</div>
</div>
</div>`;
}

export function cvHtml(c: CvDoc, a: CvAssets): string {
  const css = BASE_CSS(a) + COMPLETE_CSS;
  const body = complete(c, a);
  return `<!doctype html><html lang="${c.lang}"><head><meta charset="utf-8"><title>${esc(c.title)}</title><style>${css}</style></head><body>${body}</body></html>`;
}
