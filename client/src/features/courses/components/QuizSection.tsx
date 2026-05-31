import { useQuizzes } from '../quiz.hooks'
import { QuizTaker } from './QuizTaker'

export function QuizSection({ courseId }: { courseId: string }) {
  const { data: quizzes } = useQuizzes(courseId)
  if (!quizzes || quizzes.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Проверь себя</h2>
      {quizzes.map((quiz) => (
        <QuizTaker key={quiz._id} quiz={quiz} />
      ))}
    </section>
  )
}
