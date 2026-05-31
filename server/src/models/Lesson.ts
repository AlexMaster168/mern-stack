import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'
import { contentBlockSchema } from './contentBlock.js'

const lessonSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    // ссылка на _id субдокумента-модуля внутри курса (опционально)
    module: { type: Schema.Types.ObjectId, default: null },
    title: { type: String, required: true, trim: true },
    content: { type: [contentBlockSchema], default: [] },
    videoUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // длительность в минутах
  },
  { timestamps: true },
)

export type Lesson = InferSchemaType<typeof lessonSchema>
export type LessonDocument = HydratedDocument<Lesson>
export const LessonModel = model('Lesson', lessonSchema)
