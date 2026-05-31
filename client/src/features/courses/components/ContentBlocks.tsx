import type { ContentBlock } from '../../../types'
import { ChartBlockLazy } from './ChartBlockLazy'

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks.length) return null
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  )
}

function BlockView({ block }: { block: ContentBlock }) {
  if (block.type === 'text') {
    return <p className="leading-relaxed whitespace-pre-line text-slate-700">{block.value}</p>
  }

  if (block.type === 'image') {
    return (
      <figure>
        <img src={block.url} alt={block.caption ?? ''} className="w-full rounded-xl" />
        {block.caption && (
          <figcaption className="mt-1 text-center text-sm text-slate-500">{block.caption}</figcaption>
        )}
      </figure>
    )
  }

  if (block.type === 'chart' && block.chartType && block.data) {
    return <ChartBlockLazy chartType={block.chartType} data={block.data} caption={block.caption} />
  }

  return null
}
