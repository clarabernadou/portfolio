// Construit le site sur la base de DÉMONSTRATION puis le lance (next start), pour les tests de bout
// en bout des pages générées au build (fiches projet). Fonctionne à côté de « npm run dev », qui
// travaille dans .next/dev ; refaire ensuite « npm run build » pour retrouver le build du vrai site.
// Usage : DEMO_PORT=3200 node scripts/demo/build-demo.mjs
import { spawn, spawnSync } from "node:child_process";
import { DEMO_PORT, demoEnv } from "./env-demo.mjs";

const env = demoEnv();
const b = spawnSync("npx", ["next", "build"], { stdio: "inherit", env });
if (b.status !== 0) process.exit(b.status ?? 1);
console.log(`Site de démo construit : http://localhost:${DEMO_PORT}`);
const child = spawn("npx", ["next", "start", "-p", String(DEMO_PORT)], { stdio: "inherit", env });
child.on("exit", (code) => process.exit(code ?? 0));
