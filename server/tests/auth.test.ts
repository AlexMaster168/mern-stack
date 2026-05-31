import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'

let app: FastifyInstance

beforeAll(async () => {
  app = await buildApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

describe('auth', () => {
  it('регистрирует и логинит пользователя', async () => {
    const reg = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'a@a.com', password: 'secret123', name: 'A' },
    })
    expect(reg.statusCode).toBe(201)

    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'a@a.com', password: 'secret123' },
    })
    expect(login.statusCode).toBe(200)
    const body = login.json()
    expect(body.accessToken).toBeTruthy()
    expect(body.user.email).toBe('a@a.com')
    expect(body.user.role).toBe('student')
  })

  it('отклоняет неверный пароль', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'b@b.com', password: 'secret123' },
    })
    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'b@b.com', password: 'wrong-password' },
    })
    expect(login.statusCode).toBe(400)
  })

  it('валидирует входные данные и возвращает детали ошибок', async () => {
    const reg = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'not-an-email', password: '123' },
    })
    expect(reg.statusCode).toBe(400)
    const body = reg.json()
    expect(body.message).toBe('Ошибка валидации данных')
    expect(Array.isArray(body.errors)).toBe(true)
    expect(body.errors.length).toBeGreaterThan(0)
    expect(body.errors[0]).toHaveProperty('path')
    expect(body.errors[0]).toHaveProperty('message')
  })

  it('требует авторизацию на защищённом маршруте', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' })
    expect(res.statusCode).toBe(401)
  })
})
