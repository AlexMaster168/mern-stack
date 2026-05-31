import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as quizApi from './quiz.api'

export function useQuizzes(courseId: string) {
  return useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => quizApi.fetchQuizzes(courseId),
    enabled: Boolean(courseId),
  })
}

export function useManageQuizzes(courseId: string) {
  return useQuery({
    queryKey: ['quizzes', courseId, 'manage'],
    queryFn: () => quizApi.fetchQuizzesManage(courseId),
    enabled: Boolean(courseId),
  })
}

export function useCreateQuiz(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: quizApi.QuizInput) => quizApi.createQuiz(courseId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] }),
  })
}

export function useUpdateQuiz(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { quizId: string; input: Partial<quizApi.QuizInput> }) =>
      quizApi.updateQuiz(vars.quizId, vars.input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] }),
  })
}

export function useDeleteQuiz(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: quizApi.deleteQuiz,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] }),
  })
}

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: (vars: { quizId: string; answers: number[] }) =>
      quizApi.submitQuiz(vars.quizId, vars.answers),
  })
}
