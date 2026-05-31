import type { Types } from 'mongoose'
import { WorkspaceModel, type WorkspaceDocument } from '../models/Workspace.js'
import {
  MembershipModel,
  type MembershipDocument,
  type WorkspaceRole,
} from '../models/Membership.js'
import { UserModel } from '../models/User.js'
import { LinkModel } from '../models/Link.js'
import { ClickEventModel } from '../models/ClickEvent.js'
import { ApiError } from '../utils/ApiError.js'

// Роли иерархичны: owner ⊇ editor ⊇ viewer
const ROLE_RANK: Record<WorkspaceRole, number> = { viewer: 0, editor: 1, owner: 2 }

function hasRank(role: WorkspaceRole, min: WorkspaceRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min]
}

/**
 * Возвращает членство пользователя в команде, если его уровень прав не ниже minRole.
 * Иначе бросает 403. Используется и из link.service для командных ссылок.
 */
export async function requireMembership(
  workspaceId: string,
  userId: string,
  minRole: WorkspaceRole = 'viewer',
): Promise<MembershipDocument> {
  const membership = await MembershipModel.findOne({ workspace: workspaceId, user: userId })
  if (!membership) {
    throw ApiError.forbidden('Вы не участник этой команды')
  }
  if (!hasRank(membership.role as WorkspaceRole, minRole)) {
    throw ApiError.forbidden('Недостаточно прав в команде')
  }
  return membership
}

export interface MemberInfo {
  userId: string
  email: string
  name: string
  role: WorkspaceRole
}

export interface WorkspaceSummary {
  _id: string
  name: string
  role: WorkspaceRole
  memberCount: number
  linkCount: number
  createdAt: Date
}

interface PopulatedUser {
  _id: Types.ObjectId
  email: string
  name: string
}

export async function createWorkspace(name: string, userId: string): Promise<WorkspaceDocument> {
  const workspace = await WorkspaceModel.create({ name, owner: userId })
  await MembershipModel.create({ workspace: workspace._id, user: userId, role: 'owner' })
  return workspace
}

/** Команды, в которых пользователь состоит, с его ролью и счётчиками. */
export async function listMyWorkspaces(userId: string): Promise<WorkspaceSummary[]> {
  const memberships = await MembershipModel.find({ user: userId })
  const ids = memberships.map((m) => m.workspace)
  const roleByWs = new Map(memberships.map((m) => [m.workspace.toString(), m.role as WorkspaceRole]))

  const workspaces = await WorkspaceModel.find({ _id: { $in: ids } }).sort({ createdAt: -1 })

  return Promise.all(
    workspaces.map(async (ws) => {
      const [memberCount, linkCount] = await Promise.all([
        MembershipModel.countDocuments({ workspace: ws._id }),
        LinkModel.countDocuments({ workspace: ws._id }),
      ])
      return {
        _id: ws.id,
        name: ws.name,
        role: roleByWs.get(ws.id) ?? 'viewer',
        memberCount,
        linkCount,
        createdAt: ws.createdAt,
      }
    }),
  )
}

export interface WorkspaceDetail {
  _id: string
  name: string
  ownerId: string
  myRole: WorkspaceRole
  members: MemberInfo[]
}

export async function getWorkspaceDetail(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceDetail> {
  const membership = await requireMembership(workspaceId, userId, 'viewer')
  const workspace = await WorkspaceModel.findById(workspaceId)
  if (!workspace) {
    throw ApiError.notFound('Команда не найдена')
  }

  const memberships = await MembershipModel.find({ workspace: workspaceId })
    .populate<{ user: PopulatedUser }>('user', 'email name')
    .sort({ createdAt: 1 })

  const members: MemberInfo[] = memberships
    .filter((m) => m.user)
    .map((m) => ({
      userId: m.user._id.toString(),
      email: m.user.email,
      name: m.user.name ?? '',
      role: m.role as WorkspaceRole,
    }))

  return {
    _id: workspace.id,
    name: workspace.name,
    ownerId: workspace.owner.toString(),
    myRole: membership.role as WorkspaceRole,
    members,
  }
}

export async function renameWorkspace(
  workspaceId: string,
  requesterId: string,
  name: string,
): Promise<WorkspaceDocument> {
  await requireMembership(workspaceId, requesterId, 'owner')
  const workspace = await WorkspaceModel.findById(workspaceId)
  if (!workspace) {
    throw ApiError.notFound('Команда не найдена')
  }
  workspace.name = name
  await workspace.save()
  return workspace
}

/** Добавляет в команду уже зарегистрированного пользователя по email (без owner). */
export async function addMember(
  workspaceId: string,
  requesterId: string,
  email: string,
  role: WorkspaceRole,
): Promise<MemberInfo> {
  await requireMembership(workspaceId, requesterId, 'owner')
  if (role === 'owner') {
    throw ApiError.badRequest('Назначить второго владельца нельзя')
  }
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
  if (!user) {
    throw ApiError.notFound('Пользователь с таким email не зарегистрирован')
  }
  const existing = await MembershipModel.findOne({ workspace: workspaceId, user: user._id })
  if (existing) {
    throw ApiError.conflict('Этот пользователь уже в команде')
  }
  await MembershipModel.create({ workspace: workspaceId, user: user._id, role })
  return { userId: user.id, email: user.email, name: user.name ?? '', role }
}

export async function updateMemberRole(
  workspaceId: string,
  requesterId: string,
  targetUserId: string,
  role: WorkspaceRole,
): Promise<void> {
  await requireMembership(workspaceId, requesterId, 'owner')
  if (role === 'owner') {
    throw ApiError.badRequest('Передача владения не поддерживается')
  }
  const workspace = await WorkspaceModel.findById(workspaceId)
  if (workspace && workspace.owner.toString() === targetUserId) {
    throw ApiError.badRequest('Нельзя изменить роль владельца')
  }
  const membership = await MembershipModel.findOne({ workspace: workspaceId, user: targetUserId })
  if (!membership) {
    throw ApiError.notFound('Участник не найден')
  }
  membership.role = role
  await membership.save()
}

/** Удаляет участника. Чужих может убрать только owner; себя (leave) — любой участник. */
export async function removeMember(
  workspaceId: string,
  requesterId: string,
  targetUserId: string,
): Promise<void> {
  const workspace = await WorkspaceModel.findById(workspaceId)
  if (!workspace) {
    throw ApiError.notFound('Команда не найдена')
  }
  if (targetUserId === requesterId) {
    await requireMembership(workspaceId, requesterId, 'viewer')
  } else {
    await requireMembership(workspaceId, requesterId, 'owner')
  }
  if (workspace.owner.toString() === targetUserId) {
    throw ApiError.badRequest('Владелец не может покинуть команду — удалите её целиком')
  }
  const res = await MembershipModel.deleteOne({ workspace: workspaceId, user: targetUserId })
  if (res.deletedCount === 0) {
    throw ApiError.notFound('Участник не найден')
  }
}

/** Удаляет команду со всеми её ссылками, кликами и членствами (только owner). */
export async function deleteWorkspace(workspaceId: string, requesterId: string): Promise<void> {
  const workspace = await WorkspaceModel.findById(workspaceId)
  if (!workspace) {
    throw ApiError.notFound('Команда не найдена')
  }
  if (workspace.owner.toString() !== requesterId) {
    throw ApiError.forbidden('Удалить команду может только её владелец')
  }
  const links = await LinkModel.find({ workspace: workspaceId }).select('_id')
  const linkIds = links.map((l) => l._id)
  await Promise.all([
    ClickEventModel.deleteMany({ link: { $in: linkIds } }),
    LinkModel.deleteMany({ workspace: workspaceId }),
    MembershipModel.deleteMany({ workspace: workspaceId }),
  ])
  await workspace.deleteOne()
}
