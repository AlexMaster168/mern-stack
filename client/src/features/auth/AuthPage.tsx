import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useAuth } from './AuthContext'

type Mode = 'login' | 'register'

export function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'register') {
        await register(email, password, name)
      }
      await login(email, password)
      navigate('/links')
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data?.message as string | undefined)
          : undefined
      setError(message ?? 'Что-то пошло не так, попробуйте снова')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="mb-1 text-2xl font-bold">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          {mode === 'login' ? 'Рады видеть снова' : 'Создайте аккаунт за минуту'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Field label="Имя">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Лёха"
                className={inputClass}
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </Field>
          <Field label="Пароль">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              className={inputClass}
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
          className="mt-4 w-full text-sm text-indigo-600 hover:underline"
        >
          {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}
