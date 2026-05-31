import { api } from '../../lib/api'
import type {
  Comment,
  ContentBlock,
  Course,
  CourseDetail,
  CourseLevel,
  Enrollment,
  Lesson,
  Module,
} from '../../types'

export async function fetchCourses(): Promise<Course[]> {
  const { data } = await api.get<Course[]>('/courses')
  return data
}

export async function fetchCourse(id: string): Promise<CourseDetail> {
  const { data } = await api.get<CourseDetail>(`/courses/${id}`)
  return data
}

export async function enroll(courseId: string): Promise<Enrollment> {
  const { data } = await api.post<Enrollment>(`/courses/${courseId}/enroll`)
  return data
}

export async function fetchMyEnrollments(): Promise<Enrollment[]> {
  const { data } = await api.get<Enrollment[]>('/me/enrollments')
  return data
}

export async function completeLesson(lessonId: string): Promise<Enrollment> {
  const { data } = await api.post<Enrollment>(`/lessons/${lessonId}/complete`)
  return data
}

export async function fetchComments(courseId: string): Promise<Comment[]> {
  const { data } = await api.get<Comment[]>(`/courses/${courseId}/comments`)
  return data
}

export async function addComment(
  courseId: string,
  text: string,
  rating?: number,
): Promise<Comment> {
  const { data } = await api.post<Comment>(`/courses/${courseId}/comments`, { text, rating })
  return data
}

// ── Редактор курсов (преподаватель) ──────────────────────────────────────────
export interface CourseInput {
  title: string
  summary?: string
  category?: string
  level?: CourseLevel
  coverImage?: string
  gallery?: string[]
  contentBlocks?: ContentBlock[]
}

export interface LessonInput {
  title: string
  module?: string
  content?: ContentBlock[]
  videoUrl?: string
  duration?: number
}

export async function fetchMyCourses(): Promise<Course[]> {
  const { data } = await api.get<Course[]>('/courses/mine')
  return data
}

export async function createCourse(input: CourseInput): Promise<Course> {
  const { data } = await api.post<Course>('/courses', input)
  return data
}

export async function updateCourse(id: string, input: Partial<CourseInput>): Promise<Course> {
  const { data } = await api.patch<Course>(`/courses/${id}`, input)
  return data
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`)
}

export async function publishCourse(id: string, publish: boolean): Promise<Course> {
  const { data } = await api.patch<Course>(`/courses/${id}/publish`, { publish })
  return data
}

export async function addModule(courseId: string, title: string): Promise<Module> {
  const { data } = await api.post<Module>(`/courses/${courseId}/modules`, { title })
  return data
}

export async function deleteModule(moduleId: string): Promise<void> {
  await api.delete(`/courses/modules/${moduleId}`)
}

export async function createLesson(courseId: string, input: LessonInput): Promise<Lesson> {
  const { data } = await api.post<Lesson>(`/courses/${courseId}/lessons`, input)
  return data
}

export async function updateLesson(
  lessonId: string,
  input: Partial<LessonInput>,
): Promise<Lesson> {
  const { data } = await api.patch<Lesson>(`/courses/lessons/${lessonId}`, input)
  return data
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await api.delete(`/courses/lessons/${lessonId}`)
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ url: string }>('/upload', form)
  return data.url
}
