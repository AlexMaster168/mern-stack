import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

export const USER_ROLES = ['admin', 'instructor', 'student'] as const
export type UserRole = (typeof USER_ROLES)[number]

const userSchema = new Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false — пароль не попадает в выборку по умолчанию; в login запрашиваем явно
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'student' },
    links: [{ type: Schema.Types.ObjectId, ref: 'Link' }],
  },
  { timestamps: true },
)

export type User = InferSchemaType<typeof userSchema>
export type UserDocument = HydratedDocument<User>
export const UserModel = model('User', userSchema)
