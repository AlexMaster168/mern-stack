import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

export const WORKSPACE_ROLES = ['owner', 'editor', 'viewer'] as const
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]

/**
 * Членство пользователя в команде.
 * owner  — всё + управление участниками и удаление команды
 * editor — создание/редактирование/удаление ссылок команды
 * viewer — только просмотр ссылок и аналитики
 */
const membershipSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: WORKSPACE_ROLES, default: 'viewer' },
  },
  { timestamps: true },
)

// Один пользователь — одно членство в конкретной команде
membershipSchema.index({ workspace: 1, user: 1 }, { unique: true })

export type Membership = InferSchemaType<typeof membershipSchema>
export type MembershipDocument = HydratedDocument<Membership>
export const MembershipModel = model('Membership', membershipSchema)
