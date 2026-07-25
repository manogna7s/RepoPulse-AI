import Card from '../components/ui/Card'

// Charts arrive in the next phase. A clear placeholder communicates intent
// without shipping an empty-looking dashboard.
function ChartPlaceholder({ title }) {
  return (
    <Card className="flex h-56 flex-col items-center justify-center border-dashed p-6 text-center">
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <p className="mt-2 text-sm text-slate-500">Charts coming in next phase.</p>
    </Card>
  )
}

export default ChartPlaceholder
