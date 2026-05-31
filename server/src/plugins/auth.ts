import type { FastifyInstance, FastifyRequest } from 'fastify'
import { ApiError } from '../utils/ApiError.js'
import type { UserRole } from '../models/User.js'

/**
 * Регистрирует декораторы авторизации на корневом инстансе (наследуются всеми роутами):
 * - authenticate: проверяет access-токен (preHandler)
 * - requireRole:  ограничивает доступ по ролям
 */
export function setupAuth(app: FastifyInstance): void {
  app.decorate('authenticate', async (req: FastifyRequest) => {
    try {
      await req.jwtVerify()
    } catch {
      throw ApiError.unauthorized()
    }
  })

  app.decorate('requireRole', (...roles: UserRole[]) => {
    return async (req: FastifyRequest) => {
      if (!req.user || !roles.includes(req.user.role)) {
        throw ApiError.forbidden()
      }
    }
  })
}
