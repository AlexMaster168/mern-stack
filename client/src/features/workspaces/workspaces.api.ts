import { api } from '../../lib/api'
import type { WorkspaceDetail, WorkspaceMember, WorkspaceSummary } from '../../types'

export type MemberRole = 'editor' | 'viewer'

export async function fetchWorkspaces(): Promise<WorkspaceSummary[]> {
  const { data } = await api.get<WorkspaceSummary[]>('/workspaces')
  return data
}

export async function fetchWorkspace(id: string): Promise<WorkspaceDetail> {
  const { data } = await api.get<WorkspaceDetail>(`/workspaces/${id}`)
  return data
}

export async function createWorkspace(name: string): Promise<{ _id: string; name: string }> {
  const { data } = await api.post<{ _id: string; name: string }>('/workspaces', { name })
  return data
}

export async function renameWorkspace(id: string, name: string): Promise<void> {
  await api.patch(`/workspaces/${id}`, { name })
}

export async function deleteWorkspace(id: string): Promise<void> {
  await api.delete(`/workspaces/${id}`)
}

export async function addMember(
  id: string,
  email: string,
  role: MemberRole,
): Promise<WorkspaceMember> {
  const { data } = await api.post<WorkspaceMember>(`/workspaces/${id}/members`, { email, role })
  return data
}

export async function updateMember(id: string, userId: string, role: MemberRole): Promise<void> {
  await api.patch(`/workspaces/${id}/members/${userId}`, { role })
}

export async function removeMember(id: string, userId: string): Promise<void> {
  await api.delete(`/workspaces/${id}/members/${userId}`)
}
