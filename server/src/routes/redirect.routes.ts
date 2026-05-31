import type { FastifyInstance } from 'fastify'
import * as redirectController from '../controllers/redirect.controller.js'

export async function redirectRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { code: string } }>('/:code', redirectController.redirect)
}
