import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as linksApi from './links.api'
import type { UpdateLinkPayload } from './links.api'

export function useLinks() {
  return useQuery({ queryKey: ['links'], queryFn: linksApi.fetchLinks })
}

export function useLink(id: string) {
  return useQuery({
    queryKey: ['links', id],
    queryFn: () => linksApi.fetchLink(id),
    enabled: Boolean(id),
    // Счётчик переходов меняется часто — на детальной странице всегда показываем свежее
    staleTime: 0,
  })
}

export function useLinkStats(id: string) {
  return useQuery({
    queryKey: ['links', id, 'stats'],
    queryFn: () => linksApi.fetchLinkStats(id),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useWorkspaceLinks(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'links'],
    queryFn: () => linksApi.fetchWorkspaceLinks(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useCreateLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: linksApi.createLink,
    onSuccess: (link) => {
      void qc.invalidateQueries({ queryKey: ['links'] })
      if (link.workspace) {
        void qc.invalidateQueries({ queryKey: ['workspaces', link.workspace, 'links'] })
      }
    },
  })
}

export function useUpdateLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLinkPayload }) =>
      linksApi.updateLink(id, payload),
    onSuccess: (link) => {
      void qc.invalidateQueries({ queryKey: ['links'] })
      void qc.invalidateQueries({ queryKey: ['links', link._id] })
      if (link.workspace) {
        void qc.invalidateQueries({ queryKey: ['workspaces', link.workspace, 'links'] })
      }
    },
  })
}

export function useDeleteLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: linksApi.deleteLink,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['links'] })
      void qc.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}
