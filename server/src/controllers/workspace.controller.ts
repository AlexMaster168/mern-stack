import type { FastifyReply, FastifyRequest } from 'fastify'
import * as workspaceService from '../services/workspace.service.js'
import * as linkService from '../services/link.service.js'
import type {
  AddMemberInput,
  CreateWorkspaceInput,
  UpdateMemberInput,
} from '../validators/workspace.validator.js'

export async function create(
  req: FastifyRequest<{ Body: CreateWorkspaceInput }>,
  reply: FastifyReply,
): Promise<void> {
  const ws = await workspaceService.createWorkspace(req.body.name, req.user.userId)
  reply.code(201).send({ _id: ws.id, name: ws.name })
}

export async function list(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.send(await workspaceService.listMyWorkspaces(req.user.userId))
}

export async function detail(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(await workspaceService.getWorkspaceDetail(req.params.id, req.user.userId))
}

export async function rename(
  req: FastifyRequest<{ Params: { id: string }; Body: CreateWorkspaceInput }>,
  reply: FastifyReply,
): Promise<void> {
  const ws = await workspaceService.renameWorkspace(req.params.id, req.user.userId, req.body.name)
  reply.send({ _id: ws.id, name: ws.name })
}

export async function remove(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  await workspaceService.deleteWorkspace(req.params.id, req.user.userId)
  reply.send({ message: 'Команда удалена' })
}

export async function links(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const items = await linkService.getWorkspaceLinks(req.params.id, req.user.userId)
  reply.send(items.map(linkService.toPublicLink))
}

export async function addMember(
  req: FastifyRequest<{ Params: { id: string }; Body: AddMemberInput }>,
  reply: FastifyReply,
): Promise<void> {
  const member = await workspaceService.addMember(
    req.params.id,
    req.user.userId,
    req.body.email,
    req.body.role,
  )
  reply.code(201).send(member)
}

export async function updateMember(
  req: FastifyRequest<{ Params: { id: string; userId: string }; Body: UpdateMemberInput }>,
  reply: FastifyReply,
): Promise<void> {
  await workspaceService.updateMemberRole(
    req.params.id,
    req.user.userId,
    req.params.userId,
    req.body.role,
  )
  reply.send({ message: 'Роль обновлена' })
}

export async function removeMember(
  req: FastifyRequest<{ Params: { id: string; userId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  await workspaceService.removeMember(req.params.id, req.user.userId, req.params.userId)
  reply.send({ message: 'Участник удалён' })
}
