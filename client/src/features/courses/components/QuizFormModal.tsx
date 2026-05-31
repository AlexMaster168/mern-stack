import { useState } from 'react'
import type { OwnerQuiz, QuizQuestion } from '../../../types'
import { useCreateQuiz, useUpdateQuiz } from '../quiz.hooks'

interface Props {
  courseId: string
  quiz?: OwnerQuiz
  onClose: () => void
}

export function QuizFormModal({ courseId, quiz, onClose }: Props) {
  const createQuiz = useCreateQuiz(courseId)
  const updateQuiz = useUpdateQuiz(courseId)
  const [title, setTitle] = useState(quiz?.title ?? '')
  const [questions, setQuestions] = useState<QuizQuestion[]>(quiz?.questions ?? [])

  const saving = createQuiz.isPending || updateQuiz.isPending

  const updateQuestion = (i: number, patch: Partial<QuizQuestion>) =>
    setQuestions(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)))

  const setOption = (qi: number, oi: number, value: string) => {
    const q = questions[qi]
    if (!q) return
    updateQuestion(qi, { options: q.options.map((o, idx) => (idx === oi ? value : o)) })
  }

  const addOption = (qi: number) => {
    const q = questions[qi]
    if (!q) return
    updateQuestion(qi, { options: [...q.options, ''] })
  }

  const removeOption = (qi: number, oi: number) => {
    const q = questions[qi]
    if (!q || q.options.length <= 2) return
    const options = q.options.filter((_, idx) => idx !== oi)
    updateQuestion(qi, { options, correctIndex: q.correctIndex >= options.length ? 0 : q.correctIndex })
  }

  const save = async () => {
    if (quiz) {
      await updateQuiz.mutateAsync({ quizId: quiz._id, input: { title, questions } })
    } else {
      await createQuiz.mutateAsync({ title, questions })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold">{quiz ? 'Редактировать квиз' : 'Новый квиз'}</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название квиза"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        {questions.map((q, qi) => (
          <div key={qi} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Вопрос {qi + 1}
              </span>
              <button
                type="button"
                onClick={() => setQuestions(questions.filter((_, idx) => idx !== qi))}
                className="text-sm text-red-500 hover:underline"
              >
                Удалить вопрос
              </button>
            </div>
            <input
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              placeholder="Текст вопроса"
              className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <p className="text-xs text-slate-500">Отметьте правильный вариант:</p>
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={q.correctIndex === oi}
                  onChange={() => updateQuestion(qi, { correctIndex: oi })}
                />
                <input
                  value={opt}
                  onChange={(e) => setOption(qi, oi, e.target.value)}
                  placeholder={`Вариант ${oi + 1}`}
                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeOption(qi, oi)}
                  className="rounded bg-slate-100 px-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOption(qi)}
              className="text-sm text-indigo-600 hover:underline"
            >
              + Вариант
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setQuestions([...questions, { text: '', options: ['', ''], correctIndex: 0 }])}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm hover:bg-slate-200"
        >
          + Вопрос
        </button>

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
