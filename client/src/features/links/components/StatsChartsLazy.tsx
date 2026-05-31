import { lazy, Suspense } from 'react'
import type { LinkStats } from '../../../types'

// Графики аналитики (recharts) — отдельным чанком
const StatsCharts = lazy(() => import('./StatsCharts').then((m) => ({ default: m.StatsCharts })))

export function StatsChartsLazy({ stats }: { stats: LinkStats }) {
  return (
    <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-slate-100" />}>
      <StatsCharts stats={stats} />
    </Suspense>
  )
}
