import { api } from '../../lib/api'
import type { Link, LinkStats } from '../../types'

export interface CreateLinkPayload {
  from: string
  alias?: string
  expiresAt?: string | null
  maxClicks?: number | null
  password?: string
  workspaceId?: string | null
}

export interface UpdateLinkPayload {
  from?: string
  alias?: string
  expiresAt?: string | null
  maxClicks?: number | null
  // '' / null — снять пароль; строка — установить
  password?: string | null
  disabled?: boolean
}

export async function fetchLinks(): Promise<Link[]> {
  const { data } = await api.get<Link[]>('/link')
  return data
}

export async function fetchLink(id: string): Promise<Link> {
  const { data } = await api.get<Link>(`/link/${id}`)
  return data
}

export async function createLink(payload: CreateLinkPayload): Promise<Link> {
  const { data } = await api.post<{ link: Link }>('/link/generate', payload)
  return data.link
}

export async function updateLink(id: string, payload: UpdateLinkPayload): Promise<Link> {
  const { data } = await api.patch<Link>(`/link/${id}`, payload)
  return data
}

export async function deleteLink(id: string): Promise<void> {
  await api.delete(`/link/${id}`)
}

export async function fetchLinkStats(id: string): Promise<LinkStats> {
  const { data } = await api.get<LinkStats>(`/link/${id}/stats`)
  return data
}

export async function fetchWorkspaceLinks(workspaceId: string): Promise<Link[]> {
  const { data } = await api.get<Link[]>(`/workspaces/${workspaceId}/links`)
  return data
}

/** Публичная разблокировка ссылки по паролю. */
export async function unlockLink(code: string, password: string): Promise<{ from: string }> {
  const { data } = await api.post<{ from: string }>(`/link/unlock/${code}`, { password })
  return data
}
