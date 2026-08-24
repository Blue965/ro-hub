## Deploying Ro Hub (detailed)

This guide walks you through creating the Supabase project, configuring auth providers, applying DB schema and RLS policies, and deploying the frontend to Vercel.

1) Create Supabase project
- Go to https://app.supabase.com and create a new project.
- Note the Project URL and Project API keys:
  - SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY (anon key)
  - SUPABASE_SERVICE_ROLE_KEY (service role key) — keep secret

2) Apply SQL schema
- Open Supabase dashboard → SQL editor.
- Run the SQL in db/schema.sql, db/roblox_links.sql and db/policies.sql in that order.

3) Create storage bucket
- Storage → Create bucket → name: projects
- For MVP you can set public, but it's safer to keep private and use signed download URLs.

4) Configure Auth providers (Google)
- Authentication → Providers → Google → Add credentials from Google Cloud Console.
- Add the OAuth redirect URI as documented by Supabase (example: `https://<YOUR_SUPABASE_URL>/auth/v1/callback`)

5) Environment variables
- Frontend (.env.local) - copy .env.example and fill values.
- On Vercel (or other host) set the same env vars in the project settings (make sure SUPABASE_SERVICE_ROLE_KEY is only used in server-side functions).

6) Run locally
- cd frontend
- npm install
- npm run dev

7) Deploy to Vercel
- Create a new Vercel project and link your GitHub repo Blue965/ro-hub
- Add environment variables in Vercel project settings (same as .env.local)
- Deploy

Notes
- Never expose SUPABASE_SERVICE_ROLE_KEY in client code or public repos.
- The API routes in `/pages/api` use this key server-side to create versions, register files, and generate signed URLs.

