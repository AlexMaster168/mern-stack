import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from './config/db.js'
import { UserModel } from './models/User.js'
import { CourseModel } from './models/Course.js'
import { ModuleModel } from './models/Module.js'
import { LessonModel } from './models/Lesson.js'
import { EnrollmentModel } from './models/Enrollment.js'
import { logger } from './utils/logger.js'

/** Идемпотентный seed: создаёт преподавателя и демо-курс с rich-контентом, графиками, модулями и уроками. */
async function seed(): Promise<void> {
  await connectDB()

  const email = 'instructor@edulink.dev'
  let instructor = await UserModel.findOne({ email })
  if (!instructor) {
    instructor = await UserModel.create({
      email,
      name: 'Алексей Преподаватель',
      password: await bcrypt.hash('instructor123', 12),
      role: 'instructor',
    })
  }

  const studentEmail = 'student@edulink.dev'
  let student = await UserModel.findOne({ email: studentEmail })
  if (!student) {
    student = await UserModel.create({
      email: studentEmail,
      name: 'Стас Студент',
      password: await bcrypt.hash('student123', 12),
      role: 'student',
    })
  }

  // Чистим прежние курсы этого преподавателя (повторный запуск не плодит дубли)
  const previous = await CourseModel.find({ instructor: instructor._id }).select('_id')
  const previousIds = previous.map((c) => c._id)
  await EnrollmentModel.deleteMany({ course: { $in: previousIds } })
  await LessonModel.deleteMany({ course: { $in: previousIds } })
  await ModuleModel.deleteMany({ course: { $in: previousIds } })
  await CourseModel.deleteMany({ instructor: instructor._id })

  const course = await CourseModel.create({
    title: 'Введение в Data Science',
    slug: 'vvedenie-v-data-science',
    summary: 'Базовый курс по анализу данных: от Python до визуализации и графиков.',
    coverImage: 'https://picsum.photos/seed/datascience/1000/420',
    gallery: [
      'https://picsum.photos/seed/ds-g1/500/350',
      'https://picsum.photos/seed/ds-g2/500/350',
      'https://picsum.photos/seed/ds-g3/500/350',
    ],
    category: 'data-science',
    level: 'beginner',
    status: 'published',
    instructor: instructor._id,
    contentBlocks: [
      {
        type: 'text',
        value:
          'Этот курс познакомит вас с основами Data Science: вы научитесь собирать, очищать и анализировать данные, а также строить наглядные визуализации.',
      },
      {
        type: 'image',
        url: 'https://picsum.photos/seed/ds-lifecycle/900/420',
        caption: 'Жизненный цикл работы с данными',
      },
      {
        type: 'chart',
        chartType: 'bar',
        caption: 'Популярность языков для Data Science (%)',
        data: [
          { name: 'Python', value: 70 },
          { name: 'R', value: 15 },
          { name: 'SQL', value: 10 },
          { name: 'Julia', value: 5 },
        ],
      },
      {
        type: 'chart',
        chartType: 'line',
        caption: 'Рост спроса на DS-специалистов по годам',
        data: [
          { name: '2021', value: 40 },
          { name: '2022', value: 55 },
          { name: '2023', value: 72 },
          { name: '2024', value: 90 },
        ],
      },
      {
        type: 'chart',
        chartType: 'pie',
        caption: 'На что уходит время дата-сайентиста',
        data: [
          { name: 'Очистка данных', value: 45 },
          { name: 'Моделирование', value: 30 },
          { name: 'Визуализация', value: 25 },
        ],
      },
    ],
  })

  const module1 = await ModuleModel.create({
    course: course._id,
    title: 'Модуль 1. Основы',
    order: 0,
  })
  const module2 = await ModuleModel.create({
    course: course._id,
    title: 'Модуль 2. Визуализация',
    order: 1,
  })

  const lessons = await LessonModel.create([
    {
      course: course._id,
      module: module1._id,
      title: 'Что такое Data Science',
      order: 0,
      duration: 12,
      content: [{ type: 'text', value: 'Data Science — это про извлечение знаний из данных.' }],
    },
    {
      course: course._id,
      module: module1._id,
      title: 'Установка Python и инструментов',
      order: 1,
      duration: 8,
      content: [{ type: 'text', value: 'Скачайте Python с python.org и установите Jupyter.' }],
    },
    {
      course: course._id,
      module: module2._id,
      title: 'Строим первые графики',
      order: 0,
      duration: 15,
      content: [
        { type: 'text', value: 'Визуализация помогает увидеть закономерности в данных.' },
        {
          type: 'chart',
          chartType: 'bar',
          caption: 'Пример столбчатой диаграммы',
          data: [
            { name: 'A', value: 10 },
            { name: 'B', value: 25 },
            { name: 'C', value: 18 },
          ],
        },
      ],
    },
  ])

  // Записываем студента на демо-курс; первый урок отмечаем пройденным — прогресс будет не нулевой
  const firstLesson = lessons[0]
  await EnrollmentModel.create({
    user: student._id,
    course: course._id,
    completedLessons: firstLesson ? [firstLesson._id] : [],
    status: 'active',
  })

  logger.info(`✅ Демо-курс создан: «${course.title}» (id: ${course.id})`)
  logger.info(`   Преподаватель: ${email} / instructor123`)
  logger.info(`   Студент:       ${studentEmail} / student123 (записан на курс)`)

  await disconnectDB()
  process.exit(0)
}

seed().catch((err: unknown) => {
  logger.error(err, 'Seed упал')
  process.exit(1)
})
