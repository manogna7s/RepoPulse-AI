import { RISK_STYLES } from '../../constants'
import Card from '../ui/Card'

function RiskBadge({ level }) {
  const style = RISK_STYLES[level] || RISK_STYLES.Low
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${style}`}>
      {level}
    </span>
  )
}

/**
 * Ranked list of the riskiest files. Rendered as a table on large screens and
 * as stacked cards on mobile, because wide tables do not fit small viewports.
 */
function TechnicalDebtTable({ technicalDebt = [] }) {
  if (technicalDebt.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">
        No technical debt hotspots were detected in the scanned files.
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">File</th>
              <th className="px-6 py-4 font-medium">Debt Score</th>
              <th className="px-6 py-4 font-medium">Risk Level</th>
              <th className="px-6 py-4 font-medium">Reasons</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {technicalDebt.map((item) => (
              <tr key={item.file} className="transition hover:bg-slate-800/30">
                <td className="max-w-xs px-6 py-4 font-mono text-xs text-slate-300">
                  <span className="block truncate" title={item.file}>
                    {item.file}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-white">{item.debtScore}</td>
                <td className="px-6 py-4">
                  <RiskBadge level={item.riskLevel} />
                </td>
                <td className="px-6 py-4 text-slate-400">
                  <ul className="space-y-1">
                    {item.reasons?.slice(0, 3).map((reason) => (
                      <li key={reason} className="leading-6">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-slate-800 lg:hidden">
        {technicalDebt.map((item) => (
          <div key={item.file} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 break-all font-mono text-xs text-slate-300">{item.file}</p>
              <RiskBadge level={item.riskLevel} />
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Debt score <span className="font-semibold text-white">{item.debtScore}</span>
            </p>
            <ul className="mt-3 space-y-1 text-sm text-slate-500">
              {item.reasons?.slice(0, 3).map((reason) => (
                <li key={reason} className="leading-6">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default TechnicalDebtTable
