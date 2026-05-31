import { Link as RouterLink } from 'react-router-dom'
import type { Course, CourseLevel } from '../../../types'

const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <RouterLink
      to={`/courses/${course._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:ring-indigo-300"
    >
      {course.coverImage ? (
        <img
          src={course.coverImage}
          alt={course.title}
          className="h-40 w-full object-cover transition group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-100 text-4xl">
          📚
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 inline-block w-fit rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
          {LEVEL_LABELS[course.level]}
        </span>
        <h3 className="font-semibold text-slate-900">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{course.summary}</p>
      </div>
    </RouterLink>
  )
}
