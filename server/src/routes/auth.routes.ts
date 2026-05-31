import type { FastifyInstance } from 'fastify'
import { loginSchema, registerSchema } from '../validators/auth.validator.js'
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js'
import * as authController from '../controllers/auth.controller.js'

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: RegisterInput }>(
    '/register',
    { schema: { body: registerSchema } },
    authController.register,
  )
  app.post<{ Body: LoginInput }>('/login', { schema: { body: loginSchema } }, authController.login)
  app.post('/refresh', authController.refresh)
  app.post('/logout', authController.logout)
  app.get('/me', { preHandler: [app.authenticate] }, authController.me)
}
