import type { IncomingHttpHeaders } from 'node:http'
import type { ClickContext } from '../services/link.service.js'

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

/** Собирает контекст клика из заголовков запроса (для аналитики переходов). */
export function clickContextFromHeaders(headers: IncomingHttpHeaders): ClickContext {
  return {
    userAgent: headers['user-agent'],
    referer: headers.referer,
    // cf-ipcountry проставляет Cloudflare в проде; локально его нет
    country: first(headers['cf-ipcountry']) ?? '',
  }
}
