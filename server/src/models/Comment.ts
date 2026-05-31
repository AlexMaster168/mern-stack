import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

/**
 * Комментарий/отзыв о курсе. Бизнес-правило (проверяется в сервисе):
 * писать может только пользователь, записанный на курс (active или completed).
 */
const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true },
)

export type Comment = InferSchemaType<typeof commentSchema>
export type CommentDocument = HydratedDocument<Comment>
export const CommentModel = model('Comment', commentSchema)
