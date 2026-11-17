// Session de démo pour Playwright : un cookie Auth.js signé avec le secret de la DÉMO.
// Il n'ouvre que le serveur de démo (npm run demo:serveur) : le site en ligne utilise
// un autre secret et un autre identifiant d'administratrice, il le refuse.
import { encode } from "next-auth/jwt";
import { DEMO_ADMIN_ID, DEMO_BASE, DEMO_SECRET } from "./env-demo.mjs";

export { DEMO_BASE };

/** Ajoute la session de démo à un contexte Playwright (browser.newContext()). */
export async function connecterDemo(context) {
  const token = await encode({
    token: { name: "Clara Bernadou", githubId: DEMO_ADMIN_ID, sub: DEMO_ADMIN_ID },
    secret: DEMO_SECRET,
    maxAge: 8 * 3600,
  });
  await context.addCookies([{ name: "next-auth.session-token", value: token, url: DEMO_BASE, httpOnly: true }]);
  // Masque l'indicateur de développement de Next.js (bulle « N » en bas à gauche) sur les captures.
  await context.addInitScript(() => {
    const style = () => {
      const s = document.createElement("style");
      s.textContent = "nextjs-portal { display: none !important; }";
      document.head.appendChild(s);
    };
    if (document.head) style();
    else document.addEventListener("DOMContentLoaded", style);
  });
}
