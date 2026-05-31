import { useState, type FormEvent } from 'react'
import { AxiosError } from 'axios'
import type { CourseAuthor } from '../../../types'
import { useAddComment, useComments } from '../courses.hooks'

function authorName(user: CourseAuthor | string): string {
  return typeof user === 'object' ? user.name || user.email : 'Пользователь'
}

export function CommentsSection({ courseId, canComment }: { courseId: string; canComment: boolean }) {
  const { data: comments, isLoading } = useComments(courseId)
  const addComment = useAddComment(courseId)
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await addComment.mutateAsync({ text, rating })
      setText('')
    } catch (err) {
      const msg =
        err instanceof AxiosError ? (err.response?.data?.message as string | undefined) : undefined
      setError(msg ?? 'Не удалось отправить отзыв')
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Отзывы</h2>

      {canComment ? (
        <form onSubmit={submit} className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={3}
            placeholder="Поделитесь впечатлением о курсе"
            className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">
              Оценка:
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="ml-2 rounded border border-slate-300 p-1"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={addComment.isPending}
              className="ml-auto rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {addComment.isPending ? 'Отправка…' : 'Отправить'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      ) : (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          Запишитесь на курс, чтобы оставить отзыв.
        </p>
      )}

      {isLoading && <p className="text-slate-500">Загрузка…</p>}
      <ul className="space-y-3">
        {comments?.map((c) => (
          <li key={c._id} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-medium">{authorName(c.user)}</span>
              {c.rating ? <span className="text-amber-500">{'★'.repeat(c.rating)}</span> : null}
            </div>
            <p className="mt-1 whitespace-pre-line text-slate-700">{c.text}</p>
            <p className="mt-1 text-xs text-slate-400">
              {new Date(c.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </li>
        ))}
        {comments && comments.length === 0 && <p className="text-slate-500">Пока нет отзывов.</p>}
      </ul>
    </section>
  )
}
