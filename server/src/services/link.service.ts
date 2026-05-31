import bcrypt from 'bcryptjs'
import { customAlphabet } from 'nanoid'
import { LinkModel, type LinkDocument } from '../models/Link.js'
import { ClickEventModel } from '../models/ClickEvent.js'
import { UserModel, type UserRole } from '../models/User.js'
import type { WorkspaceRole } from '../models/Membership.js'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'
import { requireMembership } from './workspace.service.js'
import { parseUserAgent, refererHost } from '../utils/userAgent.js'

// URL-safe алфавит; 8 символов ≈ 218 трлн комбинаций — коллизии маловероятны
const generateCode = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  8,
)

const ALIAS_RE = /^[a-zA-Z0-9_-]{3,32}$/
// Чтобы кастомный алиас не перехватил служебные пути приложения
const RESERVED = new Set(['api', 'uploads', 'health', 'admin', 't'])

export interface CreateLinkInput {
  from: string
  alias?: string
  expiresAt?: Date | null
  maxClicks?: number | null
  password?: string
  workspaceId?: string | null
}

export interface UpdateLinkInput {
  from?: string
  alias?: string
  expiresAt?: Date | null
  maxClicks?: number | null
  // строка → установить пароль; null/'' → снять; undefined → не трогать
  password?: string | null
  disabled?: boolean
}

export interface PublicLink {
  _id: string
  from: string
  to: string
  code: string
  clicks: number
  owner: string
  workspace: string | null
  custom: boolean
  expiresAt: string | null
  maxClicks: number | null
  disabled: boolean
  hasPassword: boolean
  createdAt: string
  updatedAt: string
}

/** Безопасное представление ссылки для клиента: без хеша пароля, с флагом hasPassword. */
export function toPublicLink(link: LinkDocument): PublicLink {
  return {
    _id: link.id,
    from: link.from,
    to: link.to,
    code: link.code,
    clicks: link.clicks,
    owner: link.owner.toString(),
    workspace: link.workspace ? link.workspace.toString() : null,
    custom: link.custom,
    expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
    maxClicks: link.maxClicks ?? null,
    disabled: link.disabled,
    hasPassword: Boolean(link.passwordHash),
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
  }
}

function buildShortUrl(code: string): string {
  return `${env.APP_BASE_URL}/t/${code}`
}

async function assertCodeFree(code: string): Promise<void> {
  if (RESERVED.has(code.toLowerCase())) {
    throw ApiError.conflict('Этот алиас зарезервирован')
  }
  const exists = await LinkModel.exists({ code })
  if (exists) {
    throw ApiError.conflict('Такой алиас уже занят')
  }
}

/**
 * Проверяет доступ к ссылке. Командная — по членству (minRole), персональная — только владелец/админ.
 * Возвращает документ с подгруженным passwordHash (нужно для hasPassword и смены пароля).
 */
export async function requireLinkAccess(
  linkId: string,
  userId: string,
  role: UserRole,
  minRole: WorkspaceRole = 'viewer',
): Promise<LinkDocument> {
  const link = await LinkModel.findById(linkId).select('+passwordHash')
  if (!link) {
    throw ApiError.notFound('Ссылка не найдена')
  }
  if (link.workspace) {
    await requireMembership(link.workspace.toString(), userId, minRole)
  } else if (link.owner.toString() !== userId && role !== 'admin') {
    throw ApiError.forbidden('Это не ваша ссылка')
  }
  return link
}

export async function createLink(input: CreateLinkInput, ownerId: string): Promise<LinkDocument> {
  // Командная ссылка — нужно право editor+
  if (input.workspaceId) {
    await requireMembership(input.workspaceId, ownerId, 'editor')
  }

  let code: string
  let custom = false
  if (input.alias) {
    if (!ALIAS_RE.test(input.alias)) {
      throw ApiError.badRequest('Алиас: 3–32 символа из латиницы, цифр, «-» и «_»')
    }
    await assertCodeFree(input.alias)
    code = input.alias
    custom = true
  } else {
    code = generateCode()
    // На случай редкой коллизии — несколько повторов
    for (let i = 0; i < 5 && (await LinkModel.exists({ code })); i++) {
      code = generateCode()
    }
  }

  const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : null

  const link = await LinkModel.create({
    from: input.from,
    to: buildShortUrl(code),
    code,
    owner: ownerId,
    workspace: input.workspaceId ?? null,
    custom,
    expiresAt: input.expiresAt ?? null,
    maxClicks: input.maxClicks ?? null,
    passwordHash,
  })

  // Персональные ссылки трекаем в профиле пользователя (как было исторически)
  if (!input.workspaceId) {
    await UserModel.findByIdAndUpdate(ownerId, { $addToSet: { links: link._id } })
  }

  return link
}

/** Персональные ссылки пользователя (без команды). */
export async function getUserLinks(ownerId: string): Promise<LinkDocument[]> {
  return LinkModel.find({ owner: ownerId, workspace: null })
    .select('+passwordHash')
    .sort({ createdAt: -1 })
}

/** Ссылки команды (нужно членство). */
export async function getWorkspaceLinks(
  workspaceId: string,
  userId: string,
): Promise<LinkDocument[]> {
  await requireMembership(workspaceId, userId, 'viewer')
  return LinkModel.find({ workspace: workspaceId }).select('+passwordHash').sort({ createdAt: -1 })
}

export async function getLinkById(
  id: string,
  userId: string,
  role: UserRole,
): Promise<LinkDocument> {
  return requireLinkAccess(id, userId, role, 'viewer')
}

export async function updateLink(
  id: string,
  input: UpdateLinkInput,
  userId: string,
  role: UserRole,
): Promise<LinkDocument> {
  const link = await requireLinkAccess(id, userId, role, 'editor')

  if (input.from !== undefined) {
    link.from = input.from
  }
  if (input.alias !== undefined && input.alias !== link.code) {
    if (!ALIAS_RE.test(input.alias)) {
      throw ApiError.badRequest('Алиас: 3–32 символа из латиницы, цифр, «-» и «_»')
    }
    await assertCodeFree(input.alias)
    link.code = input.alias
    link.to = buildShortUrl(input.alias)
    link.custom = true
  }
  if (input.expiresAt !== undefined) {
    link.expiresAt = input.expiresAt
  }
  if (input.maxClicks !== undefined) {
    link.maxClicks = input.maxClicks
  }
  if (input.disabled !== undefined) {
    link.disabled = input.disabled
  }
  if (input.password !== undefined) {
    link.passwordHash = input.password ? await bcrypt.hash(input.password, 10) : null
  }

  await link.save()
  return link
}

export async function deleteLink(id: string, userId: string, role: UserRole): Promise<void> {
  const link = await requireLinkAccess(id, userId, role, 'editor')
  await Promise.all([
    ClickEventModel.deleteMany({ link: link._id }),
    UserModel.updateOne({ _id: link.owner }, { $pull: { links: link._id } }),
  ])
  await link.deleteOne()
}

// ── Редирект / разблокировка ─────────────────────────────────────────────────

export type RedirectStatus = 'ok' | 'password' | 'expired' | 'limit' | 'disabled' | 'notfound'
export type RedirectOutcome = { status: 'ok'; url: string } | { status: Exclude<RedirectStatus, 'ok'> }

export interface ClickContext {
  userAgent?: string
  referer?: string
  country?: string
}

function linkState(link: LinkDocument): 'ok' | 'expired' | 'limit' | 'disabled' {
  if (link.disabled) {
    return 'disabled'
  }
  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    return 'expired'
  }
  if (link.maxClicks != null && link.clicks >= link.maxClicks) {
    return 'limit'
  }
  return 'ok'
}

/** Пишет событие клика и инкрементит счётчик. */
async function registerClick(link: LinkDocument, ctx: ClickContext): Promise<void> {
  const ua = parseUserAgent(ctx.userAgent)
  await Promise.all([
    LinkModel.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }),
    ClickEventModel.create({
      link: link._id,
      referer: refererHost(ctx.referer),
      device: ua.device,
      browser: ua.browser,
      os: ua.os,
      country: ctx.country ?? '',
    }),
  ])
}

/** Резолвит код для редиректа. Если стоит пароль — возвращает 'password' без раскрытия URL. */
export async function resolveForRedirect(
  code: string,
  ctx: ClickContext,
): Promise<RedirectOutcome> {
  const link = await LinkModel.findOne({ code }).select('+passwordHash')
  if (!link) {
    return { status: 'notfound' }
  }
  const state = linkState(link)
  if (state !== 'ok') {
    return { status: state }
  }
  if (link.passwordHash) {
    return { status: 'password' }
  }
  await registerClick(link, ctx)
  return { status: 'ok', url: link.from }
}

/** Разблокировка по паролю: возвращает оригинальный URL и регистрирует клик. */
export async function unlockLink(
  code: string,
  password: string,
  ctx: ClickContext,
): Promise<{ from: string }> {
  const link = await LinkModel.findOne({ code }).select('+passwordHash')
  if (!link) {
    throw ApiError.notFound('Ссылка не найдена')
  }
  const state = linkState(link)
  if (state === 'expired') {
    throw ApiError.forbidden('Срок действия ссылки истёк')
  }
  if (state === 'limit') {
    throw ApiError.forbidden('Исчерпан лимит переходов')
  }
  if (state === 'disabled') {
    throw ApiError.forbidden('Ссылка отключена')
  }
  if (link.passwordHash) {
    const ok = await bcrypt.compare(password, link.passwordHash)
    if (!ok) {
      throw ApiError.badRequest('Неверный пароль')
    }
  }
  await registerClick(link, ctx)
  return { from: link.from }
}
