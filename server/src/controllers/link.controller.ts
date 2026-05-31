import type { FastifyReply, FastifyRequest } from 'fastify'
import * as linkService from '../services/link.service.js'
import * as analyticsService from '../services/analytics.service.js'
import { clickContextFromHeaders } from '../utils/clickContext.js'
import type {
  GenerateLinkInput,
  UpdateLinkInput,
  UnlockInput,
} from '../validators/link.validator.js'

export async function generate(
  req: FastifyRequest<{ Body: GenerateLinkInput }>,
  reply: FastifyReply,
): Promise<void> {
  const link = await linkService.createLink(req.body, req.user.userId)
  reply.code(201).send({ link: linkService.toPublicLink(link) })
}

export async function list(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const links = await linkService.getUserLinks(req.user.userId)
  reply.send(links.map(linkService.toPublicLink))
}

export async function getById(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const link = await linkService.getLinkById(req.params.id, req.user.userId, req.user.role)
  reply.send(linkService.toPublicLink(link))
}

export async function update(
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateLinkInput }>,
  reply: FastifyReply,
): Promise<void> {
  const link = await linkService.updateLink(
    req.params.id,
    req.body,
    req.user.userId,
    req.user.role,
  )
  reply.send(linkService.toPublicLink(link))
}

export async function remove(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  await linkService.deleteLink(req.params.id, req.user.userId, req.user.role)
  reply.send({ message: 'Ссылка удалена' })
}

export async function stats(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(await analyticsService.getLinkStats(req.params.id, req.user.userId, req.user.role))
}

// Публичный: разблокировка ссылки паролем
export async function unlock(
  req: FastifyRequest<{ Params: { code: string }; Body: UnlockInput }>,
  reply: FastifyReply,
): Promise<void> {
  const result = await linkService.unlockLink(
    req.params.code,
    req.body.password ?? '',
    clickContextFromHeaders(req.headers),
  )
  reply.send(result)
}
