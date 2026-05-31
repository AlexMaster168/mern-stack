import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartPoint, ChartType } from '../../../types'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7']

interface Props {
  chartType: ChartType
  data: ChartPoint[]
  caption?: string
}

export function ChartBlock({ chartType, data, caption }: Props) {
  return (
    <figure className="my-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(chartType, data)}
        </ResponsiveContainer>
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-slate-500">{caption}</figcaption>}
    </figure>
  )
}

function renderChart(type: ChartType, data: ChartPoint[]) {
  if (type === 'line') {
    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
      </LineChart>
    )
  }

  if (type === 'pie') {
    return (
      <PieChart>
        <Tooltip />
        <Legend />
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
          {data.map((point, i) => (
            <Cell key={point.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    )
  }

  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
    </BarChart>
  )
}
