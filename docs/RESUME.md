# Resume & Portfolio Copy — RepoPulse AI

## One-line GitHub repository description

AI-powered GitHub repository analyzer that scores engineering health, predicts technical debt, and explains metrics with Gemini — built with the MERN stack.

---

## Resume project description (2–3 lines)

**RepoPulse AI** — Full-stack MERN application that analyzes public GitHub repositories for engineering health, documentation quality, community signals, activity, dependency hygiene, and technical debt. Features a scoring engine, Gemini AI insights, MongoDB analysis history, repository comparison, and a responsive Recharts dashboard. Deployed as a Vite/React frontend (Vercel) and Express API (Render) with Helmet, rate limiting, compression, and CORS hardening.

---

## Three ATS-friendly resume bullet points

- Built a full-stack MERN platform that analyzes public GitHub repositories using the GitHub REST API, computing weighted engineering health scores across documentation, community, activity, dependency, and metadata dimensions.
- Designed a technical debt predictor that ranks high-risk source files via heuristics (TODO/FIXME density, file size, commit churn) and surfaced results with Recharts visualizations and searchable MongoDB analysis history.
- Integrated Google Gemini to explain heuristic metrics without altering scores; hardened the Express API with Helmet, rate limiting, compression, CORS allowlists, request timeouts, and graceful shutdown for production deployment on Render and Vercel.

---

## LinkedIn project description

**RepoPulse AI** helps developers and hiring managers quickly assess the engineering quality of any public GitHub repository.

Paste a repo URL and get:

- Weighted engineering health score and letter grade
- Documentation, community, activity, dependency, and metadata breakdowns
- Technical debt hotspots ranked by risk
- Gemini AI explanations of what the numbers mean
- Saved history and side-by-side comparison of past analyses

**Tech:** React, Vite, Tailwind CSS, Recharts, Express, MongoDB, GitHub REST API, Google Gemini

**Role:** Sole developer — architecture, API design, scoring engine, AI integration, dashboard UX, and production readiness.

---

## Portfolio project description

### Problem

Evaluating an unfamiliar GitHub repository usually means skimming the README, starring counts, and a few files — which misses maintenance signals, documentation gaps, and concentrated technical debt.

### Solution

RepoPulse AI turns a repository URL into a structured engineering report: heuristic scores, debt rankings, charts, and AI-written explanations. Analyses can be saved and compared over time.

### Highlights

- Layered Express MVC (routes → controllers → services → models)
- Deterministic scoring engine (Gemini explains; it does not invent scores)
- Technical debt heuristics over source files
- MongoDB persistence with search, filter, and sort
- Production middleware: Helmet, rate limits, compression, CORS, timeouts, logging
- Portfolio-ready dashboard with lazy-loaded Recharts

### Stack

React 19 · Vite · Tailwind · React Router · Axios · Recharts · Express · Mongoose · MongoDB Atlas · GitHub REST API · Google Gemini 2.5 Pro
