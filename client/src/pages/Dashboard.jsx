import { Link } from 'react-router-dom'
import ChartPlaceholder from '../charts/ChartPlaceholder'
import HealthScoreCard from '../components/dashboard/HealthScoreCard'
import RepositoryHeader from '../components/dashboard/RepositoryHeader'
import ScoreCard from '../components/dashboard/ScoreCard'
import TechnicalDebtTable from '../components/dashboard/TechnicalDebtTable'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { SCORE_CARDS } from '../constants'
import { useAnalysis } from '../context/useAnalysis'
import useDocumentTitle from '../hooks/useDocumentTitle'

/** Shown when someone opens /dashboard without analyzing a repository first. */
function EmptyState() {
  return (
    <Card className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-2xl font-bold text-white">No analysis yet</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Analyze a public GitHub repository to see engineering health scores and
        technical debt hotspots here.
      </p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Analyze a repository</Button>
      </Link>
    </Card>
  )
}

function Dashboard() {
  useDocumentTitle('Dashboard')

  // Data comes from context, so navigating here never re-runs the analysis.
  const { repository, scores, engineeringHealth, technicalDebt } = useAnalysis()

  if (!repository) {
    return <EmptyState />
  }

  return (
    <div className="space-y-8">
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
        <div className="grid gap-5 md:grid-cols-2">
          <ChartPlaceholder title="Score breakdown" />
          <ChartPlaceholder title="Language distribution" />
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
