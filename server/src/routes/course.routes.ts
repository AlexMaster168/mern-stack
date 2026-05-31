import type { FastifyInstance } from 'fastify'
import { idParams } from '../validators/common.js'
import {
  createCourseSchema,
  moduleInputSchema,
  publishSchema,
  updateCourseSchema,
  type CreateCourseInput,
  type ModuleInput,
  type UpdateCourseInput,
} from '../validators/course.validator.js'
import {
  createLessonSchema,
  updateLessonSchema,
  type CreateLessonInput,
  type UpdateLessonInput,
} from '../validators/lesson.validator.js'
import * as courseController from '../controllers/course.controller.js'

export async function courseRoutes(app: FastifyInstance): Promise<void> {
  // Создавать/менять курсы могут только преподаватели и админы
  const staff = { preHandler: [app.authenticate, app.requireRole('instructor', 'admin')] }

  // Публичные
  app.get('/', courseController.list)
  // Свои курсы преподавателя (включая черновики) — статический путь до '/:id'
  app.get('/mine', staff, courseController.listMine)
  app.get<{ Params: { id: string } }>(
    '/:id',
    { schema: { params: idParams } },
    courseController.getById,
  )

  // Курс
  app.post<{ Body: CreateCourseInput }>(
    '/',
    { ...staff, schema: { body: createCourseSchema } },
    courseController.create,
  )
  app.patch<{ Params: { id: string }; Body: UpdateCourseInput }>(
    '/:id',
    { ...staff, schema: { params: idParams, body: updateCourseSchema } },
    courseController.update,
  )
  app.delete<{ Params: { id: string } }>(
    '/:id',
    { ...staff, schema: { params: idParams } },
    courseController.remove,
  )
  app.patch<{ Params: { id: string }; Body: { publish: boolean } }>(
    '/:id/publish',
    { ...staff, schema: { params: idParams, body: publishSchema } },
    courseController.publish,
  )

  // Модули
  app.post<{ Params: { id: string }; Body: ModuleInput }>(
    '/:id/modules',
    { ...staff, schema: { params: idParams, body: moduleInputSchema } },
    courseController.addModule,
  )
  app.delete<{ Params: { moduleId: string } }>(
    '/modules/:moduleId',
    staff,
    courseController.deleteModule,
  )

  // Уроки
  app.post<{ Params: { id: string }; Body: CreateLessonInput }>(
    '/:id/lessons',
    { ...staff, schema: { params: idParams, body: createLessonSchema } },
    courseController.createLesson,
  )
  app.patch<{ Params: { lessonId: string }; Body: UpdateLessonInput }>(
    '/lessons/:lessonId',
    { ...staff, schema: { body: updateLessonSchema } },
    courseController.updateLesson,
  )
  app.delete<{ Params: { lessonId: string } }>(
    '/lessons/:lessonId',
    staff,
    courseController.deleteLesson,
  )
}
