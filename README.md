# RepoPulse AI

RepoPulse AI is a production-oriented MERN application that will provide
AI-powered insights about GitHub repositories. This first milestone contains
only the application foundation—repository analysis, authentication,
background jobs, and AI integrations are intentionally not implemented.

## Project structure

```text
RepoPulse-AI/
├── client/                    # React browser application
│   └── src/
│       ├── assets/            # Static images and icons
│       ├── components/        # Reusable UI pieces
│       ├── hooks/             # Reusable React behavior
│       ├── layouts/           # Shared page structure
│       ├── pages/             # Route-level screens
│       ├── services/          # HTTP and external API clients
│       └── utils/             # Framework-independent helpers/constants
├── server/                    # Express REST API
│   └── src/
│       ├── config/            # Environment and infrastructure settings
│       ├── controllers/       # HTTP request/response coordination
│       ├── middleware/        # Cross-cutting request processing
│       ├── models/            # Future Mongoose data models
│       ├── routes/            # API URL definitions
│       ├── services/          # Future business and integration logic
│       └── utils/             # Framework-independent helpers
└── package.json               # Commands that coordinate both applications
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB Atlas account (not required until database features are added)

## Setup

1. Install all dependencies:

   ```bash
   npm install
   npm --prefix client install
   npm --prefix server install
   ```

2. Create local environment files.

   PowerShell:

   ```powershell
   Copy-Item client/.env.example client/.env
   Copy-Item server/.env.example server/.env
   ```

   macOS/Linux:

   ```bash
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```

3. Start the frontend and backend together:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173`. Check the API at
   `http://localhost:5000/api/health`.

The health response is:

```json
{
  "success": true,
  "message": "RepoPulse API Running"
}
```

## Available scripts

- `npm run dev` — starts Vite and Express in development mode.
- `npm run dev:client` — starts only the React application.
- `npm run dev:server` — starts only the Express API with automatic restart.
- `npm run build` — creates the optimized frontend production build.
- `npm start` — starts the backend without the development file watcher.
- `npm run lint` — checks frontend source quality.

## Architecture decisions

### 1. Separate `client` and `server` applications

**Why:** The browser application and API have different runtimes, dependencies,
and deployment targets (Vercel and Render).

**Problem solved:** Each application can be developed, built, tested, and
deployed independently without mixing frontend and backend concerns.

**Interview explanation:** “I used a simple monorepo so related code stays in
one repository, while separate package boundaries preserve independent
deployment and dependency management.”

### 2. React Router with a shared layout

**Why:** Routes make each screen directly addressable, while `MainLayout`
provides navigation once for every page.

**Problem solved:** It avoids conditional page rendering and duplicated headers.
Unknown URLs receive a dedicated 404 page.

**Interview explanation:** “I defined routes centrally and used nested routing
for shared UI, which keeps page components focused on page content.”

### 3. Tailwind through the Vite plugin

**Why:** The official plugin integrates Tailwind's build step directly with
Vite and scans application code automatically.

**Problem solved:** Styling stays consistent without maintaining a growing
global stylesheet or shipping unused utility CSS.

**Interview explanation:** “Tailwind gives the team constrained design tokens
and colocated styles, while Vite produces an optimized production bundle.”

### 4. Layered Express folders

**Why:** Routes map URLs, controllers handle HTTP, services will hold business
logic, and models will own database schemas.

**Problem solved:** API code does not become one large file, and future features
can be tested and changed without tightly coupling transport, business, and
database code.

**Interview explanation:** “I separated HTTP, business, and persistence layers
so each module has one responsibility, but kept the initial implementation
small rather than adding abstractions before they are needed.”

### 5. Central configuration and middleware

**Why:** `dotenv` loads environment-specific values, CORS permits the configured
frontend, and common error middleware standardizes failure responses.

**Problem solved:** Secrets are not hard-coded, browser access is controlled,
and every endpoint returns predictable JSON errors.

**Interview explanation:** “I centralized cross-cutting configuration so
development and production can use the same code with different environment
variables.”

### 6. Root development scripts

**Why:** `concurrently` starts both independent applications with one command.

**Problem solved:** Developers do not need to manage two terminals for normal
local work, while still retaining commands to run either application alone.

**Interview explanation:** “The root package is an orchestration layer; it
improves developer experience without coupling the two deployable apps.”

## Current scope

This milestone verifies the project structure, routing, styling, API startup,
CORS, environment configuration, and health endpoint only. GitHub APIs, Gemini,
MongoDB connections, OAuth, cron jobs, and repository analysis belong to later
milestones.
