# Ro Hub

Ro Hub — un hub open-source pour scripts et ressources Roblox.

Stack
- Frontend: Next.js (TypeScript) + TailwindCSS
- Backend: Supabase (Auth, Postgres, Storage, Edge Functions)

Fonctionnalités MVP
- Auth (email/magic link + Google via Supabase)
- Créer un projet (titre, description, licence, tags)
- Upload de versions (.lua, .txt) vers Supabase Storage
- Page publique par projet (README, versions, download)
- Star basique

Setup rapide
1) Crée un projet Supabase et note:
   - URL (SUPABASE_URL)
   - ANON KEY (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - SERVICE ROLE KEY (SUPABASE_SERVICE_ROLE_KEY) — stocke en sécurité

2) Active Google provider dans Supabase Auth et récupère GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET

3) Crée un bucket `projects` dans Supabase Storage (public ou privé selon préférence)

4) Clone le repo et install:

   git clone https://github.com/Blue965/ro-hub.git
   cd ro-hub/frontend
   npm install

5) Copie `.env.example` en `.env.local` et remplis les variables.

6) Lancer en local:
   npm run dev

Déploiement
- Déployer frontend sur Vercel: ajoute les variables d'environnement (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_CLIENT_ID/SECRET)

Roblox account linking
- Placeholder dans le projet pour lier un compte Roblox. Deux options:
  - OAuth Roblox (si tu obtiens client id/secret)
  - Proof code: l'utilisateur ajoute un code court à sa bio/profil pour prouver la possession

Contribuer
- Tu peux ouvrir des PRs sur ce repo. Le code est MIT.

