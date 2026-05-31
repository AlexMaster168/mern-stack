import type { FastifyReply, FastifyRequest } from 'fastify'
import * as commentService from '../services/comment.service.js'
import type { CreateCommentInput } from '../validators/comment.validator.js'

export async function list(
  req: FastifyRequest<{ Params: { courseId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(await commentService.listComments(req.params.courseId))
}

export async function add(
  req: FastifyRequest<{ Params: { courseId: string }; Body: CreateCommentInput }>,
  reply: FastifyReply,
): Promise<void> {
  const comment = await commentService.addComment(req.user.userId, req.params.courseId, req.body)
  reply.code(201).send(comment)
}

export async function remove(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  await commentService.deleteComment(req.params.id, req.user.userId, req.user.role)
  reply.send({ message: 'Комментарий удалён' })
}
