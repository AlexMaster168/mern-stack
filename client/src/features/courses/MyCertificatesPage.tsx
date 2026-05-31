import { Link as RouterLink } from 'react-router-dom'
import { useMyCertificates } from './certificate.hooks'
import { Loader } from '../../components/Loader'

export function MyCertificatesPage() {
  const { data: certs, isLoading } = useMyCertificates()

  if (isLoading) return <Loader />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Мои сертификаты</h1>

      {certs && certs.length === 0 && (
        <p className="text-slate-500">
          Сертификатов пока нет. Завершите курс (пройдите все уроки), чтобы получить.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {certs?.map((cert) => {
          const title = typeof cert.course === 'object' ? cert.course.title : 'Курс'
          return (
            <RouterLink
              key={cert._id}
              to={`/verify/${cert.certificateId}`}
              className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:ring-indigo-300"
            >
              <div className="text-3xl">🎓</div>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 font-mono text-sm text-slate-500">{cert.certificateId}</p>
              <p className="text-xs text-slate-400">
                {new Date(cert.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </RouterLink>
          )
        })}
      </div>
    </div>
  )
}
