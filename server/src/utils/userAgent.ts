import { UAParser } from 'ua-parser-js'

export interface ClientInfo {
  device: string
  browser: string
  os: string
}

/** Достаёт из User-Agent тип устройства / браузер / ОС. IP и сырой UA не сохраняем. */
export function parseUserAgent(ua: string | undefined): ClientInfo {
  if (!ua) {
    return { device: 'unknown', browser: 'unknown', os: 'unknown' }
  }
  const r = new UAParser(ua).getResult()
  return {
    // ua-parser возвращает undefined type для десктопа
    device: r.device.type ?? 'desktop',
    browser: r.browser.name ?? 'unknown',
    os: r.os.name ?? 'unknown',
  }
}

/** Нормализует Referer до хоста; пустой/битый → 'direct'. */
export function refererHost(referer: string | undefined): string {
  if (!referer) {
    return 'direct'
  }
  try {
    return new URL(referer).hostname || 'direct'
  } catch {
    return 'direct'
  }
}
