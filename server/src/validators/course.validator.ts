import { z } from 'zod'

export const contentBlockSchema = z.object({
  type: z.enum(['text', 'image', 'chart']),
  value: z.string().optional(),
  url: z.string().optional(),
  caption: z.string().optional(),
  chartType: z.enum(['bar', 'line', 'pie']).optional(),
  data: z.unknown().optional(),
})

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Минимум 3 символа').max(200),
  summary: z.string().max(500).optional(),
  category: z.string().max(60).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  contentBlocks: z.array(contentBlockSchema).optional(),
})

export const updateCourseSchema = createCourseSchema.partial()

export const moduleInputSchema = z.object({
  title: z.string().min(1).max(200),
  order: z.number().int().optional(),
})

export const publishSchema = z.object({
  publish: z.boolean(),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type ModuleInput = z.infer<typeof moduleInputSchema>
