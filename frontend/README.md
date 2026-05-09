# Team Task Manager — Frontend

React (Vite) UI for the team task manager. It talks to the backend API (configure `VITE_API_URL` in `.env`; see `.env.example`).

## Scripts

- `npm install` — install dependencies
- `npm run dev` — local dev server (default http://localhost:5173)
- `npm run build` — production build
- `npm run preview` — preview production build

## Stack

- React 19, Vite, React Router
- Axios for API calls

## Deploy on Railway (this repo)

- **Build:** `npm ci && npm run build` (also set in `railway.json`).
- **Start:** `npm start` serves the `dist` folder on `PORT` (see `scripts/serve.cjs`).
- **Variables:** This app is static after build. You do **not** need `DATABASE_URL` / `JWT_SECRET` here. Set **`VITE_API_URL`** to your backend base URL including `/api` (for example `https://<your-backend>.up.railway.app/api`) so the bundle is built with the correct API. Redeploy the frontend after changing it.
