import dns from 'node:dns'
import mongoose from 'mongoose'
import { env } from './env.js'
import { logger } from '../utils/logger.js'

/** Подключение к MongoDB. Mongoose 8 не требует устаревших опций (useNewUrlParser и пр.). */
export async function connectDB(): Promise<void> {
  // Если системный DNS не резолвит SRV-записи Atlas — переопределяем серверы
  if (env.DNS_SERVERS.length > 0) {
    dns.setServers(env.DNS_SERVERS)
    logger.info(`DNS-серверы переопределены: ${env.DNS_SERVERS.join(', ')}`)
  }

  mongoose.set('strictQuery', true)

  mongoose.connection.on('error', (err) => logger.error(err, 'Ошибка соединения с MongoDB'))
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB отключена'))

  await mongoose.connect(env.MONGO_URI)
  logger.info('✅ MongoDB подключена')
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
}
