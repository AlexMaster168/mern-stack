import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CountPoint, LinkStats } from '../../../types'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899', '#84cc16']

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <figure className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <figcaption className="mb-2 text-sm font-medium text-slate-700">{title}</figcaption>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </figure>
  )
}

function Empty({ title }: { title: string }) {
  return (
    <figure className="flex h-full min-h-[14rem] flex-col rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <figcaption className="mb-2 text-sm font-medium text-slate-700">{title}</figcaption>
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">нет данных</div>
    </figure>
  )
}

export function StatsCharts({ stats }: { stats: LinkStats }) {
  if (stats.total === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        Переходов пока нет — статистика появится после первых кликов.
      </p>
    )
  }

  const pie = (data: CountPoint[]) => (
    <PieChart>
      <Tooltip />
      <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
        {data.map((p, i) => (
          <Cell key={p.name} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  )

  const bars = (data: CountPoint[]) => (
    <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
      <XAxis type="number" allowDecimals={false} />
      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
      <Tooltip />
      <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
    </BarChart>
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Panel title="Переходы по дням">
        <LineChart data={stats.byDay}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
        </LineChart>
      </Panel>

      {stats.byDevice.length > 0 ? <Panel title="Устройства">{pie(stats.byDevice)}</Panel> : <Empty title="Устройства" />}
      {stats.byBrowser.length > 0 ? <Panel title="Браузеры">{bars(stats.byBrowser)}</Panel> : <Empty title="Браузеры" />}
      {stats.byReferer.length > 0 ? <Panel title="Источники">{bars(stats.byReferer)}</Panel> : <Empty title="Источники" />}
    </div>
  )
}
