import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useAddMember, useRemoveMember, useUpdateMember } from '../workspaces.hooks'
import { ROLE_LABEL } from '../roleLabels'
import type { MemberRole } from '../workspaces.api'
import type { WorkspaceMember } from '../../../types'

interface Props {
  workspaceId: string
  members: WorkspaceMember[]
  isOwner: boolean
  ownerId: string
  myUserId: string
}

const inputClass =
  'rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

function axiosMessage(err: unknown): string | undefined {
  return err instanceof AxiosError ? (err.response?.data?.message as string | undefined) : undefined
}

export function MembersSection({ workspaceId, members, isOwner, ownerId, myUserId }: Props) {
  const navigate = useNavigate()
  const addMember = useAddMember(workspaceId)
  const updateMember = useUpdateMember(workspaceId)
  const removeMember = useRemoveMember(workspaceId)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MemberRole>('viewer')
  const [error, setError] = useState<string | null>(null)

  const add = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await addMember.mutateAsync({ email: email.trim(), role })
      setEmail('')
    } catch (err) {
      setError(axiosMessage(err) ?? 'Не удалось добавить участника')
    }
  }

  const leave = async () => {
    if (!window.confirm('Покинуть команду?')) return
    await removeMember.mutateAsync(myUserId)
    navigate('/workspaces')
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Участники</h2>

      <ul className="divide-y divide-slate-100 rounded-xl bg-white ring-1 ring-slate-200">
        {members.map((m) => {
          const isWorkspaceOwner = m.userId === ownerId
          const editable = isOwner && !isWorkspaceOwner
          return (
            <li key={m.userId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.name || m.email}</p>
                <p className="truncate text-xs text-slate-500">{m.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {editable ? (
                  <>
                    <select
                      value={m.role}
                      onChange={(e) =>
                        updateMember.mutate({ userId: m.userId, role: e.target.value as MemberRole })
                      }
                      className={inputClass}
                    >
                      <option value="editor">редактор</option>
                      <option value="viewer">наблюдатель</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeMember.mutate(m.userId)}
                      className="rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-600 transition hover:bg-red-100"
                    >
                      Убрать
                    </button>
                  </>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                    {ROLE_LABEL[m.role]}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {isOwner ? (
        <form onSubmit={add} className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email участника"
              className={`flex-1 ${inputClass}`}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as MemberRole)}
              className={inputClass}
            >
              <option value="viewer">наблюдатель</option>
              <option value="editor">редактор</option>
            </select>
            <button
              type="submit"
              disabled={addMember.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              Добавить
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-slate-400">
            Добавить можно только уже зарегистрированного пользователя по его email.
          </p>
        </form>
      ) : (
        <button
          type="button"
          onClick={leave}
          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
        >
          Покинуть команду
        </button>
      )}
    </section>
  )
}
