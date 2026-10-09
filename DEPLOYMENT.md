# Publish Industrial Flow on GitHub and Vercel

This repository deploys as two Vercel projects: `frontend` and `backend`.

## 1. Create an online database

Create a MongoDB Atlas account and cluster. Create a database user and configure network access for your Vercel backend. Copy the application connection string. Keep it in Vercel environment variables, never in GitHub.

Your existing local database is `oak-aura`. To transfer its content, install MongoDB Database Tools and run these commands in PowerShell, entering the Atlas URI when prompted:

```powershell
mongodump --uri="mongodb://127.0.0.1:27017/oak-aura" --out="D:\mateen\backend\backups\atlas-migration"
$atlasUri = Read-Host 'Atlas connection URI (include database oak-aura)'
mongorestore --uri=$atlasUri "D:\mateen\backend\backups\atlas-migration"
```

Use an empty Atlas database to avoid conflicts. The backups directory is excluded from GitHub and deployments. Existing referenced upload images are bundled under `backend/public/uploads`; new uploads are stored in MongoDB.

## 2. Deploy the backend

Vercel dashboard → Add New → Project → import `faizan0342/webside`.

- Project name: `industrial-flow-api`
- Root Directory: `backend`
- Framework: Express
- Node.js: 24.x
- Environment variables:
  - `MONGODB_URI`: Atlas connection string with database name `oak-aura`
  - `JWT_SECRET`: a long randomly generated secret
  - `CLIENT_URL`: the exact frontend URL (set after creating the frontend project)
  - Optional email features: `SMTP_USER`, `SMTP_PASS`, `OWNER_EMAIL`

Deploy. Record the backend URL. Open `<backend-url>/api/health`; it should return `{"status":"ok"}`. Disable Vercel deployment protection for the production API if it requires a Vercel login, since storefront visitors must reach it.

## 3. Deploy the frontend

Import the same repository again.

- Project name: `industrial-flow`
- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment variable `VITE_API_URL`: backend URL, e.g. `https://industrial-flow-api.vercel.app` (no `/api` suffix)

Deploy. Set the backend's `CLIENT_URL` to the actual frontend URL and redeploy the backend. If `VITE_API_URL` changes, redeploy the frontend too.

## 4. Admin and validation

Open `<frontend-url>/admin/login`. Database migration preserves your local administrator. Set a new password before making the deployment public. To reset via the seed script, use the Atlas URI and your chosen `ADMIN_EMAIL` / `ADMIN_PASSWORD` in the local backend environment, then run `npm run seed`. Existing homepage/settings are preserved. Restore the local environment afterward if you want to use local MongoDB.

Check homepage, catalog, admin login, and upload/save a test image from Settings or Homepage. New image uploads accept PNG, JPEG, WebP, and GIF, up to 3 MB each.

Pushes to the connected GitHub branch trigger Vercel deployments.