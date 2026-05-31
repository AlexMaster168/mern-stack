import type { FastifyReply, FastifyRequest } from 'fastify'
import * as enrollmentService from '../services/enrollment.service.js'

export async function enroll(
  req: FastifyRequest<{ Params: { courseId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const enrollment = await enrollmentService.enroll(req.user.userId, req.params.courseId)
  reply.code(201).send(enrollment)
}

export async function myEnrollments(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.send(await enrollmentService.getMyEnrollments(req.user.userId))
}

export async function completeLesson(
  req: FastifyRequest<{ Params: { lessonId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(await enrollmentService.completeLesson(req.user.userId, req.params.lessonId))
}
