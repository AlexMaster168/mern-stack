import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

const linkSchema = new Schema(
  {
    from: { type: String, required: true },
    // Производное от code (APP_BASE_URL/t/<code>); храним для удобства, поэтому без unique
    to: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    clicks: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Если задан — ссылка принадлежит команде, доступ определяется членством в workspace
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null, index: true },
    // Был ли code задан пользователем вручную (кастомный алиас)
    custom: { type: Boolean, default: false },
    // Доп. ограничения (все опциональны)
    expiresAt: { type: Date, default: null },
    maxClicks: { type: Number, default: null },
    // Храним только bcrypt-хеш; select:false — не попадает в выборки по умолчанию
    passwordHash: { type: String, default: null, select: false },
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// timestamps:true добавляет поля в рантайме, но не в InferSchemaType — дописываем вручную
export type Link = InferSchemaType<typeof linkSchema> & { createdAt: Date; updatedAt: Date }
export type LinkDocument = HydratedDocument<Link>
export const LinkModel = model('Link', linkSchema)
