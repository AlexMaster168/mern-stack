import type { FastifyReply, FastifyRequest } from 'fastify'
import * as certificateService from '../services/certificate.service.js'

export async function issue(
  req: FastifyRequest<{ Params: { courseId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const cert = await certificateService.issueCertificate(req.user.userId, req.params.courseId)
  reply.code(201).send(cert)
}

export async function mine(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.send(await certificateService.getMyCertificates(req.user.userId))
}

export async function verify(
  req: FastifyRequest<{ Params: { certificateId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(await certificateService.verifyCertificate(req.params.certificateId))
}
