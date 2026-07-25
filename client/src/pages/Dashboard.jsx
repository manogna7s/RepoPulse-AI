import useDocumentTitle from '../hooks/useDocumentTitle'

function Dashboard() {
  useDocumentTitle('Dashboard')

  return (
    <section>
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <p className="mt-3 text-slate-400">
        Repository insights will appear here in a later development phase.
      </p>

      <div className="mt-10 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center text-slate-500">
        No repositories analyzed yet.
      </div>
    </section>
  )
}

export default Dashboard
