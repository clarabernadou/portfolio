// Lance le site en local sur la base de DÉMONSTRATION (données fictives), port 3100.
// Usage : npm run demo:donnees (une fois), puis npm run demo:serveur.
// Arrêter d'abord « npm run dev » s'il tourne : Next.js refuse deux serveurs de développement
// dans le même dossier.
import { spawn } from "node:child_process";
import { DEMO_PORT, demoEnv } from "./env-demo.mjs";

const env = demoEnv();
console.log(`Mode démo : base « ${new URL(env.DATABASE_URL).pathname.slice(1)} », http://localhost:${DEMO_PORT}/admin`);
console.log("Connexion : npm run demo:captures (session de démo signée avec un secret propre à la démo).");
const child = spawn("npx", ["next", "dev", "-p", String(DEMO_PORT)], { stdio: "inherit", env });
child.on("exit", (code) => process.exit(code ?? 0));
