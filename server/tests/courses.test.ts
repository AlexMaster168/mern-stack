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

async function createPublishedCourse(token: string): Promise<string> {
  const create = await app.inject({
    method: 'POST',
    url: '/api/courses',
    headers: bearer(token),
    payload: { title: 'Тестовый курс' },
  })
  const id = create.json()._id as string
  await app.inject({
    method: 'PATCH',
    url: `/api/courses/${id}/publish`,
    headers: bearer(token),
    payload: { publish: true },
  })
  return id
}

describe('курсы и роли', () => {
  it('студент не может создать курс (403)', async () => {
    const student = await registerAndLogin(app, 'stud@c.com')
    const res = await app.inject({
      method: 'POST',
      url: '/api/courses',
      headers: bearer(student.token),
      payload: { title: 'Курс студента' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('преподаватель создаёт и публикует курс', async () => {
    const inst = await registerAndLogin(app, 'inst@c.com', { role: 'instructor' })
    const courseId = await createPublishedCourse(inst.token)

    const list = await app.inject({ method: 'GET', url: '/api/courses' })
    expect(list.statusCode).toBe(200)
    expect(list.json()).toHaveLength(1)
  })
})

describe('комментарии: правило доступа', () => {
  it('НЕ записанный на курс пользователь не может комментировать (403)', async () => {
    const inst = await registerAndLogin(app, 'inst2@c.com', { role: 'instructor' })
    const courseId = await createPublishedCourse(inst.token)

    const student = await registerAndLogin(app, 'outsider@c.com')
    const res = await app.inject({
      method: 'POST',
      url: `/api/courses/${courseId}/comments`,
      headers: bearer(student.token),
      payload: { text: 'Хочу прокомментировать!' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('записанный на курс пользователь может комментировать (201)', async () => {
    const inst = await registerAndLogin(app, 'inst3@c.com', { role: 'instructor' })
    const courseId = await createPublishedCourse(inst.token)

    const student = await registerAndLogin(app, 'enrolled@c.com')
    const enroll = await app.inject({
      method: 'POST',
      url: `/api/courses/${courseId}/enroll`,
      headers: bearer(student.token),
    })
    expect(enroll.statusCode).toBe(201)

    const comment = await app.inject({
      method: 'POST',
      url: `/api/courses/${courseId}/comments`,
      headers: bearer(student.token),
      payload: { text: 'Отличный курс!', rating: 5 },
    })
    expect(comment.statusCode).toBe(201)

    const list = await app.inject({ method: 'GET', url: `/api/courses/${courseId}/comments` })
    expect(list.json()).toHaveLength(1)
    expect(list.json()[0].text).toBe('Отличный курс!')
  })

  it('неавторизованный не может комментировать (401)', async () => {
    const inst = await registerAndLogin(app, 'inst4@c.com', { role: 'instructor' })
    const courseId = await createPublishedCourse(inst.token)

    const res = await app.inject({
      method: 'POST',
      url: `/api/courses/${courseId}/comments`,
      payload: { text: 'аноним' },
    })
    expect(res.statusCode).toBe(401)
  })
})
