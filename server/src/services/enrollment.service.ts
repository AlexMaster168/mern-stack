import { EnrollmentModel, type EnrollmentDocument } from '../models/Enrollment.js'
import { CourseModel } from '../models/Course.js'
import { LessonModel } from '../models/Lesson.js'
import { ApiError } from '../utils/ApiError.js'

export async function enroll(userId: string, courseId: string): Promise<EnrollmentDocument> {
  const course = await CourseModel.findById(courseId)
  if (!course) {
    throw ApiError.notFound('Курс не найден')
  }
  const existing = await EnrollmentModel.findOne({ user: userId, course: courseId })
  if (existing) {
    return existing
  }
  return await EnrollmentModel.create({ user: userId, course: courseId })
}

export async function getMyEnrollments(userId: string): Promise<EnrollmentDocument[]> {
  return await EnrollmentModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('course', 'title slug coverImage level summary')
}

export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const exists = await EnrollmentModel.exists({ user: userId, course: courseId })
  return Boolean(exists)
}

/** Отмечает урок пройденным и, если пройдены все уроки курса, переводит запись в completed. */
export async function completeLesson(userId: string, lessonId: string): Promise<EnrollmentDocument> {
  const lesson = await LessonModel.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Урок не найден')
  }

  const enrollment = await EnrollmentModel.findOne({ user: userId, course: lesson.course })
  if (!enrollment) {
    throw ApiError.forbidden('Вы не записаны на этот курс')
  }

  await EnrollmentModel.updateOne(
    { _id: enrollment._id },
    { $addToSet: { completedLessons: lesson._id } },
  )

  const [totalLessons, updated] = await Promise.all([
    LessonModel.countDocuments({ course: lesson.course }),
    EnrollmentModel.findById(enrollment._id),
  ])

  if (updated && totalLessons > 0 && updated.completedLessons.length >= totalLessons) {
    updated.status = 'completed'
    await updated.save()
  }

  return updated ?? enrollment
}
