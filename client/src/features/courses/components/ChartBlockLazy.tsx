import { lazy, Suspense } from 'react'
import type { ChartPoint, ChartType } from '../../../types'

// recharts тяжёлый — грузим его отдельным чанком только когда нужен график
const ChartBlock = lazy(() => import('./ChartBlock').then((m) => ({ default: m.ChartBlock })))

interface Props {
  chartType: ChartType
  data: ChartPoint[]
  caption?: string
}

export function ChartBlockLazy(props: Props) {
  return (
    <Suspense fallback={<div className="my-4 h-72 animate-pulse rounded-xl bg-slate-100" />}>
      <ChartBlock {...props} />
    </Suspense>
  )
}
