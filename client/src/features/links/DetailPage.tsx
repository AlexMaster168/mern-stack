import { useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useDeleteLink, useLink, useLinkStats, useUpdateLink } from './links.hooks'
import { useWorkspaces } from '../workspaces/workspaces.hooks'
import { useAuth } from '../auth/AuthContext'
import { QrCode } from './components/QrCode'
import { StatsChartsLazy } from './components/StatsChartsLazy'
import { BADGE_CLASS, isoToLocalInput, linkBadges, localInputToIso } from './linkUtils'
import type { UpdateLinkPayload } from './links.api'
import { Loader } from '../../components/Loader'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

type PwMode = 'keep' | 'set' | 'clear'

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const linkId = id ?? ''
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: link, isLoading, isError } = useLink(linkId)
  const { data: stats } = useLinkStats(linkId)
  const { data: workspaces } = useWorkspaces()
  const updateLink = useUpdateLink()
  const deleteLink = useDeleteLink()

  const [copied, setCopied] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Поля формы редактирования
  const [from, setFrom] = useState('')
  const [alias, setAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [maxClicks, setMaxClicks] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [pwMode, setPwMode] = useState<PwMode>('keep')
  const [password, setPassword] = useState('')

  if (isLoading) return <Loader />

  if (isError || !link) {
    return (
      <div className="space-y-3">
        <p className="text-slate-500">Ссылка не найдена.</p>
        <RouterLink to="/links" className="text-indigo-600 hover:underline">
          ← К списку
        </RouterLink>
      </div>
    )
  }

  const canEdit = link.workspace
    ? workspaces?.find((w) => w._id === link.workspace)?.role !== 'viewer' &&
      Boolean(workspaces?.find((w) => w._id === link.workspace))
    : link.owner === user?.id

  const copy = async () => {
    await navigator.clipboard.writeText(link.to)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const startEdit = () => {
    setFrom(link.from)
    setAlias(link.code)
    setExpiresAt(isoToLocalInput(link.expiresAt))
    setMaxClicks(link.maxClicks?.toString() ?? '')
    setDisabled(link.disabled)
    setPwMode('keep')
    setPassword('')
    setError(null)
    setEditMode(true)
  }

  const save = async () => {
    setError(null)
    const payload: UpdateLinkPayload = {
      from,
      expiresAt: localInputToIso(expiresAt),
      maxClicks: maxClicks ? Number(maxClicks) : null,
      disabled,
    }
    if (alias && alias !== link.code) payload.alias = alias
    if (pwMode === 'set' && password) payload.password = password
    else if (pwMode === 'clear') payload.password = ''

    try {
      await updateLink.mutateAsync({ id: linkId, payload })
      setEditMode(false)
    } catch (err) {
      const message =
        err instanceof AxiosError ? (err.response?.data?.message as string | undefined) : undefined
      setError(message ?? 'Не удалось сохранить')
    }
  }

  const remove = async () => {
    if (!window.confirm('Удалить ссылку безвозвратно?')) return
    await deleteLink.mutateAsync(linkId)
    navigate(link.workspace ? `/workspaces/${link.workspace}` : '/links')
  }

  const badges = linkBadges(link)

  return (
    <div className="space-y-6">
      <RouterLink
        to={link.workspace ? `/workspaces/${link.workspace}` : '/links'}
        className="text-sm text-indigo-600 hover:underline"
      >
        ← {link.workspace ? 'К команде' : 'К списку'}
      </RouterLink>

      {!editMode ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-500">Короткая ссылка</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <a
                  href={link.to}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-lg font-semibold text-indigo-600 hover:underline"
                >
                  {link.to}
                </a>
                <button
                  type="button"
                  onClick={copy}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-sm transition hover:bg-slate-200"
                >
                  {copied ? 'Скопировано ✓' : 'Копировать'}
                </button>
              </div>

              {badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {badges.map((b) => (
                    <span
                      key={b.text}
                      className={`rounded-full px-2.5 py-0.5 text-xs ${BADGE_CLASS[b.tone]}`}
                    >
                      {b.text}
                    </span>
                  ))}
                </div>
              )}

              <hr className="my-4 border-slate-100" />

              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm text-slate-500">Оригинал</dt>
                  <dd className="mt-1 break-all">
                    <a href={link.from} target="_blank" rel="noreferrer" className="hover:underline">
                      {link.from}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Переходов</dt>
                  <dd className="mt-1 text-2xl font-bold">{link.clicks}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Код</dt>
                  <dd className="mt-1 font-mono">{link.code}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Создана</dt>
                  <dd className="mt-1">{new Date(link.createdAt).toLocaleString('ru-RU')}</dd>
                </div>
              </dl>

              {canEdit && (
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium transition hover:bg-slate-200"
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={deleteLink.isPending}
                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>

            <QrCode value={link.to} fileName={`qr-${link.code}.png`} />
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold">Редактирование ссылки</h2>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Оригинал</span>
            <input type="url" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Алиас (код)</span>
            <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)} className={inputClass} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Действует до</span>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Лимит переходов</span>
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

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Пароль</span>
            <select value={pwMode} onChange={(e) => setPwMode(e.target.value as PwMode)} className={inputClass}>
              <option value="keep">{link.hasPassword ? 'Оставить текущий' : 'Без пароля'}</option>
              <option value="set">{link.hasPassword ? 'Сменить пароль' : 'Установить пароль'}</option>
              {link.hasPassword && <option value="clear">Снять пароль</option>}
            </select>
            {pwMode === 'set' && (
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Новый пароль"
                className={`mt-2 ${inputClass}`}
              />
            )}
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
            <span className="text-sm text-slate-700">Отключить ссылку</span>
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={updateLink.isPending}
              className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {updateLink.isPending ? 'Сохраняем…' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="rounded-lg bg-slate-100 px-5 py-2 font-medium transition hover:bg-slate-200"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-xl font-bold">Аналитика переходов</h2>
        {stats ? <StatsChartsLazy stats={stats} /> : <Loader />}
      </section>
    </div>
  )
}
