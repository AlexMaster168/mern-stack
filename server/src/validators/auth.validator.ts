import { z } from 'zod'

export const registerSchema = z.object({
  email: z.email('Некорректный email'),
  password: z.string().min(6, 'Минимальная длина пароля 6 символов'),
  name: z.string().trim().max(120).optional(),
})

export const loginSchema = z.object({
  email: z.email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
