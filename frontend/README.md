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

Default **`railway.json`** uses the **`Dockerfile`**: Node runs `npm ci` and `vite build` inside Linux, then serves `dist` with `node scripts/serve.cjs`. This avoids Railpack/`npm ci` failures on their Node builder.

- **Variables:** Do **not** add `DATABASE_URL` / `JWT_SECRET` to the frontend service. Optionally set **`VITE_API_URL`** (full API base, e.g. `https://your-backend.up.railway.app/api`). In Railway, mark it as available at **Docker build** time if you use a custom URL (Dockerfile passes it as a build arg).
- **Public URL:** Enable **Networking → Generate domain** if the service shows as unexposed.
- If the UI still sets an old **Start Command** (e.g. `npm start`), remove it so the image **`CMD`** is used, or set it to `node scripts/serve.cjs`.

### Deploy only a pre-built `dist` folder (no Vite on Railway)

1. Locally: `npm ci && npm run build`.
2. Either commit `dist/` (`dist` is gitignored — use `git add -f dist` if you really want it in git), **or** deploy `dist` with a static host (Netlify / Cloudflare Pages / Vercel) by pointing the publish directory to `dist`.
3. For Railway with a committed `dist`, set **`dockerfilePath`** to **`Dockerfile.static`** in `railway.json` (or swap filenames), then redeploy.
