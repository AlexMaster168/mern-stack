import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

// Access-токен живёт только в памяти (не в localStorage — безопаснее от XSS).
let accessToken: string | null = null
export function setAccessToken(token: string | null): void {
  accessToken = token
}
export function getAccessToken(): string | null {
  return accessToken
}

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // отправляем httpOnly refresh-cookie
})

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Обновление access-токена по refresh-cookie. Сырой axios, чтобы не зациклить интерсепторы.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post<{ accessToken: string }>('/api/auth/refresh', null, {
      withCredentials: true,
    })
    accessToken = data.accessToken
    return accessToken
  } catch {
    accessToken = null
    return null
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    // На 401 один раз пробуем обновить токен и повторить запрос
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      const newToken = await refreshPromise
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
    }

    return Promise.reject(error)
  },
)
