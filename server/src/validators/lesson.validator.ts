import { z } from 'zod'
import { objectId } from './common.js'
import { contentBlockSchema } from './course.validator.js'

export const createLessonSchema = z.object({
  title: z.string().min(1).max(200),
  module: objectId.optional(),
  content: z.array(contentBlockSchema).optional(),
  videoUrl: z.string().optional(),
  order: z.number().int().optional(),
  duration: z.number().int().nonnegative().optional(),
})

export const updateLessonSchema = createLessonSchema.partial()

export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
