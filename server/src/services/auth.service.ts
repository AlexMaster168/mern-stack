import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { UserModel, type UserDocument, type UserRole } from '../models/User.js'
import { RefreshTokenModel } from '../models/RefreshToken.js'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js'

export interface PublicUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Identity {
  userId: string
  role: UserRole
}

function toPublicUser(user: UserDocument): PublicUser {
  return { id: user.id, email: user.email, name: user.name ?? '', role: user.role as UserRole }
}

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export async function register(input: RegisterInput): Promise<PublicUser> {
  const existing = await UserModel.findOne({ email: input.email })
  if (existing) {
    throw ApiError.conflict('Такой пользователь уже существует')
  }
  const password = await bcrypt.hash(input.password, 12)
  const user = await UserModel.create({ email: input.email, password, name: input.name ?? '' })
  return toPublicUser(user)
}

export async function validateCredentials(
  input: LoginInput,
): Promise<{ identity: Identity; user: PublicUser }> {
  const user = await UserModel.findOne({ email: input.email }).select('+password')
  if (!user) {
    throw ApiError.badRequest('Пользователь не найден')
  }
  const isMatch = await bcrypt.compare(input.password, user.password)
  if (!isMatch) {
    throw ApiError.badRequest('Неверный пароль, попробуйте снова')
  }
  return {
    identity: { userId: user.id, role: user.role as UserRole },
    user: toPublicUser(user),
  }
}

export async function getUserById(id: string): Promise<PublicUser> {
  const user = await UserModel.findById(id)
  if (!user) {
    throw ApiError.unauthorized()
  }
  return toPublicUser(user)
}

/** Создаёт refresh-токен, сохраняет его хеш в БД и возвращает СЫРОЙ токен (его кладём в cookie). */
export async function issueRefreshToken(userId: string): Promise<string> {
  const raw = crypto.randomBytes(40).toString('hex')
  const expiresAt = new Date(Date.now() + env.REFRESH_TTL_DAYS * 86_400_000)
  await RefreshTokenModel.create({ user: userId, tokenHash: hashToken(raw), expiresAt })
  return raw
}

/** Проверяет refresh-токен, отзывает старый и выдаёт новый (ротация). */
export async function rotateRefreshToken(
  raw: string,
): Promise<{ identity: Identity; user: PublicUser; newRaw: string }> {
  const stored = await RefreshTokenModel.findOne({ tokenHash: hashToken(raw) })
  if (!stored || stored.expiresAt.getTime() < Date.now()) {
    if (stored) await stored.deleteOne()
    throw ApiError.unauthorized('Сессия истекла, войдите снова')
  }

  const user = await UserModel.findById(stored.user)
  if (!user) {
    await stored.deleteOne()
    throw ApiError.unauthorized()
  }

  // Ротация: старый токен одноразовый
  await stored.deleteOne()
  const newRaw = await issueRefreshToken(user.id)

  return {
    identity: { userId: user.id, role: user.role as UserRole },
    user: toPublicUser(user),
    newRaw,
  }
}

export async function revokeRefreshToken(raw: string): Promise<void> {
  await RefreshTokenModel.deleteOne({ tokenHash: hashToken(raw) })
}
