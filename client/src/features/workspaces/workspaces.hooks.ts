import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as wsApi from './workspaces.api'
import type { MemberRole } from './workspaces.api'

export function useWorkspaces() {
  return useQuery({ queryKey: ['workspaces'], queryFn: wsApi.fetchWorkspaces })
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: ['workspaces', id],
    queryFn: () => wsApi.fetchWorkspace(id),
    enabled: Boolean(id),
  })
}

export function useCreateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: wsApi.createWorkspace,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['workspaces'] }),
  })
}

export function useRenameWorkspace(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => wsApi.renameWorkspace(id, name),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['workspaces'] })
      void qc.invalidateQueries({ queryKey: ['workspaces', id] })
    },
  })
}

export function useDeleteWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: wsApi.deleteWorkspace,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['workspaces'] }),
  })
}

export function useAddMember(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: MemberRole }) =>
      wsApi.addMember(id, email, role),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['workspaces', id] }),
  })
}

export function useUpdateMember(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: MemberRole }) =>
      wsApi.updateMember(id, userId, role),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['workspaces', id] }),
  })
}

export function useRemoveMember(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => wsApi.removeMember(id, userId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['workspaces', id] }),
  })
}
