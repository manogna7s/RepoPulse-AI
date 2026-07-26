# RepoPulse AI

AI-powered engineering intelligence for public GitHub repositories.

Paste a repository URL to measure **documentation quality**, **community health**, **development activity**, **dependency hygiene**, **metadata completeness**, and **technical debt** — then read Gemini-assisted explanations on a professional dashboard.

**Live stack:** React · Vite · Tailwind · Recharts · Express · MongoDB · GitHub REST API · Google Gemini

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

- Analyze any **public** GitHub repository by URL
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
Context store            Services (GitHub, scoring,    ◄── GitHub REST
Charts / History         debt, Gemini, persistence)    ◄── Gemini
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
| Integrations | GitHub REST API, Google Gemini (`@google/genai`) |
| Ops | Helmet, express-rate-limit, compression, Morgan, CORS |

---

## Installation

**Prerequisites:** Node.js 20+, npm, MongoDB Atlas account, GitHub PAT, Gemini API key (optional but recommended).

```bash
git clone https://github.com/manogna7s/RepoPulse-AI.git
cd RepoPulse-AI

npm install
npm --prefix client install
npm --prefix server install
```

---

## Environment Variables

### Backend — `server/.env`

Copy from `server/.env.example`:

```env
PORT=5000
MONGODB_URI=
GITHUB_TOKEN=
GEMINI_API_KEY=
CLIENT_URL=http://localhost:5173
```

Never commit real secrets. `.env` is gitignored.

### Frontend — `client/.env`

Copy from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
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
│   │   ├── context/             # Analysis Context
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/               # Home, Dashboard, History, Compare, errors
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
│       ├── services/            # GitHub, scoring, debt, AI, persistence
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
| `POST` | `/api/repository/analyze` | Full analysis pipeline |
| `GET` | `/api/history` | List saved analyses |
| `GET` | `/api/history/:id` | Load one analysis |
| `DELETE` | `/api/history/:id` | Delete one analysis |
| `GET` | `/api/health` | Liveness + DB status |

---

## Screenshots

> Add screenshots after deploy (recommended for your portfolio README):

1. Home — URL input + feature strip  
2. Dashboard — health score + score cards  
3. Charts — radar / languages / debt  
4. History — searchable table  
5. Compare — improved / declined badges  

Place images under `docs/screenshots/` and link them here, for example:

```markdown
![Dashboard](docs/screenshots/dashboard.png)
```

---

## Future Roadmap

- [ ] GitHub OAuth and private repository support  
- [ ] Background job queue for very large repositories  
- [ ] Deeper dependency / lint-based debt signals  
- [ ] Historical trend charts across many runs  
- [ ] Automated tests + CI  
- [ ] Redis caching for repeated analyzes  

---

## License

MIT — see [LICENSE](LICENSE) if present, or treat this repository as MIT for portfolio use unless otherwise noted.

---

## Contributing

Issues and pull requests are welcome.

1. Fork the repo and create a feature branch  
2. Keep changes focused (do not mix unrelated refactors)  
3. Never commit `.env` or API keys  
4. Open a PR with a short summary and test notes  

Portfolio / resume copy: [docs/RESUME.md](docs/RESUME.md)  
Interview prep: [docs/INTERVIEW_GUIDE.md](docs/INTERVIEW_GUIDE.md)
