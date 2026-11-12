// Fichier public : le site renvoie vers lui (bouton « Télécharger le CV », pied de page).
// Depuis le 12 nov. 2026, le CV public est le PDF que Clara envoie depuis l'administration
// (sa version synthétisée), et non plus un PDF généré depuis la base.
// Module à part : la route publique /media/cv n'embarque pas Chromium (lib/pdf/server.ts).
export const CV_PUBLIC = "CV_Clara_Bernadou_Developpeuse_Full_Stack.pdf";
export const FICHIERS_PUBLICS = [CV_PUBLIC];
// Anciennes adresses (CV mis en page et CV texte générés, jusqu'au 12 nov. 2026) : elles ont pu être
// envoyées dans des candidatures ou indexées, elles redirigent vers le CV public.
export const ANCIENS_CV = ["CV_Clara_Bernadou_FR.pdf", "CV_Clara_Bernadou_FR_texte.pdf"];
// Taille maximale du PDF envoyé (colonne MediumBlob : 16 Mo ; limite des actions serveur : 3 Mo).
export const CV_TAILLE_MAX = 2.5 * 1024 * 1024;
