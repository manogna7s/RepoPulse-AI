import Card from '../ui/Card'

function InsightList({ title, items, accent }) {
  if (!items?.length) {
    return (
      <Card className="h-full p-5">
        <h3 className={`text-sm font-semibold ${accent}`}>{title}</h3>
        <p className="mt-3 text-sm text-slate-500">No items returned.</p>
      </Card>
    )
  }

  return (
    <Card hoverable className="h-full p-5">
      <h3 className={`text-sm font-semibold ${accent}`}>{title}</h3>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/**
 * Premium AI insights panel.
 * Heuristic scores stay numeric above; this section explains them in prose.
 */
function AiInsightsPanel({ aiInsights }) {
  if (!aiInsights) {
    return (
      <Card className="border-dashed p-8 text-center text-sm text-slate-500">
        AI insights were not included in this analysis.
      </Card>
    )
  }

  if (!aiInsights.available) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5 p-6">
        <h2 className="text-lg font-semibold text-amber-200">AI insights</h2>
        <p className="mt-2 text-sm text-amber-100/80">
          {aiInsights.message || 'AI insights unavailable.'}
        </p>
        <p className="mt-2 text-xs text-amber-100/50">
          Heuristic scores above are still valid. Add a real GEMINI_API_KEY to enable narratives.
        </p>
      </Card>
    )
  }

  return (
    <section className="space-y-5">
      <Card className="overflow-hidden border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
          Gemini insights
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white">Executive summary</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          {aiInsights.executiveSummary}
        </p>
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Production readiness
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {aiInsights.productionReadiness}
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightList title="Strengths" items={aiInsights.strengths} accent="text-emerald-300" />
        <InsightList title="Weaknesses" items={aiInsights.weaknesses} accent="text-rose-300" />
        <InsightList
          title="Recommendations"
          items={aiInsights.recommendations}
          accent="text-cyan-300"
        />
        <InsightList title="Future risks" items={aiInsights.futureRisks} accent="text-amber-300" />
      </div>
    </section>
  )
}

export default AiInsightsPanel
