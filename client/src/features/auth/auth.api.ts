import axios from 'axios'
import { api, setAccessToken } from '../../lib/api'
import type { AuthResponse, User } from '../../types'

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  setAccessToken(data.accessToken)
  return data.user
}

export async function register(email: string, password: string, name: string): Promise<void> {
  await api.post('/auth/register', { email, password, name })
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
  setAccessToken(null)
}

/** При старте приложения пробуем восстановить сессию по refresh-cookie. */
export async function bootstrapSession(): Promise<User | null> {
  try {
    const { data } = await axios.post<AuthResponse>('/api/auth/refresh', null, {
      withCredentials: true,
    })
    setAccessToken(data.accessToken)
    return data.user
  } catch {
    return null
  }
}
