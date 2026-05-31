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

describe('links', () => {
  it('создаёт короткую ссылку и редиректит на оригинал', async () => {
    const { token } = await registerAndLogin(app, 'l@l.com')

    const create = await app.inject({
      method: 'POST',
      url: '/api/link/generate',
      headers: bearer(token),
      payload: { from: 'https://nodejs.org' },
    })
    expect(create.statusCode).toBe(201)
    const { code } = create.json().link

    const redirect = await app.inject({ method: 'GET', url: `/t/${code}` })
    expect(redirect.statusCode).toBe(302)
    expect(redirect.headers.location).toBe('https://nodejs.org')
  })

  it('требует авторизацию для списка ссылок', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/link' })
    expect(res.statusCode).toBe(401)
  })

  it('отклоняет некорректный URL', async () => {
    const { token } = await registerAndLogin(app, 'l2@l.com')
    const res = await app.inject({
      method: 'POST',
      url: '/api/link/generate',
      headers: bearer(token),
      payload: { from: 'не-урл' },
    })
    expect(res.statusCode).toBe(400)
  })
})
