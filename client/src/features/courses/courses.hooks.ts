import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as coursesApi from './courses.api'

export function useCourses() {
  return useQuery({ queryKey: ['courses'], queryFn: coursesApi.fetchCourses })
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesApi.fetchCourse(id),
    enabled: Boolean(id),
  })
}

export function useMyEnrollments() {
  return useQuery({ queryKey: ['enrollments'], queryFn: coursesApi.fetchMyEnrollments })
}

export function useEnroll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: coursesApi.enroll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
  })
}

export function useCompleteLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: coursesApi.completeLesson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
  })
}

export function useComments(courseId: string) {
  return useQuery({
    queryKey: ['comments', courseId],
    queryFn: () => coursesApi.fetchComments(courseId),
    enabled: Boolean(courseId),
  })
}

export function useAddComment(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { text: string; rating?: number }) =>
      coursesApi.addComment(courseId, vars.text, vars.rating),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', courseId] }),
  })
}

// ── Редактор курсов (преподаватель) ──────────────────────────────────────────
export function useMyCourses() {
  return useQuery({ queryKey: ['my-courses'], queryFn: coursesApi.fetchMyCourses })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: coursesApi.createCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-courses'] }),
  })
}

export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: coursesApi.CourseInput) => coursesApi.updateCourse(courseId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courses', courseId] })
      void queryClient.invalidateQueries({ queryKey: ['my-courses'] })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: coursesApi.deleteCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-courses'] }),
  })
}

export function usePublishCourse(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publish: boolean) => coursesApi.publishCourse(courseId, publish),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courses', courseId] })
      void queryClient.invalidateQueries({ queryKey: ['my-courses'] })
    },
  })
}

/** Универсальный хук для мутаций структуры курса (модули/уроки) с инвалидацией деталей курса. */
function useCourseStructureMutation<TArgs>(
  courseId: string,
  mutationFn: (args: TArgs) => Promise<unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses', courseId] }),
  })
}

export function useAddModule(courseId: string) {
  return useCourseStructureMutation(courseId, (title: string) =>
    coursesApi.addModule(courseId, title),
  )
}

export function useDeleteModule(courseId: string) {
  return useCourseStructureMutation(courseId, coursesApi.deleteModule)
}

export function useCreateLesson(courseId: string) {
  return useCourseStructureMutation(courseId, (input: coursesApi.LessonInput) =>
    coursesApi.createLesson(courseId, input),
  )
}

export function useUpdateLesson(courseId: string) {
  return useCourseStructureMutation(
    courseId,
    (vars: { lessonId: string; input: Partial<coursesApi.LessonInput> }) =>
      coursesApi.updateLesson(vars.lessonId, vars.input),
  )
}

export function useDeleteLesson(courseId: string) {
  return useCourseStructureMutation(courseId, coursesApi.deleteLesson)
}
