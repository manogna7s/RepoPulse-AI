# Interview Guide — RepoPulse AI

Use these concise answers in interviews. Speak to **what you built and why**, not buzzwords.

---

## Project motivation

**Q: Why did you build this?**  
Hiring managers and engineers often judge repos by stars alone. I wanted a tool that turns public GitHub signals into a structured engineering health report — scores, technical debt hotspots, and AI explanations — so quality is measurable and comparable over time.

---

## Architecture

**Q: How is the system structured?**  
Monorepo with two deployables: React/Vite client and Express API. The API uses layered MVC — routes map URLs, controllers handle HTTP, services own business logic (GitHub, scoring, debt, Gemini, persistence), and Mongoose models own schemas. The frontend uses pages + reusable components, Axios services, and React Context so analysis results are not re-fetched after navigation.

**Why separate client/server?** Independent deploy targets (Vercel vs Render), separate dependency trees, and clearer security boundaries for secrets.

---

## Request flow (analyze)

1. User submits a GitHub URL on Home.
2. Client validates locally, then `POST /api/repository/analyze`.
3. Server parses URL → fetches GitHub bundle (repo, languages, commits, contributors, README, tree).
4. Scoring service computes five dimension scores + overall health.
5. Technical debt service ranks risky files.
6. Gemini explains the metrics (non-fatal if key missing/fails).
7. MongoDB saves when connected; response returns full payload.
8. Client stores result in Context and navigates to Dashboard (no second API call).

---

## Engineering scoring engine

**Q: How do scores work?**  
Deterministic heuristics — not ML. Each dimension (documentation, community, activity, dependency, metadata) maps GitHub signals to 0–100. An overall engineering health score is a weighted blend with a letter grade. Keeping scoring rule-based makes results explainable and testable; Gemini only narrates the numbers.

---

## Technical Debt Predictor

**Q: How do you predict debt?**  
We filter likely source files, then score risk using signals such as TODO/FIXME density, file size, and commit churn. Top results are returned with a risk level (Low → Critical). It is a **heuristic predictor**, not a compiler or static analyzer — honest about trade-offs in interviews.

---

## Gemini integration

**Q: Why Gemini if scoring is heuristic?**  
Scores answer “what”; Gemini answers “what does this mean for maintainers?” Insights are generated from the already-computed metrics. If Gemini fails or the key is missing, analysis still succeeds with an unavailable insights object — resilience over coupling.

---

## MongoDB

**Q: What do you store?**  
Each successful analysis can be persisted (`RepositoryAnalysis`) with repository snapshot, scores, debt, insights, and timestamps. History supports search, owner filter, sort, open, delete, and compare. Soft-fail connection: API still analyzes if Mongo is down; history features degrade gracefully.

---

## Charts

**Q: Why Recharts?**  
Declarative React charts for languages, score radar, stars/forks, debt bars, contributors, and commit timeline. Charts are **lazy-loaded** so the initial dashboard paint stays lighter.

---

## Performance optimizations

- GitHub request concurrency caps + per-analysis caching where useful
- Lazy-loaded chart chunks
- Compression on API responses
- Rate limits to protect expensive analyze routes
- Context avoids duplicate analyze calls after navigation
- 1mb JSON body limit and request timeouts

---

## Biggest challenges

1. **GitHub rate limits / large repos** — mitigated with token auth, concurrency limits, and timeouts.  
2. **Keeping AI from inventing scores** — strict separation: heuristics compute, Gemini explains.  
3. **CORS + split hosting** — `CLIENT_URL` allowlist plus optional preview origins.  
4. **Mongo optional vs required** — soft-fail DB so demos still work without Atlas.

---

## Future improvements

- Auth (GitHub OAuth) and private-repo support  
- Background jobs / queues for very large repositories  
- Deeper static analysis (ESLint/dependency audits)  
- Trend charts across many historical runs  
- Caching layer (Redis) for repeated analyzes  
- Automated tests and CI

---

## Common interviewer questions (short answers)

**Why MERN?** Fast end-to-end TypeScript/JS delivery, strong hiring market fit, one language across stack for a solo project.

**How do you secure the API?** Secrets in env only; Helmet headers; CORS allowlist; rate limits; body size caps; timeouts; no debug routes in production; stack traces hidden in production.

**How would you scale?** Move analyze to a job queue, cache GitHub responses, horizontal API instances behind a load balancer, index Mongo query fields, CDN the static frontend.

**What would you test first?** URL parser, scoring pure functions, debt ranking fixtures, and API contract tests for analyze/history/health.

**Biggest production risk?** GitHub/Gemini third-party quotas and cold starts on free Render — mitigate with tokens, retries/backoff, and clear UX for rate limits/timeouts.
