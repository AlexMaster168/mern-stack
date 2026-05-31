import 'dotenv/config'
import { z } from 'zod'

/**
 * Типобезопасная схема переменных окружения.
 * Приложение не стартует, если что-то не так, — лучше упасть сразу, чем ловить undefined в рантайме.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1, 'MONGO_URI обязателен'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET должен быть минимум 16 символов'),
  // Access-токен живёт минутами, refresh — днями
  JWT_ACCESS_TTL_MIN: z.coerce.number().int().positive().default(15),
  REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
  // APP_BASE_URL, а не BASE_URL — последнее зарезервировано Vite/Vitest (ломает тесты)
  APP_BASE_URL: z.url().default('http://localhost:5000'),
  CLIENT_URL: z.url().default('http://localhost:5173'),
  // Прод: путь к собранному SPA (client/dist). Если не задан — берётся ../../client/dist
  CLIENT_DIST_DIR: z.string().optional(),
  // Опционально: переопределить DNS-серверы (список через запятую). Нужно, если системный
  // DNS (например, локальный резолвер на 127.0.0.1) не отвечает на SRV-запросы Atlas.
  DNS_SERVERS: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    ),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Некорректные переменные окружения:')
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = parsed.data
export const isProd = env.NODE_ENV === 'production'
export const isDev = env.NODE_ENV === 'development'
