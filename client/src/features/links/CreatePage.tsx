import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useCreateLink } from './links.hooks'
import { useWorkspaces } from '../workspaces/workspaces.hooks'
import { localInputToIso } from './linkUtils'
import type { CreateLinkPayload } from './links.api'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

export function CreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createLink = useCreateLink()
  const { data: workspaces } = useWorkspaces()

  const editableWorkspaces = workspaces?.filter((w) => w.role !== 'viewer') ?? []

  const [from, setFrom] = useState('')
  const [workspaceId, setWorkspaceId] = useState(searchParams.get('workspace') ?? '')
  const [showOptions, setShowOptions] = useState(false)
  const [alias, setAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [maxClicks, setMaxClicks] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const payload: CreateLinkPayload = { from }
    if (workspaceId) payload.workspaceId = workspaceId
    if (alias.trim()) payload.alias = alias.trim()
    if (expiresAt) payload.expiresAt = localInputToIso(expiresAt)
    if (maxClicks) payload.maxClicks = Number(maxClicks)
    if (password) payload.password = password

    try {
      const link = await createLink.mutateAsync(payload)
      navigate(`/links/${link._id}`)
    } catch (err) {
      const message =
        err instanceof AxiosError ? (err.response?.data?.message as string | undefined) : undefined
      setError(message ?? 'Не удалось создать ссылку')
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Новая короткая ссылка</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Длинная ссылка</span>
          <input
            type="url"
            required
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="https://example.com/очень/длинный/путь"
            className={inputClass}
          />
        </label>

        {editableWorkspaces.length > 0 && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Куда сохранить</span>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className={inputClass}
            >
              <option value="">Личные ссылки</option>
              {editableWorkspaces.map((w) => (
                <option key={w._id} value={w._id}>
                  Команда: {w.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={() => setShowOptions((v) => !v)}
          className="text-sm text-indigo-600 hover:underline"
        >
          {showOptions ? '− Скрыть' : '+ Дополнительные настройки'}
        </button>

        {showOptions && (
          <div className="space-y-4 rounded-xl bg-slate-50 p-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Кастомный алиас
              </span>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="my-promo (3–32 символа: a-z, 0-9, - _)"
                className={inputClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Действует до
                </span>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Лимит переходов
                </span>
                <input
                  type="number"
                  min={1}
                  value={maxClicks}
                  onChange={(e) => setMaxClicks(e.target.value)}
                  placeholder="без лимита"
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Пароль</span>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="без пароля"
                className={inputClass}
              />
            </label>
          </div>
        )}

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={createLink.isPending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {createLink.isPending ? 'Создаём…' : 'Сократить'}
        </button>
      </form>
    </div>
  )
}
