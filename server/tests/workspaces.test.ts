import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { bearer, registerAndLogin } from './helpers.js'

let app: FastifyInstance

beforeAll(async () => {
  app = await buildApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

async function createWorkspace(token: string, name: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/workspaces',
    headers: bearer(token),
    payload: { name },
  })
  expect(res.statusCode).toBe(201)
  return res.json()._id as string
}

describe('workspaces — команды и роли', () => {
  it('owner создаёт команду, добавляет editor по email и видит её в списке', async () => {
    const owner = await registerAndLogin(app, 'ws-owner@l.com')
    await registerAndLogin(app, 'ws-editor@l.com')

    const wsId = await createWorkspace(owner.token, 'Маркетинг')

    const add = await app.inject({
      method: 'POST',
      url: `/api/workspaces/${wsId}/members`,
      headers: bearer(owner.token),
      payload: { email: 'ws-editor@l.com', role: 'editor' },
    })
    expect(add.statusCode).toBe(201)

    const list = await app.inject({
      method: 'GET',
      url: '/api/workspaces',
      headers: bearer(owner.token),
    })
    const mine = list.json()
    expect(mine).toHaveLength(1)
    expect(mine[0].memberCount).toBe(2)
    expect(mine[0].role).toBe('owner')
  })

  it('добавление несуществующего email → 404', async () => {
    const owner = await registerAndLogin(app, 'ws-owner2@l.com')
    const wsId = await createWorkspace(owner.token, 'Команда X')
    const res = await app.inject({
      method: 'POST',
      url: `/api/workspaces/${wsId}/members`,
      headers: bearer(owner.token),
      payload: { email: 'nobody@nowhere.com', role: 'viewer' },
    })
    expect(res.statusCode).toBe(404)
  })

  it('editor создаёт командную ссылку, viewer — нет, не-участник не видит', async () => {
    const owner = await registerAndLogin(app, 'wsl-owner@l.com')
    const editor = await registerAndLogin(app, 'wsl-editor@l.com')
    const viewer = await registerAndLogin(app, 'wsl-viewer@l.com')
    const outsider = await registerAndLogin(app, 'wsl-outsider@l.com')

    const wsId = await createWorkspace(owner.token, 'Контент')
    await app.inject({
      method: 'POST',
      url: `/api/workspaces/${wsId}/members`,
      headers: bearer(owner.token),
      payload: { email: 'wsl-editor@l.com', role: 'editor' },
    })
    await app.inject({
      method: 'POST',
      url: `/api/workspaces/${wsId}/members`,
      headers: bearer(owner.token),
      payload: { email: 'wsl-viewer@l.com', role: 'viewer' },
    })

    // editor создаёт командную ссылку
    const created = await app.inject({
      method: 'POST',
      url: '/api/link/generate',
      headers: bearer(editor.token),
      payload: { from: 'https://team.com', workspaceId: wsId },
    })
    expect(created.statusCode).toBe(201)
    expect(created.json().link.workspace).toBe(wsId)
    const linkId = created.json().link._id

    // viewer не может создавать
    const viewerCreate = await app.inject({
      method: 'POST',
      url: '/api/link/generate',
      headers: bearer(viewer.token),
      payload: { from: 'https://nope.com', workspaceId: wsId },
    })
    expect(viewerCreate.statusCode).toBe(403)

    // viewer видит командные ссылки
    const viewerList = await app.inject({
      method: 'GET',
      url: `/api/workspaces/${wsId}/links`,
      headers: bearer(viewer.token),
    })
    expect(viewerList.statusCode).toBe(200)
    expect(viewerList.json()).toHaveLength(1)

    // viewer не может редактировать командную ссылку
    const viewerPatch = await app.inject({
      method: 'PATCH',
      url: `/api/link/${linkId}`,
      headers: bearer(viewer.token),
      payload: { disabled: true },
    })
    expect(viewerPatch.statusCode).toBe(403)

    // не-участник не видит командные ссылки
    const outsiderList = await app.inject({
      method: 'GET',
      url: `/api/workspaces/${wsId}/links`,
      headers: bearer(outsider.token),
    })
    expect(outsiderList.statusCode).toBe(403)

    // персональный список не показывает командные ссылки
    const editorPersonal = await app.inject({
      method: 'GET',
      url: '/api/link',
      headers: bearer(editor.token),
    })
    expect(editorPersonal.json()).toHaveLength(0)
  })

  it('owner удаляет участника, и тот теряет доступ', async () => {
    const owner = await registerAndLogin(app, 'rm-owner@l.com')
    await registerAndLogin(app, 'rm-member@l.com')
    const member = await registerAndLogin(app, 'rm-member@l.com', { password: 'secret123' })

    const wsId = await createWorkspace(owner.token, 'Удаляшки')
    const add = await app.inject({
      method: 'POST',
      url: `/api/workspaces/${wsId}/members`,
      headers: bearer(owner.token),
      payload: { email: 'rm-member@l.com', role: 'viewer' },
    })
    expect(add.statusCode).toBe(201)
    const memberUserId = add.json().userId

    const del = await app.inject({
      method: 'DELETE',
      url: `/api/workspaces/${wsId}/members/${memberUserId}`,
      headers: bearer(owner.token),
    })
    expect(del.statusCode).toBe(200)

    const afterList = await app.inject({
      method: 'GET',
      url: `/api/workspaces/${wsId}/links`,
      headers: bearer(member.token),
    })
    expect(afterList.statusCode).toBe(403)
  })
})
