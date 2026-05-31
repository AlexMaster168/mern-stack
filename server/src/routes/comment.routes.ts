import type { FastifyInstance } from 'fastify'
import { createCommentSchema, type CreateCommentInput } from '../validators/comment.validator.js'
import * as commentController from '../controllers/comment.controller.js'

export async function commentRoutes(app: FastifyInstance): Promise<void> {
  // Список комментариев — публичный
  app.get<{ Params: { courseId: string } }>(
    '/courses/:courseId/comments',
    commentController.list,
  )

  // Писать может только авторизованный (и записанный — проверка в сервисе)
  app.post<{ Params: { courseId: string }; Body: CreateCommentInput }>(
    '/courses/:courseId/comments',
    { preHandler: [app.authenticate], schema: { body: createCommentSchema } },
    commentController.add,
  )

  app.delete<{ Params: { id: string } }>(
    '/comments/:id',
    { preHandler: [app.authenticate] },
    commentController.remove,
  )
}
