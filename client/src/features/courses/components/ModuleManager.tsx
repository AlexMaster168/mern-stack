import { useState } from 'react'
import type { Lesson, Module } from '../../../types'
import { useAddModule, useDeleteLesson, useDeleteModule } from '../courses.hooks'
import { LessonEditor } from './LessonEditor'

interface Props {
  courseId: string
  modules: Module[]
  lessons: Lesson[]
}

export function ModuleManager({ courseId, modules, lessons }: Props) {
  const addModule = useAddModule(courseId)
  const deleteModule = useDeleteModule(courseId)
  const deleteLesson = useDeleteLesson(courseId)
  const [moduleTitle, setModuleTitle] = useState('')
  const [editing, setEditing] = useState<{ lesson?: Lesson; moduleId?: string } | null>(null)

  const lessonsOf = (moduleId: string | null) =>
    lessons.filter((l) => (moduleId ? l.module === moduleId : !l.module))

  const submitModule = () => {
    const title = moduleTitle.trim()
    if (!title) return
    addModule.mutate(title)
    setModuleTitle('')
  }

  return (
    <div className="space-y-4">
      {modules.map((mod) => (
        <div key={mod._id} className="rounded-xl border border-slate-200 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-semibold">{mod.title}</h4>
            <button
              type="button"
              onClick={() => deleteModule.mutate(mod._id)}
              className="text-sm text-red-500 hover:underline"
            >
              Удалить модуль
            </button>
          </div>
          <LessonList
            lessons={lessonsOf(mod._id)}
            onEdit={(lesson) => setEditing({ lesson })}
            onDelete={(id) => deleteLesson.mutate(id)}
          />
          <button
            type="button"
            onClick={() => setEditing({ moduleId: mod._id })}
            className="mt-2 text-sm text-indigo-600 hover:underline"
          >
            + Урок в модуль
          </button>
        </div>
      ))}

      {lessonsOf(null).length > 0 && (
        <div className="rounded-xl border border-slate-200 p-4">
          <h4 className="mb-2 font-semibold text-slate-500">Без модуля</h4>
          <LessonList
            lessons={lessonsOf(null)}
            onEdit={(lesson) => setEditing({ lesson })}
            onDelete={(id) => deleteLesson.mutate(id)}
          />
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          placeholder="Название модуля"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={submitModule}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm hover:bg-slate-200"
        >
          + Модуль
        </button>
      </div>

      <button
        type="button"
        onClick={() => setEditing({})}
        className="text-sm text-indigo-600 hover:underline"
      >
        + Урок (без модуля)
      </button>

      {editing && (
        <LessonEditor
          courseId={courseId}
          modules={modules}
          lesson={editing.lesson}
          defaultModuleId={editing.moduleId}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

interface LessonListProps {
  lessons: Lesson[]
  onEdit: (lesson: Lesson) => void
  onDelete: (id: string) => void
}

function LessonList({ lessons, onEdit, onDelete }: LessonListProps) {
  if (!lessons.length) return <p className="text-sm text-slate-400">Уроков пока нет</p>
  return (
    <ul className="divide-y divide-slate-100">
      {lessons.map((lesson) => (
        <li key={lesson._id} className="flex items-center justify-between py-2">
          <span className="text-sm">
            {lesson.title} <span className="text-slate-400">· {lesson.duration} мин</span>
          </span>
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => onEdit(lesson)}
              className="text-indigo-600 hover:underline"
            >
              Изменить
            </button>
            <button
              type="button"
              onClick={() => onDelete(lesson._id)}
              className="text-red-500 hover:underline"
            >
              Удалить
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
