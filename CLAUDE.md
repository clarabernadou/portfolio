# Portfolio de Clara Bernadou · règles du projet

Ce fichier est lu par Claude Code à chaque session. Il reste court : le détail est dans `docs/passation/`.

## Le projet
Portfolio et CV de recherche d'emploi (CDI, développeuse front-end & UI/UX designer, disponible en mars 2027), avec une administration et une synchronisation LinkedIn / GitHub. Le site est en français.

## Sources de vérité, dans cet ordre
1. `docs/passation/maquettes/` : l'apparence validée. En cas de doute, la capture fait foi.
2. `docs/passation/contenu/` : le texte exact de chaque page. Le copier, ne jamais le réécrire.
3. `docs/passation/README-claude-code.md` : routes, composants, règles de design, accessibilité, responsive.
4. `docs/passation/ADMIN-et-SYNCHRONISATION.md` : administration, connexion, synchronisation, critères de réception.
5. `docs/passation/assets/projects.json` et `docs/passation/data/*.json` : les données.

## Stack
Next.js (App Router) et TypeScript, Tailwind CSS (`tokens.css` et `tailwind.config.js` fournis), base MySQL gratuite (TiDB Cloud, ou Aiven en secours) avec Prisma, Auth.js avec GitHub (plan B : Google), Playwright pour les PDF du CV. Hébergement gratuit sur Vercel (usage personnel). Décisions validées par Clara ; ne pas les remettre en question sans lui en parler.

## Règles de contenu
- Ne rien inventer : aucun texte, chiffre, lien ni projet qui ne figure pas dans `contenu/` ou dans les données. En cas de manque, poser la question.
- Ne jamais publier le contenu des skills de l'équipe.
- Pas de version anglaise du CV, ni sur le site ni dans l'administration (décision du 24 octobre 2026).
- Les chiffres s'écrivent en chiffres dans les textes.

## Règles de design
- Portage exact (décision d'octobre 2026) : les pages sont générées depuis `docs/passation/prototype-source/` (`scripts/tools/gen.mjs`) et leurs styles en ligne sont recopiés tels quels avec `css()` (`lib/css.ts`). Pas de preflight Tailwind. Toute modification de style passe d'abord par la source du prototype.
- Couleurs, polices, rayons : uniquement les variables de `tokens.css`. Jamais de valeur codée en dur.
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

## Responsive
- Aucun plafond de largeur sur les paragraphes d'introduction ; `text-wrap: pretty` sur les paragraphes, `balance` sur les titres de niveau 2 et 3.
- Aucun texte tronqué : ni `line-clamp`, ni points de suspension.
- Points de rupture : 900 px (burger), 760 px (frise des formations), 640 px (panneau design system masqué).
- Vérifier à 1440, 1024, 768 et 390 px avant de déclarer une page terminée.

## Sécurité
- Dépôt public : github.com/clarabernadou/portfolio (depuis le 25 octobre 2026, sans l'ancien historique). Les documents internes (`docs/passation/`, `docs/audit/`, rapports) restent en local et sont ignorés par Git ; l'ancien dépôt privé est le remote `archive`. Ne jamais y publier de données personnelles de tiers, ni la version complète du CV, ni le téléphone ailleurs que dans le PDF.
- Aucun secret dans le code ni dans le dépôt : tout va dans `.env.local` (ignoré par Git), avec un `.env.example` sans valeurs.
- Le compte administrateur est identifié par son identifiant numérique GitHub (variable `ADMIN_GITHUB_ID`), jamais par le nom d'utilisateur ou l'e-mail.
- Toutes les routes `/admin/*` et toutes les API d'écriture sont protégées côté serveur.
- Les vidéos YouTube se chargent seulement après un clic (`youtube-nocookie.com`). Aucun cookie pour les visiteurs.

## Méthode de travail
- Une étape à la fois, dans l'ordre de `docs/passation/DEMARRAGE-CLAUDE-CODE.md`. Par défaut, ne pas commencer l'étape suivante sans validation de Clara. Si elle lance le mode autonome (`docs/passation/LANCEMENT-AUTONOME.md`), enchaîner les étapes sans validation intermédiaire, avec vérification et rapport, et s'arrêter seulement dans les cas d'arrêt listés dans ce fichier.
- Une branche et des commits courts par étape. Lancer les vérifications avant de dire qu'une étape est terminée, et donner les preuves (captures, sorties de tests).
- Demander avant : d'ajouter une dépendance importante, de changer l'architecture, de modifier un texte validé, de supprimer des données.
- Mettre à jour ce fichier quand une décision durable est prise.
