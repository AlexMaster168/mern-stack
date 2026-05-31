import { useCourses } from './courses.hooks'
import { CourseCard } from './components/CourseCard'
import { Loader } from '../../components/Loader'

export function CoursesPage() {
  const { data: courses, isLoading, isError } = useCourses()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Каталог курсов</h1>

      {isLoading && <Loader />}
      {isError && <p className="text-red-600">Не удалось загрузить курсы</p>}
      {courses && courses.length === 0 && <p className="text-slate-500">Курсов пока нет.</p>}

      {courses && courses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
