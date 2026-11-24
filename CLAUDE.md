# Portfolio de Clara Bernadou · règles du projet

Ce fichier est lu par Claude Code à chaque session. Il reste court : le détail est dans `docs/passation/`.

## Le projet
Portfolio et CV de recherche d'emploi (CDI, développeuse full-stack, disponible en mars 2027 ; l'UI/UX est un point fort, pas le titre, depuis le 4 novembre 2026), avec une administration et une synchronisation LinkedIn / GitHub. Le site est en français.

## Sources de vérité, dans cet ordre
1. `docs/passation/maquettes/` : l'apparence validée. En cas de doute, la capture fait foi.
2. `docs/passation/contenu/` : le texte exact de chaque page. Le copier, ne jamais le réécrire.
3. `docs/passation/README-claude-code.md` : routes, composants, règles de design, accessibilité, responsive.
4. `docs/passation/ADMIN-et-SYNCHRONISATION.md` : administration, connexion, synchronisation, critères de réception.
5. `docs/passation/assets/projects.json` et `docs/passation/data/*.json` : les données.

## Stack
Next.js (App Router) et TypeScript, Tailwind CSS (`tokens.css` et `tailwind.config.js` fournis), base MySQL gratuite (TiDB Cloud, ou Aiven en secours) avec Prisma, Auth.js avec GitHub (plan B : Google), Playwright pour le rapport RGAA en PDF. Hébergement gratuit sur Vercel (usage personnel). Nom de domaine `clarabernadou.fr` (OVH, zone DNS chez OVH) depuis le 28 octobre 2026 ; l'adresse vercel.app redirige vers lui. Décisions validées par Clara ; ne pas les remettre en question sans lui en parler.
IA de l'administration (4 novembre 2026) : Gemini (offre gratuite) reste le bouton principal ; quand il échoue (souvent : erreurs 503 « high demand »), la solution de secours s'affiche d'emblée sous l'erreur : copier le prompt et ouvrir claude.ai, puis recoller la réponse. Pas d'API payante.

## Règles de contenu
- Ne rien inventer : aucun texte, chiffre, lien ni projet qui ne figure pas dans `contenu/` ou dans les données. En cas de manque, poser la question.
- Ne jamais publier le contenu des skills de l'équipe.
- Pas de version anglaise du CV, ni sur le site ni dans l'administration (décision du 24 octobre 2026).
- Les chiffres s'écrivent en chiffres dans les textes.
- Parcours « En entreprise » (ex-« Alternance · Fruggr », 26 octobre 2026) pour les projets menés en alternance. Accueil : 3 rangées de 3 cartes, dans l'ordre En entreprise, Développement, Design (9 projets au plus). Dans chaque rangée, comme pour les projets phares et « Tous les projets » : du plus récent au plus ancien (19 novembre 2026).
- Publication d'un projet (liste de l'administration) : Publié, Privé ou Brouillon. Un projet privé ou en brouillon n'apparaît nulle part sur le site public, et une rangée ou un filtre sans projet public est masqué. Projets de l'alternance (« En entreprise ») en privé depuis le 28 octobre 2026. Une fiche Privé reste Privé avec « Publier » comme avec « Enregistrer le brouillon », et le message suit le statut réel (« Fiche enregistrée, statut : Privé », « Projet publié. » seulement pour une fiche publique ; `lib/admin/statut-projet.ts`, 23 novembre 2026).
- Projet non publié (4 novembre 2026) : jamais un lien (`components/proto/LienProjet.tsx` : texte simple ou carte inerte avec « En cours de validation ») ; son adresse affiche une page « en cours de validation » en `noindex`, et l'aperçu quand Clara est connectée (`proxy.ts`). `npm run test:liens` vérifie qu'aucun lien interne ne mène à une 404 ni à un projet non publié.
- Nombres de projets (4 novembre 2026) : toujours les projets publiés, ceux de /projets (« En bref », lien de l'accueil, ligne de chaque formation). Le champ « projets » d'une formation est une mention facultative qui remplace le nombre (« Fin prévue en 2027 »).
- CV final de Clara (12 novembre 2026) : il fait foi pour tout le contenu du CV sur le site (intitulé, profil, Compétences IA, expériences, compétences, langues, projet personnel). Écriture « Full Stack » sans trait d'union, comme sur le CV : « Développeuse Full Stack JavaScript / TypeScript · UI/UX » (intitulé), « Développeuse Full Stack & UI/UX » (postes) ; « full stack » en minuscules dans les textes du CV et partout ailleurs sur le site, métadonnées comprises (13 novembre 2026 : titre de l'accueil, <title>, description, images de partage), sans trait d'union ni U+2011 (`white-space: nowrap` si besoin). `npm run test:cv` compare le CV PDF servi et les pages (intitulé, dates, anglais, nombre de skills).
- Une information n'entre dans un CV que si elle figure sur le CV du site (/cv) ou sur le CV PDF, et seulement sur celui où elle figure ; ni sur l'un ni sur l'autre : on ne la met pas (24 novembre 2026). Exemple : la puce des 27 pull requests du site WordPress, ajoutée puis retirée le même jour.
- Chiffres de l'audit RGAA dans les textes de la base : balise `{{audit-rgaa}}`, remplacée à l'affichage depuis `data/rgaa-audit.json` (`lib/accessibilite.ts`). Jamais de chiffre Lighthouse dans le CV.
- Page IA publiée ou non (23 novembre 2026) : interrupteur de l'administration (Page IA, champ `publiee` du singleton `ia`, publiée par défaut). Désactivée, /ia et son image de partage renvoient une 404, et le lien IA de l'en-tête (ordinateur et mobile), la section « L'IA, au quotidien » de l'accueil, le plan du site, le sitemap et le lien de l'échantillon de /accessibilite disparaissent (`getIaPubliee()`, `lib/data.ts`).
- Formations courtes et certifications (17 novembre 2026) : liste compacte sous les formations, dans la rubrique « Parcours » de l'accueil, une carte par organisme, en carrousel au-delà de 4 (20 novembre 2026) ; gérée dans l'administration (« Formations courtes », singleton `formationsCourtes`). Ni sur /ia, ni sur /cv, ni dans /projets. Une attestation de suivi n'est jamais présentée comme une certification : le type « Certification » est réservé aux examens.
- Mise en forme des textes longs (20 novembre 2026) : contexte d'un projet et retour d'expérience acceptent « - » en début de ligne (puces), **gras**, *italique* et lignes vides (paragraphes), rendus par `lib/texte-formate.tsx`, sans HTML ; `texteBrut()` pour les usages en texte simple (données structurées).
- Galerie des captures d'un projet (20 novembre 2026) : 2 lignes au plus ; au-delà, la dernière case est un collage des captures suivantes sous un voile sombre (« +N autres captures ») qui ouvre la visionneuse (`components/proto/CapturesSite.tsx`). Le rendu serveur montre toujours toutes les captures. Légende facultative par capture (23 novembre 2026, 160 caractères au plus, `lib/captures-legende.ts`) : sous l'image, dans un `figure role="figure"` dont l'`aria-label` reprend le `figcaption` (RGAA 1.9) ; jamais sur une image décorative ; le texte alternatif reste obligatoire.
- Retour de l'évaluateur (23 novembre 2026) : bloc distinct du retour d'expérience, sous lui sur la fiche (`components/proto/RetourEvaluateur.tsx`, `lib/evaluation.ts`) : mois de soutenance (40), points forts (600), axes d'amélioration (600, facultatif), remarque (400, facultatif), en 4 colonnes nullables de `Project` ; limites refusées à l'enregistrement. Affiché seulement si un champ est rempli, h2 puis un h3 par champ rempli, une ligne = un élément de liste dès 2 lignes, suivi de « D'après l'évaluation de soutenance OpenClassrooms, reformulée. ». `npm run test:evaluateur` teste sur la base de démo.
- Format des captures selon le ratio (24 novembre 2026) : dimensions lues dans l'en-tête de chaque image à la construction de la page, jamais en base (`lib/captures-dimensions.ts`). Ratio entre 0,6 et 2,2 : case recadrée habituelle ; plus de 2,2 : image entière sur toute la largeur de la grille, à sa hauteur naturelle ; moins de 0,6 : image entière sur 2 lignes. Fond Brume, jamais agrandie au-delà de sa taille native, ordre des captures conservé ; un bandeau pleine largeur ne compte pas dans les 2 lignes (`lib/captures-format.ts`).
- Sous-catégories des captures (17 novembre 2026) : champ facultatif « groupe » par capture (`lib/captures-groupes.ts`) ; filtres sur la fiche seulement à partir de 2 groupes, sinon galerie inchangée (`npm test` compare son HTML à la référence, `npm run test:captures` teste sur la base de démo).
- Un seul CV en PDF (12 novembre 2026) : le PDF synthétisé de Clara (`CV_Clara_Bernadou_Developpeuse_Full_Stack.pdf`), envoyé depuis l'administration (Profil et CV, « Remplacer le CV »), plus de génération ni de CV texte. Les anciennes adresses `CV_Clara_Bernadou_FR.pdf` et `_texte.pdf` redirigent vers lui (`lib/pdf/fichiers.ts`). La page /cv présente la version complète du CV.

## Règles de design
- Portage exact (décision d'octobre 2026) : les pages sont générées depuis `docs/passation/prototype-source/` (`scripts/tools/gen.mjs`) et leurs styles en ligne sont recopiés tels quels avec `css()` (`lib/css.ts`). Pas de preflight Tailwind. Toute modification de style passe d'abord par la source du prototype.
- Couleurs, polices, rayons : uniquement les variables de `tokens.css`. Jamais de valeur codée en dur.
- Images de partage (13 novembre 2026) : une par page (`opengraph-image.tsx` du dossier de la page, `lib/og.tsx`), avec un og:image:alt qui la décrit. Textes alternatifs : obligatoires dans l'administration, vides seulement pour une image cochée « décorative ».
- Liens : un lien n'existe que si le visiteur a une raison de cliquer. La flèche ↗ est réservée aux liens qui sortent du site.
- Pas de mode sombre utilisateur : le bloc `[data-theme="dark"]` de `tokens.css` reste inutilisé. Les zones sombres sont des sections à fond fixe (dégradé Encre vers Nuit).
- Boutons en pilule de 44 px minimum de haut ; vrais `<button>` et `<a>`, jamais un `div` cliquable.
- Étiquettes : contour violet pour une technologie, plein Brume pour une information, statuts Obtenu / En cours / En alternance.

## Typographie
- Les tailles de police viennent des mesures de `docs/passation/specs/` (échelle relevée d'un cran le 23 octobre 2026 : plus aucun texte sous 13 px). Ne jamais appliquer une autre échelle.
- Titres de section : le premier mot en graisse 800 et la suite en graisse 300 couleur Améthyste (Bricolage Grotesque variable, axe opsz 96), comme dans les maquettes.

## Accessibilité (non négociable)
- Contrastes vérifiés, focus visible (anneau de 3 px décalé), cibles de 44 px, `aria-label` sur les boutons-icônes, icônes décoratives masquées aux lecteurs d'écran.
- Menu burger, fenêtre modale et filtres utilisables au clavier. Une fenêtre modale bloque le défilement et rend le reste de la page inerte, avec focus piégé. La liste des projets annonce son statut (`aria-live`).
- Lighthouse accessibilité à 95 ou plus et zéro erreur axe sur chaque route publique.
- Audit RGAA 4.1.2 (25 octobre 2026) : la grille des 106 critères `data/rgaa-audit.json` alimente la page `/accessibilite` et le rapport PDF (`npx tsx scripts/rapport-rgaa.ts --publier`, sur Vercel Blob). Toute modification qui touche un critère met à jour la grille, puis le rapport.
- Listes visuelles (cartes, étiquettes) en `<ul role="list" className="liste-nue">` ; navigation par de vrais liens, jamais `router.push` sur un bouton ; zones sombres avec la classe `zone-sombre` (anneau de focus Lilas) ; un élément qui disparaît après une action rend le focus à un élément voisin.

## Responsive
- Aucun plafond de largeur sur les paragraphes (ni `max-width` en caractères) ; pas de `text-wrap: pretty`, qui coupait les lignes trop tôt (20 novembre 2026) ; `balance` seulement sur les titres de niveau 2 et 3.
- Largeur de contenu fluide (20 novembre 2026) : variables `--gutter` et `--container` de `app/globals.css` pour l'en-tête, les sections et le pied de page ; `npm run test:largeurs` vérifie l'absence de défilement horizontal de 320 à 2560 px.
- Aucun texte tronqué : ni `line-clamp`, ni points de suspension.
- Le pied de page touche toujours le bas : de l'écran quand la page est courte, de la page sinon. Jamais de bande blanche sous le pied de page (mise en page en colonne flexible sur 100dvh dans `app/layout.tsx`).
- Points de rupture : 1024 px (fiche projet : contexte à gauche, avancement puis compétences à droite, chaque carte à la hauteur de son contenu ; une liste de plus de 6 éléments passe en pleine largeur sous le contexte, en 2 colonnes dès 760 px ; en dessous de 1024 px, contexte, avancement puis compétences, 24 novembre 2026), 900 px (burger), 760 px (frise des formations), 640 px (panneau design system masqué).
- Vérifier à 1440, 1024, 768 et 390 px avant de déclarer une page terminée.

## Sécurité
- Fichiers de contenu (livrables, aperçus, lettres de recommandation) : dans Vercel Blob, envoyés depuis l'administration, jamais dans le dépôt (décision du 25 octobre 2026).
- Dépôt public : github.com/clarabernadou/portfolio (depuis le 25 octobre 2026, sans l'ancien historique). Les documents internes (`docs/passation/`, `docs/audit/`, rapports) restent en local et sont ignorés par Git ; l'ancien dépôt privé est le remote `archive`. Ne jamais y publier de données personnelles de tiers, ni la version complète du CV, ni le téléphone ailleurs que dans le PDF.
- Aucun secret dans le code ni dans le dépôt : tout va dans `.env.local` (ignoré par Git), avec un `.env.example` sans valeurs.
- Le compte administrateur est identifié par son identifiant numérique GitHub (variable `ADMIN_GITHUB_ID`), jamais par le nom d'utilisateur ou l'e-mail.
- Toutes les routes `/admin/*` et toutes les API d'écriture sont protégées côté serveur.
- En-têtes de sécurité dans `next.config.ts` (28 octobre 2026) : politique de sécurité du contenu (CSP) stricte, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy`, HSTS, sans `X-Powered-By`. Toute nouvelle ressource externe (police, image, vidéo, API appelée du navigateur) doit être ajoutée à la CSP, sinon le navigateur la bloque.
- Les vidéos YouTube se chargent seulement après un clic (`youtube-nocookie.com`). Aucun cookie pour les visiteurs.

## Méthode de travail
- Une étape à la fois, dans l'ordre de `docs/passation/DEMARRAGE-CLAUDE-CODE.md`. Par défaut, ne pas commencer l'étape suivante sans validation de Clara. Si elle lance le mode autonome (`docs/passation/LANCEMENT-AUTONOME.md`), enchaîner les étapes sans validation intermédiaire, avec vérification et rapport, et s'arrêter seulement dans les cas d'arrêt listés dans ce fichier.
- Une branche et des commits courts par étape. Lancer les vérifications avant de dire qu'une étape est terminée, et donner les preuves (captures, sorties de tests).
- Demander avant : d'ajouter une dépendance importante, de changer l'architecture, de modifier un texte validé, de supprimer des données.
- Mettre à jour ce fichier quand une décision durable est prise.
