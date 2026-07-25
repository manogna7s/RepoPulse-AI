// Fixed values used across the app. Keeping them here avoids "magic strings"
// scattered through components.

export const APP_NAME = 'RepoPulse AI'
export const GITHUB_REPO_URL = 'https://github.com/manogna7s/RepoPulse-AI'

export const EXAMPLE_REPO_URL = 'https://github.com/facebook/react'

// Shown one after another while the backend analysis runs, so the user always
// sees progress instead of a frozen screen.
export const LOADING_MESSAGES = [
  'Connecting to GitHub...',
  'Fetching repository...',
  'Calculating engineering metrics...',
  'Predicting technical debt...',
  'Almost done...',
]

// Metadata for the five engineering score cards. Titles and explanations live
// here so the dashboard component stays focused on layout.
export const SCORE_CARDS = [
  {
    key: 'documentation',
    title: 'Documentation',
    description: 'README quality, setup guides, usage examples, and license clarity.',
  },
  {
    key: 'community',
    title: 'Community',
    description: 'Contributors, issue activity, releases, and overall project reach.',
  },
  {
    key: 'activity',
    title: 'Activity',
    description: 'Commit recency, release cadence, and ongoing maintenance signals.',
  },
  {
    key: 'dependency',
    title: 'Dependency Health',
    description: 'Presence and clarity of dependency manifests across ecosystems.',
  },
  {
    key: 'metadata',
    title: 'Metadata',
    description: 'License, description, topics, homepage, and repository hygiene.',
  },
]

// Tailwind classes per technical-debt risk level, kept in one place so the
// table and any future components stay visually consistent.
export const RISK_STYLES = {
  Low: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  Medium: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  High: 'bg-orange-500/10 text-orange-300 ring-orange-500/30',
  Critical: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
}
