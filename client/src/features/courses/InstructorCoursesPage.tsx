import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useCreateCourse, useDeleteCourse, useMyCourses } from './courses.hooks'
import { Loader } from '../../components/Loader'

export function InstructorCoursesPage() {
  const { data: courses, isLoading } = useMyCourses()
  const createCourse = useCreateCourse()
  const deleteCourse = useDeleteCourse()
  const navigate = useNavigate()

  const create = async () => {
    const course = await createCourse.mutateAsync({ title: 'Новый курс' })
    navigate(`/teach/${course._id}`)
  }

  if (isLoading) return <Loader />

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Преподавание</h1>
        <button
          type="button"
          onClick={create}
          disabled={createCourse.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {createCourse.isPending ? 'Создаём…' : '+ Создать курс'}
        </button>
      </div>

      <div className="space-y-3">
        {courses?.map((course) => (
          <div
            key={course._id}
            className="flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-slate-200"
          >
            <div>
              <h3 className="font-semibold">{course.title}</h3>
              <span
                className={
                  course.status === 'published'
                    ? 'text-xs text-green-600'
                    : 'text-xs text-amber-600'
                }
              >
                {course.status === 'published' ? 'Опубликован' : 'Черновик'}
              </span>
            </div>
            <div className="flex gap-3 text-sm">
              <RouterLink to={`/teach/${course._id}`} className="text-indigo-600 hover:underline">
                Редактировать
              </RouterLink>
              <button
                type="button"
                onClick={() => deleteCourse.mutate(course._id)}
                className="text-red-500 hover:underline"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
        {courses && courses.length === 0 && (
          <p className="text-slate-500">У вас пока нет курсов. Создайте первый!</p>
        )}
      </div>
    </div>
  )
}
