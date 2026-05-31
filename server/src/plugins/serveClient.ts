import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'
import { env } from '../config/env.js'
import { sendNotFound } from './errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Пути, которые обслуживает бэкенд и которые НЕ должны уходить в SPA-fallback. */
function isBackendPath(url: string): boolean {
  return url.startsWith('/api') || url.startsWith('/t/') || url.startsWith('/uploads')
}

/**
 * Прод-режим: отдаём собранный SPA из client/dist одним инстансом с бэкендом.
 * Статика по '/', а любой неизвестный GET-путь (клиентские роуты) → index.html.
 * Регистрируется только если папка со сборкой существует.
 */
export async function serveClient(app: FastifyInstance): Promise<void> {
  // dist бэка лежит в server/dist → ../../client/dist; путь можно переопределить через env
  const clientDir = env.CLIENT_DIST_DIR ?? path.resolve(__dirname, '../../../client/dist')

  if (!existsSync(clientDir)) {
    app.log.warn(`Клиентская сборка не найдена (${clientDir}) — SPA не обслуживается`)
    return
  }

  await app.register(fastifyStatic, {
    root: clientDir,
    prefix: '/',
    // reply.sendFile уже задекорирован плагином для /uploads
    decorateReply: false,
  })

  app.setNotFoundHandler((req, reply) => {
    if (req.method !== 'GET' || isBackendPath(req.url)) {
      sendNotFound(req, reply)
      return
    }
    // Явный root, т.к. sendFile задекорирован uploads-инстансом
    void reply.sendFile('index.html', clientDir)
  })

  app.log.info(`SPA обслуживается из ${clientDir}`)
}
