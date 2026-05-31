import type { FastifyInstance } from 'fastify'
import {
  codeParamSchema,
  generateLinkSchema,
  linkIdSchema,
  unlockSchema,
  updateLinkSchema,
} from '../validators/link.validator.js'
import type {
  GenerateLinkInput,
  UnlockInput,
  UpdateLinkInput,
} from '../validators/link.validator.js'
import * as linkController from '../controllers/link.controller.js'

export async function linkRoutes(app: FastifyInstance): Promise<void> {
  const auth = { preHandler: [app.authenticate] }

  // Публичная разблокировка по паролю (статический сегмент имеет приоритет над :id)
  app.post<{ Params: { code: string }; Body: UnlockInput }>(
    '/unlock/:code',
    { schema: { params: codeParamSchema, body: unlockSchema } },
    linkController.unlock,
  )

  app.post<{ Body: GenerateLinkInput }>(
    '/generate',
    { ...auth, schema: { body: generateLinkSchema } },
    linkController.generate,
  )
  app.get('/', auth, linkController.list)
  app.get<{ Params: { id: string } }>(
    '/:id',
    { ...auth, schema: { params: linkIdSchema } },
    linkController.getById,
  )
  app.get<{ Params: { id: string } }>(
    '/:id/stats',
    { ...auth, schema: { params: linkIdSchema } },
    linkController.stats,
  )
  app.patch<{ Params: { id: string }; Body: UpdateLinkInput }>(
    '/:id',
    { ...auth, schema: { params: linkIdSchema, body: updateLinkSchema } },
    linkController.update,
  )
  app.delete<{ Params: { id: string } }>(
    '/:id',
    { ...auth, schema: { params: linkIdSchema } },
    linkController.remove,
  )
}
