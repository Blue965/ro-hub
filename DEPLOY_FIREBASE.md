# Firebase quick steps (for Ro Hub)

1) In the Firebase console -> Project settings -> Add a Web App (if not already created).
   - Copy the firebaseConfig values and add them to Vercel as NEXT_PUBLIC_FIREBASE_* variables (and to .env.local for local dev).

2) In Firebase -> Authentication -> enable Email/Password (or Email Link) and Google providers.
   - For Google you may need to configure OAuth consent / credentials in Google Cloud and add the redirect URI.

3) In Firebase -> Firestore -> Create database (select location).

4) In Firebase -> Storage -> create the default bucket (usually <projectId>.appspot.com).

5) Service account (for server-side API routes):
   - Firebase Console -> Project Settings -> Service accounts -> Generate new private key
   - Copy the JSON contents. In Vercel add a new Environment Variable named FIREBASE_SERVICE_ACCOUNT and paste the entire JSON string as the value (mark as secret).

6) Add the NEXT_PUBLIC_* vars in Vercel project settings (Environment Variables). Add FIREBASE_SERVICE_ACCOUNT as a secret (Server only).

7) Deploy on Vercel and test local: cd frontend && npm install && npm run dev

Note: do NOT commit service account JSON or any secrets to the repository. If you accidentally pushed keys publicly, rotate them immediately.
