import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

/**
 * Команда (workspace) — контейнер для общих ссылок.
 * Создатель автоматически получает membership с ролью owner.
 */
const workspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
)

export type Workspace = InferSchemaType<typeof workspaceSchema>
export type WorkspaceDocument = HydratedDocument<Workspace>
export const WorkspaceModel = model('Workspace', workspaceSchema)
