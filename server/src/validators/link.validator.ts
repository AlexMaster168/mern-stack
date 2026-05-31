import { z } from 'zod'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Некорректный идентификатор')
const alias = z
  .string()
  .regex(/^[a-zA-Z0-9_-]{3,32}$/, 'Алиас: 3–32 символа из латиницы, цифр, «-» и «_»')

export const generateLinkSchema = z.object({
  from: z.url('Некорректный URL'),
  alias: alias.optional(),
  // ISO-строка → Date; null снимает ограничение
  expiresAt: z.coerce.date().nullable().optional(),
  maxClicks: z.coerce.number().int().positive().nullable().optional(),
  password: z.string().min(1).max(100).optional(),
  workspaceId: objectId.nullable().optional(),
})

export const updateLinkSchema = z.object({
  from: z.url('Некорректный URL').optional(),
  alias: alias.optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  maxClicks: z.coerce.number().int().positive().nullable().optional(),
  // '' или null — снять пароль; непустая строка — установить
  password: z.string().max(100).nullable().optional(),
  disabled: z.boolean().optional(),
})

export const unlockSchema = z.object({
  password: z.string().max(100).optional(),
})

export const linkIdSchema = z.object({
  id: objectId,
})

export const codeParamSchema = z.object({
  code: z.string().min(1).max(64),
})

export type GenerateLinkInput = z.infer<typeof generateLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
export type UnlockInput = z.infer<typeof unlockSchema>
