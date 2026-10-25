# Variables d'environnement

À mettre dans `.env.local` à la racine du dépôt (fichier ignoré par Git), et dans Vercel → Settings → Environment Variables pour le site en ligne. Ne jamais coller ces valeurs dans une conversation ni les commiter.

Ce fichier tient lieu de `.env.example` : les règles de `.claude/settings.json` interdisent à Claude Code d'écrire dans un fichier `.env*`. Pour avoir aussi un `.env.example`, copie le bloc ci-dessous dans ce fichier toi-même (le `.gitignore` l'autorise déjà).

```
# Base MySQL TiDB Cloud (étape 8) : mysql://UTILISATEUR:MOT_DE_PASSE@HOTE:4000/portfolio
DATABASE_URL=

# Auth.js (étape 8)
# Adresse du site : http://localhost:3000 en local, l'adresse du site en ligne sur Vercel
NEXTAUTH_URL=
# Chaîne aléatoire, à générer avec : openssl rand -base64 32
NEXTAUTH_SECRET=

# Application OAuth GitHub (étape 8)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Identifiant numérique GitHub du seul compte autorisé (data/liens.json, profil.githubId)
ADMIN_GITHUB_ID=92588607

# Synchronisation GitHub, jeton en lecture seule (étape 11)
GITHUB_SYNC_TOKEN=
```
