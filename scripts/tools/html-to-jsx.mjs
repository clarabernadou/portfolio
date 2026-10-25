// Convertit un fragment des sources du prototype (docs/passation/prototype-source)
// en JSX, en recopiant chaque attribut style à l'identique via css("…").
// Les gabarits {{x}}, <sc-if> et <sc-for> deviennent des expressions sur l'objet v
// (équivalent du renderVals() de la source) ou sur la variable de boucle.
// Usage : node scripts/tools/html-to-jsx.mjs <fichier> <début> <fin> [--from-index n]
import fs from "node:fs";

const VOID = new Set(["img", "br", "hr", "input", "meta", "link", "source", "wbr"]);
const ATTR = {
  class: "className", for: "htmlFor", tabindex: "tabIndex", "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin", "fill-rule": "fillRule",
  "clip-rule": "clipRule", "stop-color": "stopColor", allowfullscreen: "allowFullScreen",
  referrerpolicy: "referrerPolicy", hreflang: "hrefLang", srcset: "srcSet", colspan: "colSpan",
  readonly: "readOnly", maxlength: "maxLength", autoplay: "autoPlay", "xml:space": "xmlSpace",
  "xlink:href": "xlinkHref", "stroke-dasharray": "strokeDasharray", "stroke-miterlimit": "strokeMiterlimit",
};

export function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function tokenize(html) {
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:="[^"]*")?)*)\s*(\/?)>|[^<]+/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith("<!--")) continue;
    if (m[1]) out.push({ t: "close", name: m[1].toLowerCase() });
    else if (m[2]) {
      const attrs = [];
      const ar = /([^\s=]+)(?:="([^"]*)")?/g;
      let a;
      while ((a = ar.exec(m[3] || ""))) attrs.push([a[1], a[2] === undefined ? null : a[2]]);
      out.push({ t: "open", name: m[2].toLowerCase(), attrs, self: !!m[4] });
    } else out.push({ t: "text", v: m[0] });
  }
  return out;
}

function tree(tokens) {
  const root = { name: "#root", children: [] };
  const stack = [root];
  for (const tk of tokens) {
    const top = stack[stack.length - 1];
    if (tk.t === "text") top.children.push({ text: tk.v });
    else if (tk.t === "open") {
      const el = { name: tk.name, attrs: tk.attrs, children: [] };
      top.children.push(el);
      if (!tk.self && !VOID.has(tk.name)) stack.push(el);
    } else {
      // ferme jusqu'à l'élément correspondant (tolère les fermetures implicites)
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].name === tk.name) { stack.length = i; break; }
      }
    }
  }
  return root;
}

function exprOf(raw, loops) {
  const e = raw.trim();
  if (/^(true|false|\d+)$/.test(e)) return e;
  const root = e.split(/[.[]/)[0];
  return loops.includes(root) ? e : `v.${e}`;
}

// "texte {{a}} suite" -> JS : `texte ${v.a} suite`
function tpl(value, loops) {
  const parts = decode(value).split(/\{\{([^}]+)\}\}/);
  if (parts.length === 3 && parts[0] === "" && parts[2] === "") return exprOf(parts[1], loops);
  let s = "`";
  parts.forEach((p, i) => {
    s += i % 2 ? "${" + exprOf(p, loops) + "}" : p.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  });
  return s + "`";
}

// Liens internes du prototype -> routes du site
const ROUTES = { accueil: "/", projets: "/projets", cv: "/cv", ia: "/ia", mentions: "/mentions-legales" };
export function route(href) {
  const m = /^(?:Ecran|Mobile)-([a-z0-9-]+)\.dc\.html(#.*)?$/.exec(href);
  if (!m) return href;
  const id = m[1];
  const base = id.startsWith("projet-") ? `/projets/${id.slice(7)}` : ROUTES[id];
  if (!base) throw new Error("route inconnue : " + href);
  return base + (m[2] || "");
}

function attrJsx(name, value, loops) {
  if (name.startsWith("hint-")) return null;
  const jname = ATTR[name] || name;
  if (value === null) return jname;
  if (name === "href" && !value.includes("{{")) value = route(decode(value));
  if (name === "style") {
    const v = tpl(value, loops);
    return `style={css(${v.startsWith("`") ? v : JSON.stringify(decode(value))})}`;
  }
  if (value.includes("{{")) return `${jname}={${tpl(value, loops)}}`;
  return `${jname}={${JSON.stringify(decode(value))}}`;
}

function textJsx(raw, loops) {
  const collapsed = raw.replace(/\s+/g, " ");
  if (collapsed === "") return "";
  const parts = collapsed.split(/\{\{([^}]+)\}\}/);
  return parts
    // le moteur de maquette enveloppe chaque valeur dynamique dans un <span>
    .map((p, i) => (i % 2 ? `<span>{${exprOf(p, loops)}}</span>` : p === "" ? "" : `{${JSON.stringify(decode(p))}}`))
    .join("");
}

function render(node, loops, ind) {
  const pad = "  ".repeat(ind);
  if (node.text !== undefined) {
    const t = textJsx(node.text, loops);
    return t ? pad + t : "";
  }
  if (node.name === "sc-if") {
    const val = node.attrs.find(([k]) => k === "value")[1];
    const inner = node.children.map((c) => render(c, loops, ind + 2)).filter(Boolean).join("\n");
    return `${pad}{${tpl(val, loops)} && (\n${pad}  <>\n${inner}\n${pad}  </>\n${pad})}`;
  }
  if (node.name === "sc-for") {
    const list = node.attrs.find(([k]) => k === "list")[1];
    const as = node.attrs.find(([k]) => k === "as")[1];
    const idx = `i_${as}`;
    const inner = node.children.map((c) => render(c, [...loops, as, idx], ind + 2)).filter(Boolean).join("\n");
    return `${pad}{${tpl(list, loops)}.map((${as}: any, ${idx}: number) => (\n${pad}  <Fragment key={${idx}}>\n${inner}\n${pad}  </Fragment>\n${pad}))}`;
  }
  const attrs = node.attrs.map(([k, v]) => attrJsx(k, v, loops)).filter(Boolean);
  const href = node.attrs.find(([k]) => k === "href");
  const internal = node.name === "a" && href && href[1] && route(decode(href[1])).startsWith("/");
  const tag = internal ? "Link" : node.name;
  const open = `${pad}<${tag}${attrs.length ? " " + attrs.join(" ") : ""}`;
  if (VOID.has(node.name) || node.children.length === 0) return `${open} />`;
  const inner = node.children.map((c) => render(c, loops, ind + 1)).filter(Boolean).join("\n");
  return `${open}>\n${inner}\n${pad}</${tag}>`;
}

export function convert(html, ind = 2) {
  return tree(tokenize(html)).children.map((c) => render(c, [], ind)).filter(Boolean).join("\n");
}

if (process.argv[1] && process.argv[1].endsWith("html-to-jsx.mjs")) {
  const [file, start, end] = process.argv.slice(2);
  const src = fs.readFileSync(file, "utf8");
  const a = src.indexOf(start);
  const b = end ? src.indexOf(end, a + start.length) : src.length;
  if (a < 0 || b < 0) throw new Error("marqueurs introuvables");
  process.stdout.write(convert(src.slice(a, b)) + "\n");
}
