import { Link as RouterLink } from 'react-router-dom'
import type { Link } from '../../../types'
import { BADGE_CLASS, linkBadges } from '../linkUtils'

export function LinkCard({ link }: { link: Link }) {
  const badges = linkBadges(link)
  return (
    <RouterLink
      to={`/links/${link._id}`}
      className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300"
    >
      <p className="truncate font-medium text-indigo-600">{link.to}</p>
      <p className="mt-1 truncate text-sm text-slate-500">{link.from}</p>

      {badges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {badges.map((b) => (
            <span key={b.text} className={`rounded-full px-2 py-0.5 text-xs ${BADGE_CLASS[b.tone]}`}>
              {b.text}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <span className="rounded-full bg-slate-100 px-2 py-0.5">{link.clicks} переходов</span>
        <span>{new Date(link.createdAt).toLocaleDateString('ru-RU')}</span>
      </div>
    </RouterLink>
  )
}
