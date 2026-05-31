import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

export const ENROLLMENT_STATUSES = ['active', 'completed'] as const
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number]

const enrollmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    completedLessons: { type: [Schema.Types.ObjectId], ref: 'Lesson', default: [] },
    status: { type: String, enum: ENROLLMENT_STATUSES, default: 'active' },
  },
  { timestamps: true },
)

// Один пользователь записывается на курс только один раз
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true })

export type Enrollment = InferSchemaType<typeof enrollmentSchema>
export type EnrollmentDocument = HydratedDocument<Enrollment>
export const EnrollmentModel = model('Enrollment', enrollmentSchema)
