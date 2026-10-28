# Portfolio de Clara Bernadou

Portfolio et CV de Clara Bernadou, développeuse front-end & UI/UX designer, avec une administration sur mesure.

**Site en ligne** : https://clarabernadou.fr

Projet personnel mené seule, de la charte graphique à la mise en ligne, avec Claude Code comme assistant de développement.

## Fonctionnalités

**Site public**
- Accueil, liste filtrable de 39 projets avec fiches détaillées, CV en ligne et page consacrée à mon usage de l'IA.
- Livrables PDF ouverts à la bonne page, vidéos YouTube chargées seulement au clic (`youtube-nocookie.com`), aucun cookie déposé chez les visiteurs.
- CV téléchargeable en PDF, généré à partir des mêmes données que la page.

**Administration** (réservée à mon compte GitHub)
- Projets, catégories, formations, expériences, compétences, profil et page IA modifiables sans toucher au code.
- Génération des CV en PDF, dont des CV d'une page orientés selon le poste visé, avec aperçu A4 et contrôle du remplissage.
- Synchronisation GitHub : les nouveaux dépôts sont détectés chaque jour et peuvent devenir des fiches projet.
- Envoi de livrables (PDF, images) vers Vercel Blob.

## Stack

| Domaine | Technologies |
|---|---|
| Front-end | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Données | Prisma, MySQL (TiDB Cloud) |
| Authentification | Auth.js (OAuth GitHub), compte administrateur identifié par son identifiant GitHub numérique |
| PDF | Playwright en local, Chromium serverless sur Vercel |
| Hébergement | Vercel (fonctions, Cron, Blob) |
| Tests | Vitest, Playwright, axe-core |

## Qualité et accessibilité

- Tests unitaires (Vitest) et scénarios de bout en bout (Playwright) sur l'administration : protection des routes, projets, contenus, CV, synchronisation.
- Accessibilité contrôlée avec axe-core et Lighthouse : 0 erreur axe et score Lighthouse accessibilité de 100 sur les pages principales mesurées.
- Focus visible, cibles de 44 px, navigation au clavier du menu, des filtres et de la fenêtre modale.
- Sécurité : aucun secret dans le dépôt, routes `/admin/*` et API d'écriture protégées côté serveur, en-têtes de sécurité, tâche planifiée protégée par un secret.

## Lancer le projet

```bash
npm install
npm run dev
```

Sans base de données, le site public fonctionne avec les données de repli du dépôt (`data/`, `lib/content/`). Les variables d'environnement nécessaires à l'administration (base, OAuth GitHub, Blob) sont décrites dans [docs/variables-environnement.md](docs/variables-environnement.md).

Scripts utiles : `npm run test` (tests unitaires), `npm run build`, `npm run db:migrate`, `npm run db:seed`.

## Contact

- LinkedIn : https://www.linkedin.com/in/clarabernadou/
- GitHub : https://github.com/clarabernadou
