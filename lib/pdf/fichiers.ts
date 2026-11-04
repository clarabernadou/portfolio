// Fichiers publics : le site renvoie vers eux (bouton « Télécharger le CV », pied de page).
// Version anglaise retirée du site (décision de Clara, 24 oct. 2026) : seul le CV français est public.
// Module à part : la route publique /media/cv n'embarque pas Chromium (lib/pdf/server.ts).
// CV texte simple (4 nov. 2026) : même contenu, une colonne, pour les logiciels de tri des candidatures.
export const CV_MIS_EN_PAGE = "CV_Clara_Bernadou_FR.pdf";
export const CV_TEXTE = "CV_Clara_Bernadou_FR_texte.pdf";
export const FICHIERS_PUBLICS = [CV_MIS_EN_PAGE, CV_TEXTE];
