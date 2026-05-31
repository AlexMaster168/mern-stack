import type { ChartPoint } from '../../../types'

interface Props {
  data: ChartPoint[]
  onChange: (data: ChartPoint[]) => void
}

export function ChartDataEditor({ data, onChange }: Props) {
  const update = (i: number, patch: Partial<ChartPoint>) => {
    onChange(data.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }

  return (
    <div className="space-y-2">
      {data.map((point, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={point.name}
            onChange={(e) => update(i, { name: e.target.value })}
            placeholder="Метка"
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
          />
          <input
            type="number"
            value={point.value}
            onChange={(e) => update(i, { value: Number(e.target.value) })}
            placeholder="Значение"
            className="w-28 rounded border border-slate-300 px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(data.filter((_, idx) => idx !== i))}
            className="rounded bg-slate-100 px-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...data, { name: '', value: 0 }])}
        className="text-sm text-indigo-600 hover:underline"
      >
        + Точка
      </button>
    </div>
  )
}
