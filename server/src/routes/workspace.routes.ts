import type { FastifyInstance } from 'fastify'
import {
  addMemberSchema,
  createWorkspaceSchema,
  renameWorkspaceSchema,
  updateMemberSchema,
  workspaceIdSchema,
  workspaceMemberParamsSchema,
} from '../validators/workspace.validator.js'
import type {
  AddMemberInput,
  CreateWorkspaceInput,
  UpdateMemberInput,
} from '../validators/workspace.validator.js'
import * as workspaceController from '../controllers/workspace.controller.js'

export async function workspaceRoutes(app: FastifyInstance): Promise<void> {
  const auth = { preHandler: [app.authenticate] }

  app.post<{ Body: CreateWorkspaceInput }>(
    '/workspaces',
    { ...auth, schema: { body: createWorkspaceSchema } },
    workspaceController.create,
  )
  app.get('/workspaces', auth, workspaceController.list)
  app.get<{ Params: { id: string } }>(
    '/workspaces/:id',
    { ...auth, schema: { params: workspaceIdSchema } },
    workspaceController.detail,
  )
  app.patch<{ Params: { id: string }; Body: CreateWorkspaceInput }>(
    '/workspaces/:id',
    { ...auth, schema: { params: workspaceIdSchema, body: renameWorkspaceSchema } },
    workspaceController.rename,
  )
  app.delete<{ Params: { id: string } }>(
    '/workspaces/:id',
    { ...auth, schema: { params: workspaceIdSchema } },
    workspaceController.remove,
  )

  app.get<{ Params: { id: string } }>(
    '/workspaces/:id/links',
    { ...auth, schema: { params: workspaceIdSchema } },
    workspaceController.links,
  )

  app.post<{ Params: { id: string }; Body: AddMemberInput }>(
    '/workspaces/:id/members',
    { ...auth, schema: { params: workspaceIdSchema, body: addMemberSchema } },
    workspaceController.addMember,
  )
  app.patch<{ Params: { id: string; userId: string }; Body: UpdateMemberInput }>(
    '/workspaces/:id/members/:userId',
    { ...auth, schema: { params: workspaceMemberParamsSchema, body: updateMemberSchema } },
    workspaceController.updateMember,
  )
  app.delete<{ Params: { id: string; userId: string } }>(
    '/workspaces/:id/members/:userId',
    { ...auth, schema: { params: workspaceMemberParamsSchema } },
    workspaceController.removeMember,
  )
}
