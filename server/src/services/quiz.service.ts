import { QuizModel, type QuizDocument } from '../models/Quiz.js'
import { QuizAttemptModel, type QuizAttemptDocument } from '../models/QuizAttempt.js'
import { getOwnedCourse } from './course.service.js'
import { isEnrolled } from './enrollment.service.js'
import { ApiError } from '../utils/ApiError.js'
import type { UserRole } from '../models/User.js'
import type { CreateQuizInput, UpdateQuizInput } from '../validators/quiz.validator.js'

export interface StudentQuiz {
  _id: string
  title: string
  questions: { text: string; options: string[] }[]
}

/** Версия квиза для студента — БЕЗ правильных ответов (correctIndex не утекает). */
function toStudentQuiz(quiz: QuizDocument): StudentQuiz {
  return {
    _id: quiz.id,
    title: quiz.title,
    questions: quiz.questions.map((q) => ({ text: q.text, options: q.options })),
  }
}

export async function createQuiz(
  courseId: string,
  input: CreateQuizInput,
  userId: string,
  role: UserRole,
): Promise<QuizDocument> {
  await getOwnedCourse(courseId, userId, role)
  return await QuizModel.create({ course: courseId, title: input.title, questions: input.questions })
}

export async function updateQuiz(
  quizId: string,
  input: UpdateQuizInput,
  userId: string,
  role: UserRole,
): Promise<QuizDocument> {
  const quiz = await QuizModel.findById(quizId)
  if (!quiz) {
    throw ApiError.notFound('Квиз не найден')
  }
  await getOwnedCourse(quiz.course.toString(), userId, role)
  quiz.set(input)
  await quiz.save()
  return quiz
}

export async function deleteQuiz(quizId: string, userId: string, role: UserRole): Promise<void> {
  const quiz = await QuizModel.findById(quizId)
  if (!quiz) {
    throw ApiError.notFound('Квиз не найден')
  }
  await getOwnedCourse(quiz.course.toString(), userId, role)
  await quiz.deleteOne()
}

/** Квизы курса для прохождения (без правильных ответов). */
export async function listQuizzesForStudent(courseId: string): Promise<StudentQuiz[]> {
  const quizzes = await QuizModel.find({ course: courseId }).sort({ createdAt: 1 })
  return quizzes.map(toStudentQuiz)
}

/** Квизы курса для редактирования (полные, с ответами) — только владельцу. */
export async function listQuizzesForOwner(
  courseId: string,
  userId: string,
  role: UserRole,
): Promise<QuizDocument[]> {
  await getOwnedCourse(courseId, userId, role)
  return await QuizModel.find({ course: courseId }).sort({ createdAt: 1 })
}

export async function submitAttempt(
  quizId: string,
  userId: string,
  answers: number[],
): Promise<QuizAttemptDocument> {
  const quiz = await QuizModel.findById(quizId)
  if (!quiz) {
    throw ApiError.notFound('Квиз не найден')
  }

  const enrolled = await isEnrolled(userId, quiz.course.toString())
  if (!enrolled) {
    throw ApiError.forbidden('Пройти квиз могут только записанные на курс')
  }

  // Проверка ответов происходит ТОЛЬКО на сервере
  let correctCount = 0
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) {
      correctCount += 1
    }
  })

  const total = quiz.questions.length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const passed = score >= 60

  return await QuizAttemptModel.create({
    user: userId,
    quiz: quizId,
    course: quiz.course,
    answers,
    correctCount,
    total,
    score,
    passed,
  })
}
