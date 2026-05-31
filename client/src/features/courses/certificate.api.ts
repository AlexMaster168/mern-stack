import { api } from '../../lib/api'
import type { Certificate } from '../../types'

export async function issueCertificate(courseId: string): Promise<Certificate> {
  const { data } = await api.post<Certificate>(`/courses/${courseId}/certificate`)
  return data
}

export async function fetchMyCertificates(): Promise<Certificate[]> {
  const { data } = await api.get<Certificate[]>('/me/certificates')
  return data
}

export async function verifyCertificate(certificateId: string): Promise<Certificate> {
  const { data } = await api.get<Certificate>(`/certificates/${certificateId}`)
  return data
}
