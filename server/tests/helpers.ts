import type { FastifyInstance } from 'fastify'
import { UserModel, type UserRole } from '../src/models/User.js'

interface LoginOptions {
  password?: string
  role?: UserRole
}

/** Регистрирует пользователя, при необходимости повышает роль и логинит — возвращает токен. */
export async function registerAndLogin(
  app: FastifyInstance,
  email: string,
  options: LoginOptions = {},
): Promise<{ token: string; userId: string }> {
  const password = options.password ?? 'secret123'

  await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { email, password, name: 'Test' },
  })

  if (options.role) {
    await UserModel.updateOne({ email }, { role: options.role })
  }

  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email, password },
  })
  const body = res.json() as { accessToken: string; user: { id: string } }
  return { token: body.accessToken, userId: body.user.id }
}

export function bearer(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` }
}
