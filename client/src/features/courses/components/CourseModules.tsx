import { Link as RouterLink } from 'react-router-dom'
import type { Lesson, Module } from '../../../types'

interface Props {
  courseId: string
  modules: Module[]
  lessons: Lesson[]
  enrolled: boolean
  completedLessons: string[]
}

export function CourseModules({ courseId, modules, lessons, enrolled, completedLessons }: Props) {
  const done = new Set(completedLessons)
  const standalone = lessons.filter((l) => !l.module)

  return (
    <div className="space-y-4">
      {modules.map((mod) => (
        <ModuleBlock
          key={mod._id}
          title={mod.title}
          lessons={lessons.filter((l) => l.module === mod._id)}
          courseId={courseId}
          enrolled={enrolled}
          done={done}
        />
      ))}
      {standalone.length > 0 && (
        <ModuleBlock
          title="Уроки"
          lessons={standalone}
          courseId={courseId}
          enrolled={enrolled}
          done={done}
        />
      )}
    </div>
  )
}

interface ModuleBlockProps {
  title: string
  lessons: Lesson[]
  courseId: string
  enrolled: boolean
  done: Set<string>
}

function ModuleBlock({ title, lessons, courseId, enrolled, done }: ModuleBlockProps) {
  if (!lessons.length) return null
  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
      <h3 className="border-b border-slate-100 px-4 py-3 font-semibold">{title}</h3>
      <ul className="divide-y divide-slate-100">
        {lessons.map((lesson) => (
          <li key={lesson._id}>
            {enrolled ? (
              <RouterLink
                to={`/courses/${courseId}/lessons/${lesson._id}`}
                className="flex items-center justify-between px-4 py-3 transition hover:bg-slate-50"
              >
                <span>
                  {done.has(lesson._id) ? '✅' : '▶️'} {lesson.title}
                </span>
                <span className="text-xs text-slate-400">{lesson.duration} мин</span>
              </RouterLink>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 text-slate-400">
                <span>🔒 {lesson.title}</span>
                <span className="text-xs">{lesson.duration} мин</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
