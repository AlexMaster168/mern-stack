import { createContext, use, useEffect, useState, type ReactNode } from 'react'
import type { User } from '../../types'
import * as authApi from './auth.api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void authApi.bootstrapSession().then((restored) => {
      setUser(restored)
      setLoading(false)
    })
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    login: async (email, password) => {
      setUser(await authApi.login(email, password))
    },
    register: async (email, password, name) => {
      await authApi.register(email, password, name)
    },
    logout: async () => {
      await authApi.logout()
      setUser(null)
    },
  }

  // React 19: Context можно использовать как провайдер напрямую
  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  // React 19: use() читает контекст
  const ctx = use(AuthContext)
  if (!ctx) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return ctx
}
