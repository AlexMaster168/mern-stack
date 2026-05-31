import type { Link } from '../../types'

/** ISO-строка → значение для <input type="datetime-local"> (с учётом локальной зоны). */
export function isoToLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

/** Значение datetime-local → ISO-строка (или null, если пусто). */
export function localInputToIso(local: string): string | null {
  if (!local) return null
  return new Date(local).toISOString()
}

export type BadgeTone = 'slate' | 'amber' | 'red' | 'indigo' | 'green'

export interface LinkBadge {
  text: string
  tone: BadgeTone
}

/** Набор статусных бейджей ссылки для карточки/детальной страницы. */
export function linkBadges(link: Link): LinkBadge[] {
  const badges: LinkBadge[] = []
  if (link.disabled) {
    badges.push({ text: 'отключена', tone: 'red' })
  }
  if (link.hasPassword) {
    badges.push({ text: '🔒 пароль', tone: 'amber' })
  }
  if (link.expiresAt) {
    const expired = new Date(link.expiresAt).getTime() < Date.now()
    badges.push({
      text: expired ? 'срок истёк' : `до ${new Date(link.expiresAt).toLocaleDateString('ru-RU')}`,
      tone: expired ? 'red' : 'slate',
    })
  }
  if (link.maxClicks != null) {
    const reached = link.clicks >= link.maxClicks
    badges.push({ text: `лимит ${link.clicks}/${link.maxClicks}`, tone: reached ? 'red' : 'slate' })
  }
  if (link.custom) {
    badges.push({ text: 'алиас', tone: 'indigo' })
  }
  return badges
}

export const BADGE_CLASS: Record<BadgeTone, string> = {
  slate: 'bg-slate-100 text-slate-600',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  green: 'bg-green-100 text-green-700',
}
