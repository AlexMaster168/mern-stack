import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

const quizAttemptSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    answers: { type: [Number], default: [] },
    correctCount: { type: Number, required: true },
    total: { type: Number, required: true },
    score: { type: Number, required: true }, // процент
    passed: { type: Boolean, required: true },
  },
  { timestamps: true },
)

export type QuizAttempt = InferSchemaType<typeof quizAttemptSchema>
export type QuizAttemptDocument = HydratedDocument<QuizAttempt>
export const QuizAttemptModel = model('QuizAttempt', quizAttemptSchema)
