import { useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useDeleteWorkspace, useRenameWorkspace, useWorkspace } from './workspaces.hooks'
import { useWorkspaceLinks } from '../links/links.hooks'
import { MembersSection } from './components/MembersSection'
import { LinksList } from '../links/components/LinksList'
import { useAuth } from '../auth/AuthContext'
import { Loader } from '../../components/Loader'

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const wsId = id ?? ''
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: ws, isLoading, isError } = useWorkspace(wsId)
  const { data: links } = useWorkspaceLinks(wsId)
  const renameWs = useRenameWorkspace(wsId)
  const deleteWs = useDeleteWorkspace()

  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState('')

  if (isLoading) return <Loader />

  if (isError || !ws) {
    return (
      <div className="space-y-3">
        <p className="text-slate-500">Команда не найдена.</p>
        <RouterLink to="/workspaces" className="text-indigo-600 hover:underline">
          ← К командам
        </RouterLink>
      </div>
    )
  }

  const isOwner = ws.myRole === 'owner'
  const canCreate = ws.myRole !== 'viewer'

  const doRename = async () => {
    if (!name.trim()) return
    await renameWs.mutateAsync(name.trim())
    setRenaming(false)
  }

  const doDelete = async () => {
    if (!window.confirm('Удалить команду со всеми её ссылками?')) return
    await deleteWs.mutateAsync(wsId)
    navigate('/workspaces')
  }

  return (
    <div className="space-y-8">
      <RouterLink to="/workspaces" className="text-sm text-indigo-600 hover:underline">
        ← К командам
      </RouterLink>

      <header className="flex flex-wrap items-center justify-between gap-3">
        {renaming ? (
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              defaultValue={ws.name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="button"
              onClick={doRename}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setRenaming(false)}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200"
            >
              Отмена
            </button>
          </div>
        ) : (
          <h1 className="text-2xl font-bold">{ws.name}</h1>
        )}

        {isOwner && !renaming && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setName(ws.name)
                setRenaming(true)
              }}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-200"
            >
              Переименовать
            </button>
            <button
              type="button"
              onClick={doDelete}
              disabled={deleteWs.isPending}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              Удалить команду
            </button>
          </div>
        )}
      </header>

      <MembersSection
        workspaceId={wsId}
        members={ws.members}
        isOwner={isOwner}
        ownerId={ws.ownerId}
        myUserId={user?.id ?? ''}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Ссылки команды</h2>
          {canCreate && (
            <RouterLink
              to={`/create?workspace=${wsId}`}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              + Создать ссылку
            </RouterLink>
          )}
        </div>
        {links ? <LinksList links={links} /> : <Loader />}
      </section>
    </div>
  )
}
