import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { bearer, registerAndLogin } from './helpers.js'

let app: FastifyInstance

beforeAll(async () => {
  app = await buildApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

async function createLink(token: string, payload: Record<string, unknown>) {
  return app.inject({
    method: 'POST',
    url: '/api/link/generate',
    headers: bearer(token),
    payload,
  })
}

describe('links 2.0 — кастомные алиасы', () => {
  it('создаёт ссылку с кастомным алиасом и редиректит по нему', async () => {
    const { token } = await registerAndLogin(app, 'alias@l.com')
    const res = await createLink(token, { from: 'https://nodejs.org', alias: 'my-node' })
    expect(res.statusCode).toBe(201)
    const link = res.json().link
    expect(link.code).toBe('my-node')
    expect(link.custom).toBe(true)

    const redirect = await app.inject({ method: 'GET', url: '/t/my-node' })
    expect(redirect.statusCode).toBe(302)
    expect(redirect.headers.location).toBe('https://nodejs.org')
  })

  it('не отдаёт хеш пароля наружу, но проставляет hasPassword', async () => {
    const { token } = await registerAndLogin(app, 'pwflag@l.com')
    const res = await createLink(token, { from: 'https://example.com', password: 'topsecret' })
    expect(res.statusCode).toBe(201)
    const link = res.json().link
    expect(link.passwordHash).toBeUndefined()
    expect(link.hasPassword).toBe(true)
  })

  it('отклоняет занятый алиас (409)', async () => {
    const { token } = await registerAndLogin(app, 'dup@l.com')
    await createLink(token, { from: 'https://a.com', alias: 'taken-one' })
    const res = await createLink(token, { from: 'https://b.com', alias: 'taken-one' })
    expect(res.statusCode).toBe(409)
  })

  it('отклоняет некорректный алиас (400)', async () => {
    const { token } = await registerAndLogin(app, 'badalias@l.com')
    const res = await createLink(token, { from: 'https://a.com', alias: 'не валид!' })
    expect(res.statusCode).toBe(400)
  })
})

describe('links 2.0 — срок, лимит, пароль', () => {
  it('истёкшую ссылку не редиректит на оригинал, а отправляет на «недоступно»', async () => {
    const { token } = await registerAndLogin(app, 'expired@l.com')
    const past = new Date(Date.now() - 60_000).toISOString()
    const { link } = (await createLink(token, { from: 'https://a.com', expiresAt: past })).json()

    const redirect = await app.inject({ method: 'GET', url: `/t/${link.code}` })
    expect(redirect.statusCode).toBe(302)
    expect(redirect.headers.location).toContain('unavailable')
    expect(redirect.headers.location).toContain('expired')
  })

  it('соблюдает лимит переходов', async () => {
    const { token } = await registerAndLogin(app, 'limit@l.com')
    const { link } = (await createLink(token, { from: 'https://a.com', maxClicks: 1 })).json()

    const first = await app.inject({ method: 'GET', url: `/t/${link.code}` })
    expect(first.headers.location).toBe('https://a.com')

    const second = await app.inject({ method: 'GET', url: `/t/${link.code}` })
    expect(second.headers.location).toContain('limit')
  })

  it('ссылку с паролем отправляет на разблокировку, а unlock проверяет пароль', async () => {
    const { token } = await registerAndLogin(app, 'pw@l.com')
    const { link } = (
      await createLink(token, { from: 'https://secret.com', password: 'open-sesame' })
    ).json()

    const redirect = await app.inject({ method: 'GET', url: `/t/${link.code}` })
    expect(redirect.headers.location).toContain(`/unlock/${link.code}`)

    const wrong = await app.inject({
      method: 'POST',
      url: `/api/link/unlock/${link.code}`,
      payload: { password: 'nope' },
    })
    expect(wrong.statusCode).toBe(400)

    const right = await app.inject({
      method: 'POST',
      url: `/api/link/unlock/${link.code}`,
      payload: { password: 'open-sesame' },
    })
    expect(right.statusCode).toBe(200)
    expect(right.json().from).toBe('https://secret.com')
  })
})

describe('links 2.0 — редактирование и удаление', () => {
  it('владелец редактирует и удаляет ссылку, чужой — нет', async () => {
    const owner = await registerAndLogin(app, 'owner-edit@l.com')
    const stranger = await registerAndLogin(app, 'stranger-edit@l.com')
    const { link } = (await createLink(owner.token, { from: 'https://a.com' })).json()

    // чужой не видит
    const foreign = await app.inject({
      method: 'GET',
      url: `/api/link/${link._id}`,
      headers: bearer(stranger.token),
    })
    expect(foreign.statusCode).toBe(403)

    // владелец отключает ссылку
    const patched = await app.inject({
      method: 'PATCH',
      url: `/api/link/${link._id}`,
      headers: bearer(owner.token),
      payload: { disabled: true },
    })
    expect(patched.statusCode).toBe(200)
    expect(patched.json().disabled).toBe(true)

    // отключённая ссылка не работает
    const redirect = await app.inject({ method: 'GET', url: `/t/${link.code}` })
    expect(redirect.headers.location).toContain('disabled')

    // удаление
    const del = await app.inject({
      method: 'DELETE',
      url: `/api/link/${link._id}`,
      headers: bearer(owner.token),
    })
    expect(del.statusCode).toBe(200)
  })
})

describe('links 2.0 — аналитика', () => {
  it('собирает статистику кликов по устройствам/браузерам/рефереру', async () => {
    const { token } = await registerAndLogin(app, 'stats@l.com')
    const { link } = (await createLink(token, { from: 'https://a.com' })).json()

    await app.inject({
      method: 'GET',
      url: `/t/${link.code}`,
      headers: { 'user-agent': CHROME_UA, referer: 'https://twitter.com/post' },
    })
    await app.inject({
      method: 'GET',
      url: `/t/${link.code}`,
      headers: { 'user-agent': CHROME_UA, referer: 'https://twitter.com/post' },
    })

    const stats = await app.inject({
      method: 'GET',
      url: `/api/link/${link._id}/stats`,
      headers: bearer(token),
    })
    expect(stats.statusCode).toBe(200)
    const body = stats.json()
    expect(body.total).toBe(2)
    expect(body.byBrowser.some((p: { name: string }) => p.name === 'Chrome')).toBe(true)
    expect(body.byReferer.some((p: { name: string }) => p.name === 'twitter.com')).toBe(true)
    expect(body.byDay.length).toBeGreaterThanOrEqual(1)
  })
})
