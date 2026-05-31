import { useState } from 'react'
import type { QuizAttemptResult, StudentQuiz } from '../../../types'
import { useSubmitQuiz } from '../quiz.hooks'

export function QuizTaker({ quiz }: { quiz: StudentQuiz }) {
  const submit = useSubmitQuiz()
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<QuizAttemptResult | null>(null)

  const allAnswered = quiz.questions.every((_, i) => answers[i] !== undefined)

  const handleSubmit = async () => {
    const arr = quiz.questions.map((_, i) => answers[i] ?? -1)
    setResult(await submit.mutateAsync({ quizId: quiz._id, answers: arr }))
  }

  const reset = () => {
    setResult(null)
    setAnswers({})
  }

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <h4 className="mb-3 font-semibold">{quiz.title}</h4>

      <div className="space-y-4">
        {quiz.questions.map((q, qi) => (
          <div key={qi}>
            <p className="mb-1 font-medium">
              {qi + 1}. {q.text}
            </p>
            <div className="space-y-1">
              {q.options.map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`q-${quiz._id}-${qi}`}
                    checked={answers[qi] === oi}
                    onChange={() => setAnswers({ ...answers, [qi]: oi })}
                    disabled={Boolean(result)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {result ? (
        <div
          className={
            result.passed
              ? 'mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700'
              : 'mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700'
          }
        >
          Результат: {result.correctCount}/{result.total} · {result.score}% ·{' '}
          {result.passed ? 'Сдано ✅' : 'Не сдано'}
          <button type="button" onClick={reset} className="ml-3 underline">
            Пройти заново
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || submit.isPending}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {submit.isPending ? 'Проверяем…' : 'Завершить'}
        </button>
      )}
    </div>
  )
}
