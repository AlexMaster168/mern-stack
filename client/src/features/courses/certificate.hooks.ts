import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as certApi from './certificate.api'

export function useMyCertificates() {
  return useQuery({ queryKey: ['certificates'], queryFn: certApi.fetchMyCertificates })
}

export function useIssueCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: certApi.issueCertificate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certificates'] }),
  })
}

export function useVerifyCertificate(certificateId: string) {
  return useQuery({
    queryKey: ['certificate', certificateId],
    queryFn: () => certApi.verifyCertificate(certificateId),
    enabled: Boolean(certificateId),
    retry: false,
  })
}
