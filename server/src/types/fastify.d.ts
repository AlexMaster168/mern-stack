import '@fastify/jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UserRole } from '../models/User.js'

/** Полезная нагрузка access-токена. */
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; role: UserRole }
    user: { userId: string; role: UserRole }
  }
}

/** Декораторы, которые мы добавляем к инстансу Fastify. */
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireRole: (
      ...roles: UserRole[]
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
