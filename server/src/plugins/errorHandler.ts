import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { isProd } from '../config/env.js'

/** Централизованная обработка ошибок и 404 для Fastify. */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((err: FastifyError, req, reply) => {
    // Ошибки валидации схем (zod через fastify-type-provider-zod)
    if (hasZodFastifySchemaValidationErrors(err)) {
      reply.code(400).send({
        message: 'Ошибка валидации данных',
        errors: err.validation.map((v) => ({
          path: v.instancePath.replace(/^\//, ''),
          message: v.message ?? 'Некорректное значение',
        })),
      })
      return
    }

    // Наши прикладные ошибки
    if (err instanceof ApiError) {
      reply.code(err.statusCode).send({
        message: err.message,
        ...(err.details ? { errors: err.details } : {}),
      })
      return
    }

    // Ручной парсинг zod (на случай вызова .parse вне схемы)
    if (err instanceof ZodError) {
      reply.code(400).send({
        message: 'Ошибка валидации данных',
        errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      })
      return
    }

    // Дубликат уникального ключа MongoDB
    if (err instanceof mongoose.mongo.MongoServerError && Number(err.code) === 11000) {
      reply.code(409).send({ message: 'Запись с такими данными уже существует' })
      return
    }

    if (err instanceof mongoose.Error.CastError) {
      reply.code(400).send({ message: 'Некорректный идентификатор' })
      return
    }

    // Превышение лимита запросов (выставляется @fastify/rate-limit)
    if (err.statusCode === 429) {
      reply.code(429).send({ message: 'Слишком много запросов, попробуйте позже' })
      return
    }

    req.log.error(err)
    const status = err.statusCode ?? 500
    reply.code(status).send({
      message: isProd ? 'Что-то пошло не так, попробуйте снова' : (err.message ?? 'Ошибка сервера'),
    })
  })

  // 404-обработчик ставится отдельно: в проде это делает serveClient (с SPA-fallback),
  // в dev/test — app.ts через sendNotFound. На одном инстансе он может быть только один.
}

/** Стандартный JSON-ответ 404. Используется и в dev, и для бэкенд-путей в проде. */
export function sendNotFound(req: FastifyRequest, reply: FastifyReply): void {
  reply.code(404).send({ message: `Маршрут не найден: ${req.method} ${req.url}` })
}
