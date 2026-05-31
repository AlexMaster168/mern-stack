import { Link as RouterLink, useSearchParams } from 'react-router-dom'

const FALLBACK = { icon: '🔍', text: 'Такой короткой ссылки не существует.' }

const REASONS: Record<string, { icon: string; text: string }> = {
  expired: { icon: '⌛', text: 'Срок действия этой ссылки истёк.' },
  limit: { icon: '🚫', text: 'Исчерпан лимит переходов по ссылке.' },
  disabled: { icon: '🚫', text: 'Ссылка отключена владельцем.' },
  notfound: FALLBACK,
}

export function LinkUnavailablePage() {
  const [searchParams] = useSearchParams()
  const reason = searchParams.get('reason') ?? 'notfound'
  const info = REASONS[reason] ?? FALLBACK

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mb-3 text-5xl">{info.icon}</div>
        <h1 className="text-xl font-bold">Ссылка недоступна</h1>
        <p className="mt-2 text-slate-500">{info.text}</p>
        <RouterLink
          to="/courses"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700"
        >
          На главную
        </RouterLink>
      </div>
    </div>
  )
}
