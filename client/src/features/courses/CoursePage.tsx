import { Link as RouterLink, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCourse, useEnroll, useMyEnrollments } from './courses.hooks'
import { ContentBlocks } from './components/ContentBlocks'
import { CourseModules } from './components/CourseModules'
import { CommentsSection } from './components/CommentsSection'
import { QuizSection } from './components/QuizSection'
import { CertificateButton } from './components/CertificateButton'
import { Loader } from '../../components/Loader'

export function CoursePage() {
  const { id } = useParams<{ id: string }>()
  const courseId = id ?? ''
  const { user } = useAuth()
  const { data, isLoading, isError } = useCourse(courseId)
  const { data: enrollments } = useMyEnrollments()
  const enroll = useEnroll()

  if (isLoading) return <Loader />
  if (isError || !data) return <p className="text-slate-500">Курс не найден.</p>

  const { course, modules, lessons } = data
  const myEnrollment = enrollments?.find((e) =>
    typeof e.course === 'object' ? e.course._id === courseId : e.course === courseId,
  )
  const enrolled = Boolean(myEnrollment)
  const completedLessons = myEnrollment?.completedLessons ?? []
  const progress = lessons.length
    ? Math.round((completedLessons.length / lessons.length) * 100)
    : 0

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        {course.coverImage && (
          <img
            src={course.coverImage}
            alt={course.title}
            className="h-56 w-full rounded-2xl object-cover"
          />
        )}
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-slate-600">{course.summary}</p>

        <div className="flex items-center gap-3">
          {user ? (
            enrolled ? (
              <span className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                Вы записаны • прогресс {progress}%
              </span>
            ) : (
              <button
                type="button"
                onClick={() => enroll.mutate(courseId)}
                disabled={enroll.isPending}
                className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {enroll.isPending ? 'Записываем…' : 'Записаться на курс'}
              </button>
            )
          ) : (
            <RouterLink
              to="/login"
              className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700"
            >
              Войти, чтобы записаться
            </RouterLink>
          )}
        </div>

        {enrolled && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      {course.gallery.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Галерея</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {course.gallery.map((src, i) => (
              <img key={i} src={src} alt="" className="h-32 w-full rounded-lg object-cover" />
            ))}
          </div>
        </section>
      )}

      {course.contentBlocks.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">О курсе</h2>
          <ContentBlocks blocks={course.contentBlocks} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-bold">Программа</h2>
        <CourseModules
          courseId={courseId}
          modules={modules}
          lessons={lessons}
          enrolled={enrolled}
          completedLessons={completedLessons}
        />
      </section>

      {enrolled && <QuizSection courseId={courseId} />}

      {myEnrollment?.status === 'completed' && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Сертификат</h2>
          <p className="text-sm text-slate-600">Курс завершён — заберите сертификат:</p>
          <CertificateButton courseId={courseId} />
        </section>
      )}

      <CommentsSection courseId={courseId} canComment={enrolled} />
    </div>
  )
}
