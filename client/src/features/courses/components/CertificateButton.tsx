import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { AxiosError } from 'axios'
import type { Certificate } from '../../../types'
import { useIssueCertificate } from '../certificate.hooks'

export function CertificateButton({ courseId }: { courseId: string }) {
  const issue = useIssueCertificate()
  const [cert, setCert] = useState<Certificate | null>(null)
  const [error, setError] = useState<string | null>(null)

  const get = async () => {
    setError(null)
    try {
      setCert(await issue.mutateAsync(courseId))
    } catch (err) {
      const msg =
        err instanceof AxiosError ? (err.response?.data?.message as string | undefined) : undefined
      setError(msg ?? 'Не удалось получить сертификат')
    }
  }

  if (cert) {
    return (
      <RouterLink
        to={`/verify/${cert.certificateId}`}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
      >
        🎓 Сертификат {cert.certificateId} — открыть
      </RouterLink>
    )
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={get}
        disabled={issue.isPending}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
      >
        {issue.isPending ? 'Выдаём…' : '🎓 Получить сертификат'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
