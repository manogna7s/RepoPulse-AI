# RepoPulse AI

AI-powered engineering intelligence for GitHub repositories.

Paste a repository URL to measure **documentation quality**, **community health**, **development activity**, **dependency hygiene**, **metadata completeness**, and **technical debt** — then read Gemini-assisted explanations on a professional dashboard. Sign in with GitHub to analyze **private repos** you can access and keep personal history.

**Live stack:** React · Vite · Tailwind · Recharts · Express · MongoDB · GitHub REST API · Google Gemini

Demo Link: https://repo-pulse-ai-pi.vercel.app/

---

## Project Overview

RepoPulse AI is a full-stack MERN application designed for portfolio and production demos. It combines deterministic heuristic scoring with optional generative AI explanations, persists analyses in MongoDB, and lets you reopen or compare past runs without re-hitting GitHub.

| Concern | Approach |
|---------|----------|
| Scoring | Rule-based heuristics (explainable, testable) |
| AI | Gemini explains metrics — it does **not** invent scores |
| Persistence | MongoDB Atlas (soft-fail if unavailable) |
| Deploy | Frontend → Vercel · Backend → Render |

---

## Features

- Analyze **public** GitHub repositories without an account
- **GitHub OAuth** for end users — private repos + personal history
- Weighted **engineering health** score + letter grade
- Five dimension score cards with reasons
- **Technical debt** hotspot table (risk-ranked files)
- **Gemini AI insights** panel
- Interactive **Recharts** visualizations (lazy-loaded)
- **Analysis history** with search, owner filter, and sort
- **Compare** two saved analyses (improved / declined / unchanged)
- Production hardening: Helmet, rate limits, compression, CORS, timeouts, logging
- Accessible UI: skip link, ARIA labels, focus styles, offline banner, 404/500 pages

---

## Architecture

```text
Browser (Vercel)                API (Render)                 Externals
─────────────────               ────────────                 ─────────
React pages  ──Axios──►  Routes → Controllers
Context store            Services (GitHub, scoring,    ◄── GitHub REST + OAuth
Charts / History         debt, Gemini, auth)           ◄── Gemini
                         Models (Mongoose)             ◄── MongoDB Atlas
```

**Request flow (analyze):** validate URL → fetch GitHub bundle → score → debt scan → Gemini explain → save → return JSON → Dashboard via Context (no second fetch).

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Axios, Recharts |
| Backend | Node.js 20+, Express 5, Mongoose 9 |
| Data | MongoDB Atlas |
| Integrations | GitHub REST API, GitHub OAuth, Google Gemini (`@google/genai`) |
| Ops | Helmet, express-rate-limit, compression, Morgan, CORS |

---

## Installation

**Prerequisites:** Node.js 20+, npm, MongoDB Atlas account, GitHub PAT, GitHub OAuth App (for private repos / login), Gemini API key (optional but recommended).

```bash
git clone https://github.com/manogna7s/RepoPulse-AI.git
cd RepoPulse-AI

npm install
npm --prefix client install
npm --prefix server install
```

---

## Running Locally

```bash
# from repo root — starts Vite + Express together
npm run dev
```

- App: http://localhost:5173  
- Health: http://localhost:5000/api/health  

Useful scripts:

| Command | Description |
|---------|-------------|
| `npm run dev` | Client + server (development) |
| `npm run build` | Production frontend build |
| `npm start` | Start Express (`server`) |
| `npm run lint` | Lint the client |

---

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for full steps.

**Quick summary**

1. **Render (API):** root directory `server`, start `npm start`, health `/api/health`, set env vars.
2. **Vercel (UI):** root directory `client`, build `npm run build`, output `dist`, set `VITE_API_URL` to the Render API `/api` URL.
3. Point Render `CLIENT_URL` at your Vercel origin for CORS.

Optional Blueprint: root `render.yaml`.

---

## Folder Structure

```text
RepoPulse-AI/
├── client/                      # Vite + React frontend
│   ├── public/                  # Favicon, OG image, web manifest
│   ├── src/
│   │   ├── charts/              # Lazy-loaded Recharts
│   │   ├── components/          # UI + dashboard + common
│   │   ├── constants/           # Shared app constants
│   │   ├── context/             # Analysis + Auth context
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/               # Home, Dashboard, History, Compare, Auth callback
│   │   ├── services/            # Axios API clients
│   │   └── utils/
│   ├── vercel.json              # SPA rewrites for Vercel
│   └── index.html               # SEO / Open Graph / theme
├── server/                      # Express API
│   └── src/
│       ├── config/              # Env + MongoDB
│       ├── controllers/
│       ├── middleware/          # Security, logging, timeout, errors
│       ├── models/
│       ├── routes/
│       ├── services/            # GitHub, scoring, debt, AI, auth, persistence
│       └── utils/
├── docs/
│   ├── API.md                   # Endpoint documentation
│   ├── DEPLOYMENT.md
│   ├── RESUME.md                # Resume / LinkedIn / portfolio copy
│   └── INTERVIEW_GUIDE.md
├── render.yaml
├── package.json                 # Root orchestration scripts
└── README.md
```

---

## API Documentation

Full reference: **[docs/API.md](docs/API.md)**

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/auth/github` | Start GitHub OAuth |
| `GET` | `/api/auth/me` | Current user |
| `POST` | `/api/repository/analyze` | Full analysis pipeline |
| `GET` | `/api/history` | List saved analyses (signed-in) |
| `GET` | `/api/history/:id` | Load one analysis |
| `DELETE` | `/api/history/:id` | Delete one analysis |
| `GET` | `/api/health` | Liveness + DB status |

---
---

## Future Roadmap

- [x] GitHub OAuth and private repository support  
- [ ] Background job queue for very large repositories  
- [ ] Deeper dependency / lint-based debt signals  
- [ ] Historical trend charts across many runs  
- [ ] Automated tests + CI  
- [ ] Redis caching for repeated analyzes  

---

## License

MIT — see [LICENSE](LICENSE) if present, or treat this repository as MIT for portfolio use unless otherwise noted.

---

