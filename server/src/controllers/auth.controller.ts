import type { FastifyReply, FastifyRequest } from 'fastify'
import * as authService from '../services/auth.service.js'
import type { Identity } from '../services/auth.service.js'
import { ApiError } from '../utils/ApiError.js'
import { env, isProd } from '../config/env.js'
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js'

const REFRESH_COOKIE = 'refreshToken'

// Cookie виден только на эндпоинтах обновления/выхода
const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProd,
  path: '/api/auth',
  maxAge: env.REFRESH_TTL_DAYS * 86_400, // секунды
}

function signAccessToken(req: FastifyRequest, identity: Identity): string {
  return req.server.jwt.sign(
    { userId: identity.userId, role: identity.role },
    { expiresIn: env.JWT_ACCESS_TTL_MIN * 60 }, // @fastify/jwt трактует expiresIn как секунды
  )
}

export async function register(
  req: FastifyRequest<{ Body: RegisterInput }>,
  reply: FastifyReply,
): Promise<void> {
  const user = await authService.register(req.body)
  reply.code(201).send({ message: 'Пользователь создан', user })
}

export async function login(
  req: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply,
): Promise<void> {
  const { identity, user } = await authService.validateCredentials(req.body)
  const accessToken = signAccessToken(req, identity)
  const refresh = await authService.issueRefreshToken(identity.userId)
  reply.setCookie(REFRESH_COOKIE, refresh, refreshCookieOptions)
  reply.send({ accessToken, user })
}

export async function refresh(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const raw = req.cookies[REFRESH_COOKIE]
  if (!raw) {
    throw ApiError.unauthorized('Нет refresh-токена')
  }
  const { identity, user, newRaw } = await authService.rotateRefreshToken(raw)
  const accessToken = signAccessToken(req, identity)
  reply.setCookie(REFRESH_COOKIE, newRaw, refreshCookieOptions)
  reply.send({ accessToken, user })
}

export async function logout(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const raw = req.cookies[REFRESH_COOKIE]
  if (raw) {
    await authService.revokeRefreshToken(raw)
  }
  reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
  reply.send({ message: 'Вы вышли из системы' })
}

export async function me(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = await authService.getUserById(req.user.userId)
  reply.send({ user })
}
