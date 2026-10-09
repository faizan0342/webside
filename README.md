# Industrial Flow

An admin-managed flow meter catalog built with React, Express, and MongoDB.

## Run locally

1. Configure `backend/.env` using `backend/.env.example` and start MongoDB.
2. Configure `frontend/.env` using `frontend/.env.example`.
3. Run `npm install`, then `npm run install:all` from the project root.
4. For a new database, run `npm run seed`. This creates starter content and sets the administrator password from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Existing homepage and settings are preserved.
5. Run `npm run dev`. Open `http://localhost:5173`.

Admin login: `http://localhost:5173/admin/login`.

- Settings: website name, logo, favicon, footer text, and contact information. Remove the uploaded logo to use the built-in Industrial Flow logo.
- Homepage: hero text/image, promotion text/image, and about copy.
- Products / Categories: catalog text and images. Confirm product specifications, prices, and stock before publishing.

`backend/src/migrate-industrial.js` converts the original furniture starter content and saved homepage to industrial copy. It preserves images and backs up content to `backend/backups`. Run it once from the backend folder; running again reapplies the industrial homepage text and clears the custom logo.