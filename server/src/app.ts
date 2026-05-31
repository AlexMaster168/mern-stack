import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { env, isProd } from './config/env.js'
import { loggerOptions } from './utils/logger.js'
import { setupAuth } from './plugins/auth.js'
import { registerErrorHandler, sendNotFound } from './plugins/errorHandler.js'
import { serveClient } from './plugins/serveClient.js'
import { authRoutes } from './routes/auth.routes.js'
import { linkRoutes } from './routes/link.routes.js'
import { workspaceRoutes } from './routes/workspace.routes.js'
import { redirectRoutes } from './routes/redirect.routes.js'
import { courseRoutes } from './routes/course.routes.js'
import { enrollmentRoutes } from './routes/enrollment.routes.js'
import { commentRoutes } from './routes/comment.routes.js'
import { uploadRoutes } from './routes/upload.routes.js'
import { quizRoutes } from './routes/quiz.routes.js'
import { certificateRoutes } from './routes/certificate.routes.js'
import { UPLOADS_DIR } from './services/upload.service.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: loggerOptions })

  // zod как движок валидации и сериализации схем
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // Безопасность и инфраструктура
  await app.register(helmet)
  await app.register(cors, { origin: env.CLIENT_URL, credentials: true })
  await app.register(cookie)
  await app.register(rateLimit, {
    max: 300,
    timeWindow: '15 minutes',
  })
  await app.register(jwt, { secret: env.JWT_SECRET })
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } }) // до 5 МБ
  await app.register(fastifyStatic, { root: UPLOADS_DIR, prefix: '/uploads/' })

  // Декораторы авторизации + обработчик ошибок (на корневом инстансе)
  setupAuth(app)
  registerErrorHandler(app)

  app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // Маршруты
  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(linkRoutes, { prefix: '/api/link' })
  await app.register(workspaceRoutes, { prefix: '/api' })
  await app.register(courseRoutes, { prefix: '/api/courses' })
  await app.register(enrollmentRoutes, { prefix: '/api' })
  await app.register(commentRoutes, { prefix: '/api' })
  await app.register(quizRoutes, { prefix: '/api' })
  await app.register(certificateRoutes, { prefix: '/api' })
  await app.register(uploadRoutes, { prefix: '/api' })
  await app.register(redirectRoutes, { prefix: '/t' })

  // В проде Fastify отдаёт собранный SPA (single-image деплой) и сам ставит 404-обработчик
  // с SPA-fallback. В dev/test 404 — обычный JSON.
  if (isProd) {
    await serveClient(app)
  } else {
    app.setNotFoundHandler(sendNotFound)
  }

  return app
}
