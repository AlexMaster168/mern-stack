import { useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useCreateWorkspace, useWorkspaces } from './workspaces.hooks'
import { ROLE_LABEL } from './roleLabels'
import { Loader } from '../../components/Loader'

export function WorkspacesPage() {
  const { data: workspaces, isLoading, isError } = useWorkspaces()
  const createWs = useCreateWorkspace()
  const [name, setName] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await createWs.mutateAsync(name.trim())
    setName('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Команды</h1>
        <p className="mt-1 text-sm text-slate-500">
          Общие ссылки и совместная работа: приглашайте участников и управляйте ролями.
        </p>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название новой команды"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={createWs.isPending || !name.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          + Создать
        </button>
      </form>

      {isLoading && <Loader />}
      {isError && <p className="text-red-600">Не удалось загрузить команды</p>}

      {workspaces && workspaces.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Команд пока нет. Создайте первую!
        </div>
      )}

      {workspaces && workspaces.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {workspaces.map((w) => (
            <RouterLink
              key={w._id}
              to={`/workspaces/${w._id}`}
              className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{w.name}</h2>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                  {ROLE_LABEL[w.role]}
                </span>
              </div>
              <div className="mt-3 flex gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-slate-100 px-2 py-0.5">👥 {w.memberCount}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5">🔗 {w.linkCount}</span>
              </div>
            </RouterLink>
          ))}
        </div>
      )}
    </div>
  )
}
