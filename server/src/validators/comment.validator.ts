import { z } from 'zod'

export const createCommentSchema = z.object({
  text: z.string().min(1, 'Комментарий не может быть пустым').max(2000),
  rating: z.number().int().min(1).max(5).optional(),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
