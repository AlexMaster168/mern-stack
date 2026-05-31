import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

/**
 * Refresh-токены. Храним только SHA-256 хеш сырого токена (как пароль).
 * TTL-индекс по expiresAt автоматически удаляет протухшие записи.
 */
const refreshTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)

// MongoDB сам удалит документ, когда expiresAt станет в прошлом
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export type RefreshToken = InferSchemaType<typeof refreshTokenSchema>
export type RefreshTokenDocument = HydratedDocument<RefreshToken>
export const RefreshTokenModel = model('RefreshToken', refreshTokenSchema)
