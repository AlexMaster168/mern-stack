import type { Link } from '../../../types'
import { LinkCard } from './LinkCard'

export function LinksList({ links }: { links: Link[] }) {
  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
        Ссылок пока нет. Создайте первую!
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {links.map((link) => (
        <LinkCard key={link._id} link={link} />
      ))}
    </div>
  )
}
