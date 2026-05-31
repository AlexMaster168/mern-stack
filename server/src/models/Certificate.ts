import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

const certificateSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    // Публичный человекочитаемый ID для верификации
    certificateId: { type: String, required: true, unique: true },
  },
  { timestamps: true },
)

// Один сертификат на пару пользователь-курс
certificateSchema.index({ user: 1, course: 1 }, { unique: true })

export type Certificate = InferSchemaType<typeof certificateSchema>
export type CertificateDocument = HydratedDocument<Certificate>
export const CertificateModel = model('Certificate', certificateSchema)
