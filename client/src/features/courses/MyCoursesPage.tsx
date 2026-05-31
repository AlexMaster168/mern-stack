import { Link as RouterLink } from 'react-router-dom'
import { useMyEnrollments } from './courses.hooks'
import { Loader } from '../../components/Loader'

export function MyCoursesPage() {
  const { data: enrollments, isLoading } = useMyEnrollments()

  if (isLoading) return <Loader />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Мои курсы</h1>

      {enrollments && enrollments.length === 0 && (
        <p className="text-slate-500">
          Вы пока не записаны ни на один курс.{' '}
          <RouterLink to="/courses" className="text-indigo-600 hover:underline">
            В каталог →
          </RouterLink>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {enrollments?.map((enrollment) => {
          const course = enrollment.course
          if (typeof course !== 'object') return null
          return (
            <RouterLink
              key={enrollment._id}
              to={`/courses/${course._id}`}
              className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition hover:ring-indigo-300"
            >
              <div className="flex items-center gap-3">
                {course.coverImage && (
                  <img src={course.coverImage} alt="" className="h-16 w-16 rounded-lg object-cover" />
                )}
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <span
                    className={
                      enrollment.status === 'completed'
                        ? 'text-xs text-green-600'
                        : 'text-xs text-slate-500'
                    }
                  >
                    {enrollment.status === 'completed' ? 'Завершён ✅' : 'В процессе'}
                  </span>
                </div>
              </div>
            </RouterLink>
          )
        })}
      </div>
    </div>
  )
}
