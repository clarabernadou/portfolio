// Adresse stable du site, utilisée pour metadataBase, le plan du site et
// robots.txt. VERCEL_URL n'est volontairement pas utilisé : c'est l'adresse
// propre à CHAQUE déploiement (ex. ...-3q17obeea-clara-ab07.vercel.app), pas
// une adresse stable — elle cassait les images de partage (RAPPORT-FIDELITE).
// Nom de domaine du site depuis le 28 octobre 2026 (NEXT_PUBLIC_SITE_URL dans Vercel ;
// cette valeur par défaut sert si la variable manque).
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clarabernadou.fr";
