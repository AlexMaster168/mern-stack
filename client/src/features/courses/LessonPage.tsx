import { Link as RouterLink, useParams } from 'react-router-dom'
import { useCompleteLesson, useCourse, useMyEnrollments } from './courses.hooks'
import { ContentBlocks } from './components/ContentBlocks'
import { Loader } from '../../components/Loader'

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { data, isLoading } = useCourse(courseId ?? '')
  const { data: enrollments } = useMyEnrollments()
  const complete = useCompleteLesson()

  if (isLoading) return <Loader />
  if (!data) return <p className="text-slate-500">Курс не найден.</p>

  const lesson = data.lessons.find((l) => l._id === lessonId)
  if (!lesson) return <p className="text-slate-500">Урок не найден.</p>

  const enrollment = enrollments?.find((e) =>
    (typeof e.course === 'object' ? e.course._id : e.course) === courseId,
  )
  const isDone = enrollment?.completedLessons.includes(lesson._id) ?? false

  return (
    <article className="space-y-6">
      <RouterLink to={`/courses/${courseId}`} className="text-sm text-indigo-600 hover:underline">
        ← К курсу
      </RouterLink>

      <h1 className="text-2xl font-bold">{lesson.title}</h1>

      {lesson.videoUrl && (
        <video src={lesson.videoUrl} controls className="w-full rounded-xl bg-black" />
      )}

      <ContentBlocks blocks={lesson.content} />

      <button
        type="button"
        onClick={() => complete.mutate(lesson._id)}
        disabled={isDone || complete.isPending}
        className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
      >
        {isDone ? '✅ Урок пройден' : complete.isPending ? 'Отмечаем…' : 'Отметить пройденным'}
      </button>
    </article>
  )
}
