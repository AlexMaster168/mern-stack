import { z } from 'zod'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Некорректный идентификатор')

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Укажите название').max(80),
})

export const renameWorkspaceSchema = createWorkspaceSchema

export const addMemberSchema = z.object({
  email: z.email('Некорректный email'),
  role: z.enum(['editor', 'viewer']),
})

export const updateMemberSchema = z.object({
  role: z.enum(['editor', 'viewer']),
})

export const workspaceIdSchema = z.object({
  id: objectId,
})

export const workspaceMemberParamsSchema = z.object({
  id: objectId,
  userId: objectId,
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type AddMemberInput = z.infer<typeof addMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
