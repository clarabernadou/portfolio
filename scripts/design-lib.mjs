// Bibliothèque partagée : extraction des mesures d'une page et comparaison avec les mesures du prototype.
export const EXTRACT_SRC = `(() => {
  const NORM = (s) => s.replace(/[\\u00a0\\u202f]/g, ' ').replace(/\\u2011/g, '-').replace(/\\s+/g, ' ').trim();
  const num = (v) => parseFloat(v) || 0;
  const R = (n) => Math.round(n * 10) / 10;
  const alpha = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return 0; const p = m[1].split(/[ ,\\/]+/).filter(Boolean); return p.length >= 4 ? parseFloat(p[3]) : 1; };
  const hasBg = (cs) => alpha(cs.backgroundColor) > 0.02 || (cs.backgroundImage && cs.backgroundImage !== 'none');
  const bw = (cs) => ['Top', 'Right', 'Bottom', 'Left'].map((s) => (cs['border' + s + 'Style'] === 'none' ? 0 : num(cs['border' + s + 'Width'])));
  const hasBorder = (cs) => bw(cs).some((w) => w > 0);
  const hasShadow = (cs) => cs.boxShadow && cs.boxShadow !== 'none';
  const deco = (cs) => hasBg(cs) || hasBorder(cs) || hasShadow(cs);
  const box = (e) => { const r = e.getBoundingClientRect(); return { x: R(r.left + scrollX), y: R(r.top + scrollY), w: R(r.width), h: R(r.height) }; };
  const boxStyle = (e) => { const cs = getComputedStyle(e); return {
    tag: e.tagName.toLowerCase(),
    bg: hasBg(cs) ? (cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 90) : cs.backgroundColor) : '',
    border: hasBorder(cs) ? bw(cs).join('/') + ' ' + cs.borderTopColor + ' ' + cs.borderTopStyle : '',
    radius: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join('/'),
    shadow: hasShadow(cs) ? cs.boxShadow.slice(0, 110) : '',
    padding: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '),
    box: box(e) }; };
  const visible = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width >= 2 && r.height >= 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05; };
  const SKIP = ['script','style','noscript','path','circle','rect','line','g','defs','use','polyline','polygon','ellipse'];
  const nodes = []; const decos = [];
  for (const e of document.body.querySelectorAll('*')) {
    const tag = e.tagName.toLowerCase();
    if (SKIP.includes(tag)) continue;
    if (tag !== 'svg' && e.closest('svg')) continue;
    if (!visible(e)) continue;
    const cs = getComputedStyle(e);
    const own = NORM([...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' '));
    if (own.length >= 2) {
      let b = e; while (b && b !== document.body && !deco(getComputedStyle(b))) b = b.parentElement;
      nodes.push({ kind: 'text', text: own.slice(0, 100), tag,
        style: { fontFamily: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, textTransform: cs.textTransform, textAlign: cs.textAlign, color: cs.color },
        box: box(e), container: b && b !== document.body ? boxStyle(b) : null });
    } else if (tag === 'img' || tag === 'svg') {
      const r = box(e); if (r.w < 8) continue;
      nodes.push({ kind: 'media', text: (e.getAttribute('alt') || e.getAttribute('aria-label') || (e.getAttribute('src') || '').split('/').pop() || 'svg').slice(0, 60), tag, style: {}, box: r, container: null });
    } else if (deco(cs)) {
      const r = box(e);
      if (e.children.length === 0 || r.w <= 48 || r.h <= 6) { const s = boxStyle(e); decos.push({ sig: [R(r.w), R(r.h), s.radius, s.bg, s.border].join('|'), box: r }); }
    }
  }
  return { w: innerWidth, scrollHeight: document.documentElement.scrollHeight, title: document.title, nodes, decos };
})()`;

const px = (v) => (v === 'normal' ? 0 : parseFloat(v) || 0);
const fs = (st) => px(st.fontSize);
const lh = (st) => (st.lineHeight === 'normal' ? 1.2 : px(st.lineHeight) / (fs(st) || 16));
const padArr = (p) => p.split(' ').map(px);

function indexNodes(nodes) {
  const seen = new Map(); const map = new Map();
  for (const n of nodes) { const base = n.kind + '|' + n.text; const i = (seen.get(base) || 0) + 1; seen.set(base, i); map.set(base + '#' + i, n); }
  return map;
}

export function compare(spec, live, vw) {
  const issues = [];
  const A = indexNodes(spec.nodes); const B = indexNodes(live.nodes);
  const tolW = (a) => Math.max(10, a * 0.06); const tolH = (a) => Math.max(8, a * 0.08);
  for (const [key, a] of A) {
    const b = B.get(key);
    const label = a.text.length > 60 ? a.text.slice(0, 57) + '…' : a.text;
    if (!b) { issues.push({ sev: 'manquant', label, detail: 'élément présent dans le prototype, introuvable sur le site' }); continue; }
    const d = [];
    if (a.kind === 'text') {
      const s = a.style, t = b.style;
      if (Math.abs(fs(s) - fs(t)) >= 0.75) d.push(`taille ${fs(s)}px → ${fs(t)}px`);
      if (s.fontWeight !== t.fontWeight) d.push(`graisse ${s.fontWeight} → ${t.fontWeight}`);
      if (s.fontFamily.toLowerCase() !== t.fontFamily.toLowerCase()) d.push(`police ${s.fontFamily} → ${t.fontFamily}`);
      if (s.color !== t.color) d.push(`couleur ${s.color} → ${t.color}`);
      if (Math.abs(lh(s) - lh(t)) > 0.08) d.push(`interligne ${lh(s).toFixed(2)} → ${lh(t).toFixed(2)}`);
      if (Math.abs(px(s.letterSpacing) - px(t.letterSpacing)) > 0.3) d.push(`espacement des lettres ${s.letterSpacing} → ${t.letterSpacing}`);
      if (s.textTransform !== t.textTransform) d.push(`casse ${s.textTransform} → ${t.textTransform}`);
    }
    if (Math.abs(a.box.w - b.box.w) > tolW(a.box.w)) d.push(`largeur ${a.box.w}px → ${b.box.w}px`);
    if (Math.abs(a.box.h - b.box.h) > tolH(a.box.h)) d.push(`hauteur ${a.box.h}px → ${b.box.h}px`);
    if (Math.abs(a.box.x - b.box.x) > Math.max(12, vw * 0.015)) d.push(`position horizontale ${a.box.x}px → ${b.box.x}px`);
    const ca = a.container, cb = b.container;
    if (ca && cb) {
      // marges réelles entre le texte et les bords de son encadré (détecte une pastille sans marge, un texte collé au bord)
      const ins = (n, c) => ({ L: n.box.x - c.box.x, T: n.box.y - c.box.y, R: c.box.x + c.box.w - (n.box.x + n.box.w), B: c.box.y + c.box.h - (n.box.y + n.box.h) });
      const ia = ins(a, ca), ib = ins(b, cb); const names = { L: 'gauche', T: 'haut', R: 'droite', B: 'bas' }; const bad = [];
      for (const k of ['L', 'T', 'R', 'B']) { if ((k === 'R' || k === 'B') && ia[k] > 40) continue; if (Math.abs(ia[k] - ib[k]) > 3.5) bad.push(`${names[k]} ${Math.round(ia[k])}px → ${Math.round(ib[k])}px`); }
      if (bad.length) d.push('marge entre le texte et le bord de son encadré : ' + bad.join(', '));
    }
    if (ca && !cb) d.push('encadré (fond, contour ou ombre) absent sur le site');
    else if (!ca && cb) d.push('encadré présent sur le site mais absent du prototype');
    else if (ca && cb) {
      if (ca.bg !== cb.bg) d.push(`fond ${ca.bg || 'aucun'} → ${cb.bg || 'aucun'}`);
      if (ca.border !== cb.border) d.push(`contour ${ca.border || 'aucun'} → ${cb.border || 'aucun'}`);
      if (ca.radius !== cb.radius && Math.abs(px(ca.radius.split('/')[0]) - px(cb.radius.split('/')[0])) >= 2) d.push(`rayon ${ca.radius.split('/')[0]} → ${cb.radius.split('/')[0]}`);
      if (!!ca.shadow !== !!cb.shadow) d.push(`ombre ${ca.shadow ? 'oui' : 'non'} → ${cb.shadow ? 'oui' : 'non'}`);
      const pa = padArr(ca.padding), pb = padArr(cb.padding);
      if (pa.some((v, i) => Math.abs(v - pb[i]) >= 3)) d.push(`marges intérieures ${ca.padding} → ${cb.padding}`);
      if (Math.abs(ca.box.w - cb.box.w) > tolW(ca.box.w)) d.push(`largeur de l'encadré ${ca.box.w}px → ${cb.box.w}px`);
      if (Math.abs(ca.box.h - cb.box.h) > tolH(ca.box.h)) d.push(`hauteur de l'encadré ${ca.box.h}px → ${cb.box.h}px`);
    }
    if (d.length) issues.push({ sev: 'écart', label, detail: d.join(' ; '), at: { y: b.box.y } });
  }
  // espacements entre éléments voisins d'un même encadré (titre, texte, étiquettes, boutons)
  const seq = (m) => [...m.entries()].filter(([, n]) => n.kind === 'text' && n.container);
  const cid = (c) => `${c.box.x}|${c.box.y}|${c.box.w}|${c.box.h}`;
  const gapOf = (p, q) => {
    const xo = Math.min(p.box.x + p.box.w, q.box.x + q.box.w) - Math.max(p.box.x, q.box.x);
    const yo = Math.min(p.box.y + p.box.h, q.box.y + q.box.h) - Math.max(p.box.y, q.box.y);
    if (yo > 2 && xo <= 2) return { t: 'h', v: q.box.x - (p.box.x + p.box.w) };
    if (xo > 2 && q.box.y >= p.box.y + p.box.h - 2) return { t: 'v', v: q.box.y - (p.box.y + p.box.h) };
    return null;
  };
  const gaps = (m) => { const out = new Map(); const arr = seq(m); for (let i = 0; i + 1 < arr.length; i++) { const [ka, na] = arr[i], [kb, nb] = arr[i + 1]; if (cid(na.container) !== cid(nb.container)) continue; const g = gapOf(na, nb); if (g) out.set(ka + ' ⇒ ' + kb, g); } return out; };
  const ga = gaps(A), gb = gaps(B);
  for (const [k, g] of ga) { const h = gb.get(k); if (!h || h.t !== g.t) continue; if (Math.abs(g.v - h.v) > 4) { const [ka, kb] = k.split(' ⇒ ').map((x) => x.split('|')[1].split('#')[0].slice(0, 32)); issues.push({ sev: 'espacement', label: `« ${ka} » et « ${kb} »`, detail: `espace ${g.t === 'h' ? 'horizontal' : 'vertical'} ${Math.round(g.v)}px → ${Math.round(h.v)}px` }); } }
  // encadrés manquants ou en nombre insuffisant (cartes, pastilles, panneaux)
  const sigs = (nodes) => { const seen = new Set(); const m = new Map(); for (const n of nodes) { const c = n.container; if (!c) continue; const id = c.tag + cid(c); if (seen.has(id)) continue; seen.add(id); const sg = [c.bg.slice(0, 40), c.border, c.radius.split('/')[0], c.shadow ? 'ombre' : ''].join(' · '); m.set(sg, (m.get(sg) || 0) + 1); } return m; };
  const sa = sigs(spec.nodes), sb = sigs(live.nodes);
  for (const [sg, n] of sa) { const m = sb.get(sg) || 0; if (m < n) issues.push({ sev: 'encadré', label: sg.replace(/ \· /g, ' · ') || 'encadré', detail: `${n} encadré(s) de ce style dans le prototype, ${m} sur le site` }); }
  const extra = []; for (const [key, b] of B) if (!A.has(key) && b.kind === 'text') extra.push(b.text.slice(0, 60));
  // petits éléments décoratifs (pastilles, traits, points de la chronologie) : comparaison par signature
  const count = (arr) => arr.reduce((m, d) => (m.set(d.sig, (m.get(d.sig) || 0) + 1), m), new Map());
  const da = count(spec.decos), db = count(live.decos);
  for (const [sig, n] of da) { const m = db.get(sig) || 0; if (m < n) issues.push({ sev: 'décor', label: sig.replace(/\|/g, ' · '), detail: `${n} dans le prototype, ${m} sur le site` }); }
  const hDiff = Math.abs(spec.scrollHeight - live.scrollHeight);
  if (hDiff > Math.max(120, spec.scrollHeight * 0.05)) issues.push({ sev: 'page', label: 'hauteur de la page', detail: `${spec.scrollHeight}px dans le prototype, ${live.scrollHeight}px sur le site` });
  return { issues, extra };
}
