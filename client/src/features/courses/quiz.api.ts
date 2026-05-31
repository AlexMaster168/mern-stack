import { api } from '../../lib/api'
import type { OwnerQuiz, QuizAttemptResult, QuizQuestion, StudentQuiz } from '../../types'

export interface QuizInput {
  title: string
  questions: QuizQuestion[]
}

export async function fetchQuizzes(courseId: string): Promise<StudentQuiz[]> {
  const { data } = await api.get<StudentQuiz[]>(`/courses/${courseId}/quizzes`)
  return data
}

export async function fetchQuizzesManage(courseId: string): Promise<OwnerQuiz[]> {
  const { data } = await api.get<OwnerQuiz[]>(`/courses/${courseId}/quizzes/manage`)
  return data
}

export async function createQuiz(courseId: string, input: QuizInput): Promise<OwnerQuiz> {
  const { data } = await api.post<OwnerQuiz>(`/courses/${courseId}/quizzes`, input)
  return data
}

export async function updateQuiz(quizId: string, input: Partial<QuizInput>): Promise<OwnerQuiz> {
  const { data } = await api.patch<OwnerQuiz>(`/quizzes/${quizId}`, input)
  return data
}

export async function deleteQuiz(quizId: string): Promise<void> {
  await api.delete(`/quizzes/${quizId}`)
}

export async function submitQuiz(quizId: string, answers: number[]): Promise<QuizAttemptResult> {
  const { data } = await api.post<QuizAttemptResult>(`/quizzes/${quizId}/attempt`, { answers })
  return data
}
