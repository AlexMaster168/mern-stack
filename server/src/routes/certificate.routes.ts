import type { FastifyInstance } from 'fastify'
import * as certificateController from '../controllers/certificate.controller.js'

export async function certificateRoutes(app: FastifyInstance): Promise<void> {
  const authed = { preHandler: [app.authenticate] }

  app.post<{ Params: { courseId: string } }>(
    '/courses/:courseId/certificate',
    authed,
    certificateController.issue,
  )
  app.get('/me/certificates', authed, certificateController.mine)

  // Публичная верификация
  app.get<{ Params: { certificateId: string } }>(
    '/certificates/:certificateId',
    certificateController.verify,
  )
}
