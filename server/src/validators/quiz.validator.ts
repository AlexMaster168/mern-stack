import { z } from 'zod'

const questionSchema = z
  .object({
    text: z.string().min(1, 'Текст вопроса обязателен'),
    options: z.array(z.string().min(1)).min(2, 'Минимум 2 варианта'),
    correctIndex: z.number().int().nonnegative(),
  })
  .refine((q) => q.correctIndex < q.options.length, {
    message: 'Правильный вариант вне диапазона',
    path: ['correctIndex'],
  })

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  questions: z.array(questionSchema).default([]),
})

export const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  questions: z.array(questionSchema).optional(),
})

export const attemptSchema = z.object({
  answers: z.array(z.number().int()),
})

export type CreateQuizInput = z.infer<typeof createQuizSchema>
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>
export type AttemptInput = z.infer<typeof attemptSchema>
