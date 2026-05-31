import type { FastifyInstance } from 'fastify'
import * as enrollmentController from '../controllers/enrollment.controller.js'

export async function enrollmentRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Params: { courseId: string } }>(
    '/courses/:courseId/enroll',
    { preHandler: [app.authenticate] },
    enrollmentController.enroll,
  )
  app.get('/me/enrollments', { preHandler: [app.authenticate] }, enrollmentController.myEnrollments)
  app.post<{ Params: { lessonId: string } }>(
    '/lessons/:lessonId/complete',
    { preHandler: [app.authenticate] },
    enrollmentController.completeLesson,
  )
}
