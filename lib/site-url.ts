// Adresse stable du site, utilisée pour metadataBase, le plan du site et
// robots.txt. VERCEL_URL n'est volontairement pas utilisé : c'est l'adresse
// propre à CHAQUE déploiement (ex. ...-3q17obeea-clara-ab07.vercel.app), pas
// une adresse stable — elle cassait les images de partage (RAPPORT-FIDELITE).
// NEXT_PUBLIC_SITE_URL prendra le relais quand un nom de domaine sera choisi
// (README §10).
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clarabernadou-portfolio-2026.vercel.app";
