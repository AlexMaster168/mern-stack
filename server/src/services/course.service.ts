import { nanoid } from 'nanoid'
import { CourseModel, type CourseDocument } from '../models/Course.js'
import { ModuleModel, type ModuleDocument } from '../models/Module.js'
import { LessonModel, type LessonDocument } from '../models/Lesson.js'
import { ApiError } from '../utils/ApiError.js'
import type { CreateCourseInput, ModuleInput, UpdateCourseInput } from '../validators/course.validator.js'
import type { CreateLessonInput, UpdateLessonInput } from '../validators/lesson.validator.js'
import type { UserRole } from '../models/User.js'

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${base || 'course'}-${nanoid(6)}`
}

/** Возвращает курс, если запрашивающий — его автор или админ. Иначе бросает ошибку. */
export async function getOwnedCourse(
  courseId: string,
  userId: string,
  role: UserRole,
): Promise<CourseDocument> {
  const course = await CourseModel.findById(courseId)
  if (!course) {
    throw ApiError.notFound('Курс не найден')
  }
  if (role !== 'admin' && course.instructor.toString() !== userId) {
    throw ApiError.forbidden('Это не ваш курс')
  }
  return course
}

export async function listCourses(): Promise<CourseDocument[]> {
  return await CourseModel.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .populate('instructor', 'name email')
}

/** Курсы преподавателя — включая черновики. */
export async function listMyCourses(instructorId: string): Promise<CourseDocument[]> {
  return await CourseModel.find({ instructor: instructorId }).sort({ createdAt: -1 })
}

export interface CourseDetail {
  course: CourseDocument
  modules: ModuleDocument[]
  lessons: LessonDocument[]
}

export async function getCourse(courseId: string): Promise<CourseDetail> {
  const course = await CourseModel.findById(courseId).populate('instructor', 'name email')
  if (!course) {
    throw ApiError.notFound('Курс не найден')
  }
  const [modules, lessons] = await Promise.all([
    ModuleModel.find({ course: courseId }).sort({ order: 1 }),
    LessonModel.find({ course: courseId }).sort({ order: 1 }),
  ])
  return { course, modules, lessons }
}

export async function createCourse(
  input: CreateCourseInput,
  instructorId: string,
): Promise<CourseDocument> {
  return await CourseModel.create({ ...input, slug: slugify(input.title), instructor: instructorId })
}

export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
  userId: string,
  role: UserRole,
): Promise<CourseDocument> {
  const course = await getOwnedCourse(courseId, userId, role)
  course.set(input)
  await course.save()
  return course
}

export async function deleteCourse(courseId: string, userId: string, role: UserRole): Promise<void> {
  const course = await getOwnedCourse(courseId, userId, role)
  await Promise.all([
    LessonModel.deleteMany({ course: course._id }),
    ModuleModel.deleteMany({ course: course._id }),
  ])
  await course.deleteOne()
}

export async function setPublished(
  courseId: string,
  publish: boolean,
  userId: string,
  role: UserRole,
): Promise<CourseDocument> {
  const course = await getOwnedCourse(courseId, userId, role)
  course.status = publish ? 'published' : 'draft'
  await course.save()
  return course
}

// ── Модули ───────────────────────────────────────────────────────────────────
export async function addModule(
  courseId: string,
  input: ModuleInput,
  userId: string,
  role: UserRole,
): Promise<ModuleDocument> {
  await getOwnedCourse(courseId, userId, role)
  const count = await ModuleModel.countDocuments({ course: courseId })
  return await ModuleModel.create({
    course: courseId,
    title: input.title,
    order: input.order ?? count,
  })
}

export async function deleteModule(
  moduleId: string,
  userId: string,
  role: UserRole,
): Promise<void> {
  const mod = await ModuleModel.findById(moduleId)
  if (!mod) {
    throw ApiError.notFound('Модуль не найден')
  }
  await getOwnedCourse(mod.course.toString(), userId, role)
  await mod.deleteOne()
  await LessonModel.updateMany({ module: moduleId }, { $set: { module: null } })
}

// ── Уроки ──────────────────────────────────────────────────────────────────
export async function createLesson(
  courseId: string,
  input: CreateLessonInput,
  userId: string,
  role: UserRole,
): Promise<LessonDocument> {
  await getOwnedCourse(courseId, userId, role)
  return await LessonModel.create({ ...input, course: courseId })
}

export async function updateLesson(
  lessonId: string,
  input: UpdateLessonInput,
  userId: string,
  role: UserRole,
): Promise<LessonDocument> {
  const lesson = await LessonModel.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Урок не найден')
  }
  await getOwnedCourse(lesson.course.toString(), userId, role)
  lesson.set(input)
  await lesson.save()
  return lesson
}

export async function deleteLesson(
  lessonId: string,
  userId: string,
  role: UserRole,
): Promise<void> {
  const lesson = await LessonModel.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Урок не найден')
  }
  await getOwnedCourse(lesson.course.toString(), userId, role)
  await lesson.deleteOne()
}
