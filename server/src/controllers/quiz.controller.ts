import type { FastifyReply, FastifyRequest } from 'fastify'
import * as quizService from '../services/quiz.service.js'
import type { AttemptInput, CreateQuizInput, UpdateQuizInput } from '../validators/quiz.validator.js'

export async function create(
  req: FastifyRequest<{ Params: { courseId: string }; Body: CreateQuizInput }>,
  reply: FastifyReply,
): Promise<void> {
  const quiz = await quizService.createQuiz(
    req.params.courseId,
    req.body,
    req.user.userId,
    req.user.role,
  )
  reply.code(201).send(quiz)
}

export async function update(
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateQuizInput }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(await quizService.updateQuiz(req.params.id, req.body, req.user.userId, req.user.role))
}

export async function remove(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  await quizService.deleteQuiz(req.params.id, req.user.userId, req.user.role)
  reply.send({ message: 'Квиз удалён' })
}

export async function listForStudent(
  req: FastifyRequest<{ Params: { courseId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(await quizService.listQuizzesForStudent(req.params.courseId))
}

export async function listForOwner(
  req: FastifyRequest<{ Params: { courseId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(
    await quizService.listQuizzesForOwner(req.params.courseId, req.user.userId, req.user.role),
  )
}

export async function attempt(
  req: FastifyRequest<{ Params: { id: string }; Body: AttemptInput }>,
  reply: FastifyReply,
): Promise<void> {
  reply.code(201).send(await quizService.submitAttempt(req.params.id, req.user.userId, req.body.answers))
}
