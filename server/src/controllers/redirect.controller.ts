import type { FastifyReply, FastifyRequest } from 'fastify'
import * as linkService from '../services/link.service.js'
import { clickContextFromHeaders } from '../utils/clickContext.js'
import { env } from '../config/env.js'

export async function redirect(
  req: FastifyRequest<{ Params: { code: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const outcome = await linkService.resolveForRedirect(
    req.params.code,
    clickContextFromHeaders(req.headers),
  )

  switch (outcome.status) {
    case 'ok':
      reply.redirect(outcome.url) // 302 по умолчанию
      return
    case 'password':
      // Защищена паролем — отправляем на страницу разблокировки во фронте
      reply.redirect(`${env.CLIENT_URL}/unlock/${req.params.code}`)
      return
    default:
      // notfound | expired | limit | disabled — страница «недоступно» во фронте
      reply.redirect(`${env.CLIENT_URL}/l/unavailable?reason=${outcome.status}`)
      return
  }
}
