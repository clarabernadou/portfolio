// Critère de réception n° 8 (ADMIN-et-SYNCHRONISATION.md, §7) : aucune route
// /admin/* ni API d'écriture n'est accessible sans session valide.
// Usage : npm run build && npm run start, puis npm run test:admin [-- --base URL]
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const base = process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : "http://localhost:3000";
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${label}`);
  if (!ok) failures++;
};

// 1. Contrôle du code : chaque page /admin (sauf la connexion) appelle requireAdmin,
//    chaque route /api/admin appelle adminApiGuard.
function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
for (const f of walk(path.join(ROOT, "app/admin")).filter((f) => f.endsWith("page.tsx"))) {
  const rel = path.relative(ROOT, f);
  if (rel.includes("connexion")) continue;
  check(readFileSync(f, "utf8").includes("requireAdmin()"), `${rel} vérifie la session côté serveur`);
}
const apiDir = path.join(ROOT, "app/api/admin");
const apiFiles = (() => {
  try {
    return walk(apiDir).filter((f) => f.endsWith("route.ts"));
  } catch {
    return [];
  }
})();
for (const f of apiFiles) {
  check(readFileSync(f, "utf8").includes("adminApiGuard("), `${path.relative(ROOT, f)} vérifie la session côté serveur`);
}

// Chaque action serveur (point d'entrée public) revérifie la session.
for (const f of walk(path.join(ROOT, "app/admin")).filter((f) => /\.tsx?$/.test(f))) {
  const src = readFileSync(f, "utf8");
  if (!/^["']use server["']/m.test(src)) continue;
  const fns = [...src.matchAll(/export async function (\w+)\([^)]*\)[^{]*\{([\s\S]*?)\n\}/g)];
  for (const [, name, body] of fns) {
    check(/requireAdmin\(\)|isAdminSession\(\)/.test(body.split("\n").slice(0, 4).join("\n")), `${path.relative(ROOT, f)} : ${name}() vérifie la session dès le début`);
  }
}

// 2. Contrôle en conditions réelles, sans session puis avec un faux jeton.
const pages = ["/admin", "/admin/projets", "/admin/inexistant"];
for (const p of pages) {
  const r = await fetch(base + p, { redirect: "manual" });
  const loc = r.headers.get("location") ?? "";
  check([307, 308].includes(r.status) && new URL(loc, base).pathname === "/admin/connexion", `${p} sans session → redirection vers /admin/connexion (${r.status})`);
  const forged = await fetch(base + p, { redirect: "manual", headers: { cookie: "next-auth.session-token=faux.jeton.signe" } });
  check([307, 308].includes(forged.status), `${p} avec un faux jeton → redirection (${forged.status})`);
}
for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
  const r = await fetch(base + "/api/admin/projets", { method, redirect: "manual" });
  check(r.status === 401, `${method} /api/admin/projets sans session → 401 (${r.status})`);
}
const login = await fetch(base + "/admin/connexion");
check(login.status === 200, `/admin/connexion reste accessible (${login.status})`);

console.log(failures ? `\n${failures} échec(s)` : "\nTous les contrôles passent.");
process.exit(failures ? 1 : 0);
