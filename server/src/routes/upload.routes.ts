import type { FastifyInstance } from 'fastify'
import * as uploadController from '../controllers/upload.controller.js'

export async function uploadRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/upload',
    { preHandler: [app.authenticate, app.requireRole('instructor', 'admin')] },
    uploadController.uploadImage,
  )
}
