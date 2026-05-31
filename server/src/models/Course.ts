import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'
import { contentBlockSchema } from './contentBlock.js'

export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export const COURSE_STATUSES = ['draft', 'published'] as const
export type CourseLevel = (typeof COURSE_LEVELS)[number]
export type CourseStatus = (typeof COURSE_STATUSES)[number]

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: '' },
    // Богатое описание: текст + картинки + графики
    contentBlocks: { type: [contentBlockSchema], default: [] },
    coverImage: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    category: { type: String, default: 'general', trim: true },
    level: { type: String, enum: COURSE_LEVELS, default: 'beginner' },
    status: { type: String, enum: COURSE_STATUSES, default: 'draft', index: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
)

export type Course = InferSchemaType<typeof courseSchema>
export type CourseDocument = HydratedDocument<Course>
export const CourseModel = model('Course', courseSchema)
