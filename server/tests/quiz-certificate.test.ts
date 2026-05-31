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

async function publishedCourse(token: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/courses',
    headers: bearer(token),
    payload: { title: 'Quiz Course' },
  })
  const id = res.json()._id as string
  await app.inject({
    method: 'PATCH',
    url: `/api/courses/${id}/publish`,
    headers: bearer(token),
    payload: { publish: true },
  })
  return id
}

describe('квизы', () => {
  it('ответы не утекают студенту, score считается на сервере', async () => {
    const inst = await registerAndLogin(app, 'qinst@c.com', { role: 'instructor' })
    const courseId = await publishedCourse(inst.token)

    const quizRes = await app.inject({
      method: 'POST',
      url: `/api/courses/${courseId}/quizzes`,
      headers: bearer(inst.token),
      payload: {
        title: 'Тест',
        questions: [
          { text: '2+2?', options: ['3', '4', '5'], correctIndex: 1 },
          { text: 'Столица?', options: ['Москва', 'Питер'], correctIndex: 0 },
        ],
      },
    })
    expect(quizRes.statusCode).toBe(201)
    const quizId = quizRes.json()._id as string

    const student = await registerAndLogin(app, 'qstud@c.com')
    await app.inject({ method: 'POST', url: `/api/courses/${courseId}/enroll`, headers: bearer(student.token) })

    const listed = await app.inject({
      method: 'GET',
      url: `/api/courses/${courseId}/quizzes`,
      headers: bearer(student.token),
    })
    const quizzes = listed.json()
    expect(quizzes).toHaveLength(1)
    // КЛЮЧЕВОЕ: правильный ответ не отдаётся студенту
    expect(quizzes[0].questions[0]).not.toHaveProperty('correctIndex')
    expect(quizzes[0].questions[0]).toHaveProperty('options')

    // 1 из 2 верно → 50%, не сдано
    const half = await app.inject({
      method: 'POST',
      url: `/api/quizzes/${quizId}/attempt`,
      headers: bearer(student.token),
      payload: { answers: [1, 1] },
    })
    expect(half.statusCode).toBe(201)
    expect(half.json().score).toBe(50)
    expect(half.json().passed).toBe(false)

    // всё верно → 100%, сдано
    const full = await app.inject({
      method: 'POST',
      url: `/api/quizzes/${quizId}/attempt`,
      headers: bearer(student.token),
      payload: { answers: [1, 0] },
    })
    expect(full.json().score).toBe(100)
    expect(full.json().passed).toBe(true)
  })

  it('не записанный не может пройти квиз (403)', async () => {
    const inst = await registerAndLogin(app, 'qinst2@c.com', { role: 'instructor' })
    const courseId = await publishedCourse(inst.token)
    const quizRes = await app.inject({
      method: 'POST',
      url: `/api/courses/${courseId}/quizzes`,
      headers: bearer(inst.token),
      payload: { title: 'T', questions: [{ text: 'q', options: ['a', 'b'], correctIndex: 0 }] },
    })
    const quizId = quizRes.json()._id as string

    const outsider = await registerAndLogin(app, 'qout@c.com')
    const res = await app.inject({
      method: 'POST',
      url: `/api/quizzes/${quizId}/attempt`,
      headers: bearer(outsider.token),
      payload: { answers: [0] },
    })
    expect(res.statusCode).toBe(403)
  })

  it('студент не может создать квиз (403)', async () => {
    const inst = await registerAndLogin(app, 'qinst3@c.com', { role: 'instructor' })
    const courseId = await publishedCourse(inst.token)
    const student = await registerAndLogin(app, 'qstud3@c.com')
    const res = await app.inject({
      method: 'POST',
      url: `/api/courses/${courseId}/quizzes`,
      headers: bearer(student.token),
      payload: { title: 'X', questions: [] },
    })
    expect(res.statusCode).toBe(403)
  })
})

describe('сертификаты', () => {
  it('выдаётся только после завершения курса и верифицируется публично', async () => {
    const inst = await registerAndLogin(app, 'cinst@c.com', { role: 'instructor' })
    const courseId = await publishedCourse(inst.token)
    const lessonRes = await app.inject({
      method: 'POST',
      url: `/api/courses/${courseId}/lessons`,
      headers: bearer(inst.token),
      payload: { title: 'L1', duration: 5 },
    })
    const lessonId = lessonRes.json()._id as string

    const student = await registerAndLogin(app, 'cstud@c.com')
    await app.inject({ method: 'POST', url: `/api/courses/${courseId}/enroll`, headers: bearer(student.token) })

    // курс не завершён → 400
    const tooEarly = await app.inject({
      method: 'POST',
      url: `/api/courses/${courseId}/certificate`,
      headers: bearer(student.token),
    })
    expect(tooEarly.statusCode).toBe(400)

    // проходим единственный урок → enrollment completed
    await app.inject({ method: 'POST', url: `/api/lessons/${lessonId}/complete`, headers: bearer(student.token) })

    const issued = await app.inject({
      method: 'POST',
      url: `/api/courses/${courseId}/certificate`,
      headers: bearer(student.token),
    })
    expect(issued.statusCode).toBe(201)
    const certId = issued.json().certificateId as string
    expect(certId).toBeTruthy()

    // публичная верификация (без токена)
    const verify = await app.inject({ method: 'GET', url: `/api/certificates/${certId}` })
    expect(verify.statusCode).toBe(200)
    expect(verify.json().course.title).toBe('Quiz Course')
  })
})
