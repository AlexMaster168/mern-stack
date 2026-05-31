import { useParams } from 'react-router-dom'
import { useVerifyCertificate } from './certificate.hooks'
import { Loader } from '../../components/Loader'

export function CertificateVerifyPage() {
  const { certificateId } = useParams<{ certificateId: string }>()
  const { data: cert, isLoading, isError } = useVerifyCertificate(certificateId ?? '')

  if (isLoading) return <Loader />

  if (isError || !cert) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
        <p className="text-red-600">❌ Сертификат не найден или недействителен</p>
      </div>
    )
  }

  const courseTitle = typeof cert.course === 'object' ? cert.course.title : 'Курс'
  const userName =
    cert.user && typeof cert.user === 'object' ? cert.user.name || cert.user.email : 'Студент'

  return (
    <div className="mx-auto max-w-lg rounded-2xl border-4 border-double border-indigo-200 bg-white p-10 text-center">
      <div className="text-5xl">🎓</div>
      <h1 className="mt-4 text-2xl font-bold">Сертификат подтверждён</h1>
      <p className="mt-6 text-slate-600">Настоящим подтверждается, что</p>
      <p className="text-xl font-semibold">{userName}</p>
      <p className="mt-2 text-slate-600">успешно завершил курс</p>
      <p className="text-xl font-semibold text-indigo-600">«{courseTitle}»</p>
      <p className="mt-8 font-mono text-sm text-slate-400">ID: {cert.certificateId}</p>
      <p className="text-xs text-slate-400">
        Выдан {new Date(cert.createdAt).toLocaleDateString('ru-RU')}
      </p>
    </div>
  )
}
