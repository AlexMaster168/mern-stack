import type { ChartType, ContentBlock } from '../../../types'
import { ImageUpload } from './ImageUpload'
import { ChartDataEditor } from './ChartDataEditor'

interface Props {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Столбчатый' },
  { value: 'line', label: 'Линейный' },
  { value: 'pie', label: 'Круговой' },
]

export function ContentBlockEditor({ blocks, onChange }: Props) {
  const update = (i: number, patch: Partial<ContentBlock>) => {
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)))
  }
  const remove = (i: number) => onChange(blocks.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]
    const a = next[i]
    const b = next[j]
    if (!a || !b) return
    next[i] = b
    next[j] = a
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <header className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {block.type === 'text' ? 'Текст' : block.type === 'image' ? 'Картинка' : 'График'}
            </span>
            <div className="flex gap-1 text-slate-400">
              <button type="button" onClick={() => move(i, -1)} className="px-1 hover:text-slate-700">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} className="px-1 hover:text-slate-700">
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="px-1 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </header>

          {block.type === 'text' && (
            <textarea
              value={block.value ?? ''}
              onChange={(e) => update(i, { value: e.target.value })}
              rows={3}
              placeholder="Текст блока"
              className="w-full rounded border border-slate-300 p-2 text-sm"
            />
          )}

          {block.type === 'image' && (
            <div className="space-y-2">
              {block.url ? (
                <img src={block.url} alt="" className="max-h-40 rounded" />
              ) : (
                <ImageUpload label="Загрузить картинку" onUploaded={(url) => update(i, { url })} />
              )}
              <input
                value={block.caption ?? ''}
                onChange={(e) => update(i, { caption: e.target.value })}
                placeholder="Подпись (необязательно)"
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
          )}

          {block.type === 'chart' && (
            <div className="space-y-2">
              <select
                value={block.chartType ?? 'bar'}
                onChange={(e) => update(i, { chartType: e.target.value as ChartType })}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              >
                {CHART_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChartDataEditor
                data={block.data ?? []}
                onChange={(data) => update(i, { data })}
              />
              <input
                value={block.caption ?? ''}
                onChange={(e) => update(i, { caption: e.target.value })}
                placeholder="Подпись графика"
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <AddButton onClick={() => onChange([...blocks, { type: 'text', value: '' }])}>
          + Текст
        </AddButton>
        <AddButton onClick={() => onChange([...blocks, { type: 'image', url: '', caption: '' }])}>
          + Картинка
        </AddButton>
        <AddButton
          onClick={() =>
            onChange([
              ...blocks,
              { type: 'chart', chartType: 'bar', caption: '', data: [{ name: '', value: 0 }] },
            ])
          }
        >
          + График
        </AddButton>
      </div>
    </div>
  )
}

function AddButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200"
    >
      {children}
    </button>
  )
}
