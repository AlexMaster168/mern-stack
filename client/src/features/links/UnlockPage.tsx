import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { unlockLink } from './links.api'

export function UnlockPage() {
  const { code } = useParams<{ code: string }>()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { from } = await unlockLink(code ?? '', password)
      // Внешний редирект на оригинальный адрес
      window.location.href = from
    } catch (err) {
      const message =
        err instanceof AxiosError ? (err.response?.data?.message as string | undefined) : undefined
      setError(message ?? 'Не удалось открыть ссылку')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mb-3 text-4xl">🔒</div>
        <h1 className="text-xl font-bold">Ссылка защищена паролем</h1>
        <p className="mt-1 text-sm text-slate-500">Введите пароль, чтобы перейти по ссылке.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Проверяем…' : 'Перейти'}
          </button>
        </form>
      </div>
    </div>
  )
}
