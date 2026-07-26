# Production Verification Checklist

Use this list before calling the project portfolio-ready.

## Automated / local checks

- [ ] `npm --prefix server start` boots without crash
- [ ] `GET /api/health` returns `success: true`
- [ ] `npm --prefix client run build` succeeds
- [ ] `client/.env.example` and `server/.env.example` present (no secrets)
- [ ] Debug routes disabled when `NODE_ENV=production`

## Manual (requires your real secrets)

- [ ] `MONGODB_URI` is a real Atlas hostname (not a placeholder like `xxxxx`)
- [ ] History save / list / delete works against Atlas
- [ ] `GITHUB_TOKEN` authenticates (`authenticated: true` in non-prod debug, or analyze succeeds)
- [ ] `GEMINI_API_KEY` returns real insights (not “unavailable”)
- [ ] Dashboard charts render after analyze
- [ ] Dashboard is usable on mobile width
- [ ] Compare works with ≥ 2 saved analyses
- [ ] Vercel `VITE_API_URL` points at Render `/api`
- [ ] Render `CLIENT_URL` matches the Vercel origin (CORS)

## Remaining manual tasks for you

1. Paste a **real** MongoDB Atlas URI into `server/.env` (and Render).
2. Paste a **real** Gemini API key for AI insights.
3. Deploy API to Render, then frontend to Vercel (see `docs/DEPLOYMENT.md`).
4. Capture screenshots into `docs/screenshots/` and link them in the README.
5. Create a GitHub repo description using the one-liner in `docs/RESUME.md`.
6. Remove or keep `server/src/routes/debugRoutes.js` — already gated off in production.
