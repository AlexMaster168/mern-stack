import type { FastifyInstance } from 'fastify'
import { idParams } from '../validators/common.js'
import {
  attemptSchema,
  createQuizSchema,
  updateQuizSchema,
  type AttemptInput,
  type CreateQuizInput,
  type UpdateQuizInput,
} from '../validators/quiz.validator.js'
import * as quizController from '../controllers/quiz.controller.js'

export async function quizRoutes(app: FastifyInstance): Promise<void> {
  const staff = { preHandler: [app.authenticate, app.requireRole('instructor', 'admin')] }
  const authed = { preHandler: [app.authenticate] }

  // Студенту — без правильных ответов
  app.get<{ Params: { courseId: string } }>(
    '/courses/:courseId/quizzes',
    authed,
    quizController.listForStudent,
  )
  // Владельцу — с ответами (для редактирования)
  app.get<{ Params: { courseId: string } }>(
    '/courses/:courseId/quizzes/manage',
    staff,
    quizController.listForOwner,
  )
  app.post<{ Params: { courseId: string }; Body: CreateQuizInput }>(
    '/courses/:courseId/quizzes',
    { ...staff, schema: { body: createQuizSchema } },
    quizController.create,
  )
  app.patch<{ Params: { id: string }; Body: UpdateQuizInput }>(
    '/quizzes/:id',
    { ...staff, schema: { params: idParams, body: updateQuizSchema } },
    quizController.update,
  )
  app.delete<{ Params: { id: string } }>(
    '/quizzes/:id',
    { ...staff, schema: { params: idParams } },
    quizController.remove,
  )
  app.post<{ Params: { id: string }; Body: AttemptInput }>(
    '/quizzes/:id/attempt',
    { ...authed, schema: { params: idParams, body: attemptSchema } },
    quizController.attempt,
  )
}
