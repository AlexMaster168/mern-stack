import { buildApp } from './app.js'
import { connectDB, disconnectDB } from './config/db.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'

async function bootstrap(): Promise<void> {
  await connectDB()

  const app = await buildApp()
  await app.listen({ port: env.PORT, host: '0.0.0.0' })

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} получен — останавливаюсь...`)
    await app.close()
    await disconnectDB()
    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

bootstrap().catch((err: unknown) => {
  logger.error(err, 'Не удалось запустить сервер')
  process.exit(1)
})
