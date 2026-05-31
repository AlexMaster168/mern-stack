import { pino, type LoggerOptions } from 'pino'
import { isDev } from '../config/env.js'

/**
 * Единый конфиг логгера. В dev — красивый цветной вывод через pino-pretty,
 * в проде — структурированный JSON. Один и тот же конфиг используют Fastify
 * (через опцию logger) и standalone-логгер (для кода вне HTTP-контекста: db, bootstrap).
 */
export const loggerOptions: LoggerOptions = isDev
  ? {
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
      },
    }
  : { level: 'info' }

export const logger = pino(loggerOptions)
