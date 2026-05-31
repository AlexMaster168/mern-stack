import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

// Вопрос с одним правильным вариантом (correctIndex). Студенту correctIndex не отдаётся.
const questionSchema = new Schema(
  {
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
  },
  { _id: true },
)

const quizSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true },
)

export type Quiz = InferSchemaType<typeof quizSchema>
export type QuizDocument = HydratedDocument<Quiz>
export const QuizModel = model('Quiz', quizSchema)
