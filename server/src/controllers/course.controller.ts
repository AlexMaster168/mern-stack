import type { FastifyReply, FastifyRequest } from 'fastify'
import * as courseService from '../services/course.service.js'
import type {
  CreateCourseInput,
  ModuleInput,
  UpdateCourseInput,
} from '../validators/course.validator.js'
import type { CreateLessonInput, UpdateLessonInput } from '../validators/lesson.validator.js'

export async function list(_req: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.send(await courseService.listCourses())
}

export async function listMine(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.send(await courseService.listMyCourses(req.user.userId))
}

export async function getById(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(await courseService.getCourse(req.params.id))
}

export async function create(
  req: FastifyRequest<{ Body: CreateCourseInput }>,
  reply: FastifyReply,
): Promise<void> {
  const course = await courseService.createCourse(req.body, req.user.userId)
  reply.code(201).send(course)
}

export async function update(
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateCourseInput }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(
    await courseService.updateCourse(req.params.id, req.body, req.user.userId, req.user.role),
  )
}

export async function remove(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  await courseService.deleteCourse(req.params.id, req.user.userId, req.user.role)
  reply.send({ message: 'Курс удалён' })
}

export async function publish(
  req: FastifyRequest<{ Params: { id: string }; Body: { publish: boolean } }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(
    await courseService.setPublished(
      req.params.id,
      req.body.publish,
      req.user.userId,
      req.user.role,
    ),
  )
}

export async function addModule(
  req: FastifyRequest<{ Params: { id: string }; Body: ModuleInput }>,
  reply: FastifyReply,
): Promise<void> {
  const mod = await courseService.addModule(req.params.id, req.body, req.user.userId, req.user.role)
  reply.code(201).send(mod)
}

export async function deleteModule(
  req: FastifyRequest<{ Params: { moduleId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  await courseService.deleteModule(req.params.moduleId, req.user.userId, req.user.role)
  reply.send({ message: 'Модуль удалён' })
}

export async function createLesson(
  req: FastifyRequest<{ Params: { id: string }; Body: CreateLessonInput }>,
  reply: FastifyReply,
): Promise<void> {
  const lesson = await courseService.createLesson(
    req.params.id,
    req.body,
    req.user.userId,
    req.user.role,
  )
  reply.code(201).send(lesson)
}

export async function updateLesson(
  req: FastifyRequest<{ Params: { lessonId: string }; Body: UpdateLessonInput }>,
  reply: FastifyReply,
): Promise<void> {
  reply.send(
    await courseService.updateLesson(req.params.lessonId, req.body, req.user.userId, req.user.role),
  )
}

export async function deleteLesson(
  req: FastifyRequest<{ Params: { lessonId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  await courseService.deleteLesson(req.params.lessonId, req.user.userId, req.user.role)
  reply.send({ message: 'Урок удалён' })
}
