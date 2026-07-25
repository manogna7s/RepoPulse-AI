import { Link } from 'react-router-dom'
import CommitTimelineChart from '../charts/CommitTimelineChart'
import ContributorsChart from '../charts/ContributorsChart'
import LanguagePieChart from '../charts/LanguagePieChart'
import ScoreRadarChart from '../charts/ScoreRadarChart'
import StarsForksBarChart from '../charts/StarsForksBarChart'
import TechnicalDebtBarChart from '../charts/TechnicalDebtBarChart'
import HealthScoreCard from '../components/dashboard/HealthScoreCard'
import RepositoryHeader from '../components/dashboard/RepositoryHeader'
import ScoreCard from '../components/dashboard/ScoreCard'
import TechnicalDebtTable from '../components/dashboard/TechnicalDebtTable'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { SCORE_CARDS } from '../constants'
import { useAnalysis } from '../context/useAnalysis'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { formatDate } from '../utils/format'

function EmptyState() {
  return (
    <Card className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-2xl font-bold text-white">No analysis yet</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Analyze a public GitHub repository to see engineering health scores,
        charts, and technical debt hotspots here.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link to="/">
          <Button>Analyze a repository</Button>
        </Link>
        <Link to="/history">
          <Button variant="secondary">Open history</Button>
        </Link>
      </div>
    </Card>
  )
}

function Dashboard() {
  useDocumentTitle('Dashboard')

  const { repository, scores, engineeringHealth, technicalDebt, analysis } = useAnalysis()

  if (!repository) {
    return <EmptyState />
  }

  const analysisDate =
    analysis?.persistence?.analysisDate || analysis?.analysisDate || null

  return (
    <div className="space-y-8">
      {/* Sticky summary bar for long dashboards */}
      <div className="sticky top-[73px] z-20 -mx-4 border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {repository.fullName || repository.name}
            </p>
            <p className="text-xs text-slate-500">
              Health {engineeringHealth?.overallScore ?? '—'}
              {engineeringHealth?.grade ? ` (${engineeringHealth.grade})` : ''}
              {analysisDate ? ` · Analyzed ${formatDate(analysisDate)}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/history">
              <Button variant="secondary" className="px-3 py-2 text-xs">
                History
              </Button>
            </Link>
            <Link to="/">
              <Button className="px-3 py-2 text-xs">New analysis</Button>
            </Link>
          </div>
        </div>
      </div>

      <RepositoryHeader repository={repository} />

      <HealthScoreCard engineeringHealth={engineeringHealth} />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Engineering scores</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {SCORE_CARDS.map((card) => (
            <ScoreCard
              key={card.key}
              title={card.title}
              description={card.description}
              score={scores?.[card.key]}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Visualizations</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <LanguagePieChart languages={repository.languages} />
          <ScoreRadarChart scores={scores} />
          <StarsForksBarChart repository={repository} />
          <TechnicalDebtBarChart technicalDebt={technicalDebt} />
          <ContributorsChart contributors={repository.contributors} />
          <CommitTimelineChart commits={repository.commits} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Technical debt hotspots
        </h2>
        <TechnicalDebtTable technicalDebt={technicalDebt} />
      </section>
    </div>
  )
}

export default Dashboard
