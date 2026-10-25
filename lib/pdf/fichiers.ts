// Fichiers publics : le site renvoie vers eux (bouton « Télécharger le CV », pied de page).
// Version anglaise retirée du site (décision de Clara, 24 oct. 2026) : seul le CV français est public.
// Module à part : la route publique /media/cv n'embarque pas Chromium (lib/pdf/server.ts).
export const FICHIERS_PUBLICS = ["CV_Clara_Bernadou_FR.pdf"];
