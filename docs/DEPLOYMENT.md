# Deployment Guide

RepoPulse AI deploys as **two independent services**:

| App      | Platform | Root folder |
|----------|----------|-------------|
| Frontend | [Vercel](https://vercel.com) | `client/` |
| Backend  | [Render](https://render.com) | `server/` |

---

## 1. Backend on Render

### Create the service

1. New → **Web Service**
2. Connect the GitHub repo `RepoPulse-AI`
3. Settings:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`

Optional: use the root `render.yaml` Blueprint instead of manual setup.

### Environment variables (Render → Environment)

| Variable         | Required | Example |
|------------------|----------|---------|---------|
| `NODE_ENV`       | yes      | `production` |
| `PORT`           | yes*     | Render sets this automatically — do not hardcode conflicting values |
| `CLIENT_URL`     | yes      | `https://your-app.vercel.app` |
| `MONGODB_URI`    | yes      | Atlas URI with `/repopulse` path |
| `GITHUB_TOKEN`   | yes      | Fine-grained or classic PAT |
| `GEMINI_API_KEY` | recommended | Google AI Studio key |
| `EXTRA_CORS_ORIGINS` | no  | Extra Vercel preview URLs (comma-separated) |
| `GEMINI_MODEL`   | no       | `gemini-2.5-pro` |

\* Render injects `PORT`. The app reads `process.env.PORT`.

### Verify

```bash
curl https://<your-service>.onrender.com/api/health
```

Expect `"success": true` and `"message": "RepoPulse API Running"`.

---

## 2. Frontend on Vercel

### Create the project

1. Import the same GitHub repo in Vercel
2. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

`client/vercel.json` rewrites all routes to `index.html` so React Router works on refresh.

### Environment variables (Vercel → Settings → Environment Variables)

| Variable        | Required | Example |
|-----------------|----------|---------|
| `VITE_API_URL`  | yes      | `https://<your-service>.onrender.com/api` |

Redeploy after changing env vars (Vite embeds them at **build** time).

### CORS checklist

After both URLs exist:

1. Set Render `CLIENT_URL` to the production Vercel URL (no trailing slash).
2. If you use preview deployments, add them to `EXTRA_CORS_ORIGINS`.
3. Confirm the browser Network tab shows analyze requests succeeding (not CORS blocked).

---

## 3. MongoDB Atlas

1. Create a cluster and database user
2. Network Access → allow Render IPs (or `0.0.0.0/0` for demos)
3. Connection string must include a DB name, e.g. `/repopulse`
4. Paste into Render `MONGODB_URI` only — never into git

---

## 4. Local production smoke test

```bash
# Backend
cd server
npm start

# Frontend production build
cd client
npm run build
npm run preview
```

Set `client/.env` `VITE_API_URL` to your local or remote API before building.
