import { useState } from 'react'
import type { OwnerQuiz } from '../../../types'
import { useDeleteQuiz, useManageQuizzes } from '../quiz.hooks'
import { QuizFormModal } from './QuizFormModal'

export function QuizEditor({ courseId }: { courseId: string }) {
  const { data: quizzes } = useManageQuizzes(courseId)
  const deleteQuiz = useDeleteQuiz(courseId)
  const [editing, setEditing] = useState<{ quiz?: OwnerQuiz } | null>(null)

  return (
    <div className="space-y-3">
      {quizzes?.map((quiz) => (
        <div
          key={quiz._id}
          className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
        >
          <span>
            {quiz.title} <span className="text-slate-400">· {quiz.questions.length} вопр.</span>
          </span>
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setEditing({ quiz })}
              className="text-indigo-600 hover:underline"
            >
              Изменить
            </button>
            <button
              type="button"
              onClick={() => deleteQuiz.mutate(quiz._id)}
              className="text-red-500 hover:underline"
            >
              Удалить
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setEditing({})}
        className="text-sm text-indigo-600 hover:underline"
      >
        + Добавить квиз
      </button>

      {editing && (
        <QuizFormModal courseId={courseId} quiz={editing.quiz} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
