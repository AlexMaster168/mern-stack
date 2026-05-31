import { useState } from 'react'
import type { ContentBlock, Lesson, Module } from '../../../types'
import { useCreateLesson, useUpdateLesson } from '../courses.hooks'
import { ContentBlockEditor } from './ContentBlockEditor'

interface Props {
  courseId: string
  modules: Module[]
  lesson?: Lesson
  defaultModuleId?: string
  onClose: () => void
}

const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'

export function LessonEditor({ courseId, modules, lesson, defaultModuleId, onClose }: Props) {
  const createLesson = useCreateLesson(courseId)
  const updateLesson = useUpdateLesson(courseId)

  const [title, setTitle] = useState(lesson?.title ?? '')
  const [moduleId, setModuleId] = useState(lesson?.module ?? defaultModuleId ?? '')
  const [duration, setDuration] = useState(lesson?.duration ?? 0)
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? '')
  const [content, setContent] = useState<ContentBlock[]>(lesson?.content ?? [])

  const saving = createLesson.isPending || updateLesson.isPending

  const save = async () => {
    const input = { title, module: moduleId || undefined, duration, videoUrl, content }
    if (lesson) {
      await updateLesson.mutateAsync({ lessonId: lesson._id, input })
    } else {
      await createLesson.mutateAsync(input)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold">{lesson ? 'Редактировать урок' : 'Новый урок'}</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название урока"
          className={inputClass}
        />

        <div className="flex gap-2">
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Без модуля</option>
            {modules.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            placeholder="Минут"
            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="URL видео (необязательно)"
          className={inputClass}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Содержимое урока</p>
          <ContentBlockEditor blocks={content} onChange={setContent} />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm hover:bg-slate-200"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!title.trim() || saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
