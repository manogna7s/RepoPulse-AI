import { Link } from 'react-router-dom'
import Card from '../ui/Card'

const STEPS = [
  {
    n: '01',
    title: 'Paste a repository URL',
    text: 'Public repos work instantly. Sign in with GitHub to include private repositories you can access.',
  },
  {
    n: '02',
    title: 'We read engineering signals',
    text: 'RepoPulse fetches GitHub metadata, activity, documentation, dependencies, and source-file risk markers.',
  },
  {
    n: '03',
    title: 'See scores, debt, and AI narrative',
    text: 'Heuristic scores stay deterministic. Gemini only explains them. Save the run and compare it later.',
  },
]

const CAPABILITIES = [
  {
    title: 'Engineering health score',
    text: 'A weighted 0–100 score and letter grade from five dimensions: documentation, community, activity, dependency health, and metadata.',
  },
  {
    title: 'Technical debt hotspots',
    text: 'Source files are ranked by TODO/FIXME density, size, and commit churn — then labeled Low to Critical so you know where to look first.',
  },
  {
    title: 'AI insights that do not invent numbers',
    text: 'Gemini turns the same metrics into a short executive summary. If AI is unavailable, scores and debt still complete.',
  },
  {
    title: 'History & compare',
    text: 'Signed-in analyses are saved to your account. Reopen a past run or compare two snapshots to see what improved or declined.',
  },
  {
    title: 'Private repos with GitHub OAuth',
    text: 'Your GitHub token stays encrypted on the server. The browser only holds a session JWT — never the GitHub access token.',
  },
  {
    title: 'Charts that load when you need them',
    text: 'Languages, score radar, contributors, commits, and debt bars render on the dashboard with lazy-loaded Recharts.',
  },
]

function PreviewCard() {
  return (
    <Card className="overflow-hidden p-0" aria-hidden="true">
      <div className="border-b border-slate-800 bg-slate-950/70 px-5 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Dashboard preview</p>
        <p className="mt-1 text-sm font-semibold text-white">facebook / react</p>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs text-slate-500">Engineering health</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-cyan-400">88</p>
          <p className="mt-1 text-sm text-slate-400">Grade A · heuristic</p>
        </div>
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          {[
            ['Documentation', 92],
            ['Community', 86],
            ['Activity', 90],
            ['Dependency', 78],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>{label}</span>
                <span className="text-slate-300">{value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function MeetRepoPulse() {
  return (
    <section className="mt-24 w-full text-left" aria-labelledby="meet-heading">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">Product</p>
        <h2 id="meet-heading" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Meet RepoPulse
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
          Stars and a README are not enough to judge a repository. RepoPulse treats GitHub data as
          engineering evidence. It then shows health, risk, and a plain-language explanation in one
          dashboard.
        </p>
      </div>

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-white">See a repository the way a reviewer would</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Paste any public GitHub URL. RepoPulse pulls repository metadata, commit activity,
            contributors, languages, and file-level signals. Heuristics compute scores. Gemini
            narrates the result — it never recalculates it.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              Deterministic scoring you can explain in an interview
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              Technical debt ranked by risk, not guesswork
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              Personal history when you sign in with GitHub
            </li>
          </ul>
        </div>
        <PreviewCard />
      </div>

      <div className="mt-20">
        <h3 className="text-center text-xl font-semibold text-white">How it works</h3>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <p className="font-mono text-xs font-semibold text-cyan-400">{step.n}</p>
              <h4 className="mt-3 text-base font-semibold text-white">{step.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-20">
        <h3 className="text-center text-xl font-semibold text-white">What you get</h3>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <h4 className="text-sm font-semibold text-white">{item.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
            </article>
          ))}
        </div>
      </div>

      <p className="mt-12 text-center text-sm text-slate-500">
        Ready to try it?{' '}
        <a href="#repo-url" className="font-medium text-cyan-400 hover:text-cyan-300">
          Analyze a repository
        </a>
        {' · '}
        <Link to="/dashboard" className="font-medium text-cyan-400 hover:text-cyan-300">
          Open dashboard
        </Link>
      </p>
    </section>
  )
}

export default MeetRepoPulse
