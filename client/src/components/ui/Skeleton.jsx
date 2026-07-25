// Lightweight skeleton blocks used while history loads.
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-800/80 ${className}`} />
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-28 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  )
}

export default Skeleton
