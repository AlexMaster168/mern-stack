import type { FastifyReply, FastifyRequest } from 'fastify'
import { saveImage } from '../services/upload.service.js'
import { ApiError } from '../utils/ApiError.js'

export async function uploadImage(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const file = await req.file()
  if (!file) {
    throw ApiError.badRequest('Файл не передан')
  }
  const buffer = await file.toBuffer()
  const url = await saveImage(buffer, file.mimetype, file.filename)
  reply.code(201).send({ url })
}
