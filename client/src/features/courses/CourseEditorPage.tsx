import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import type { ContentBlock, CourseLevel } from '../../types'
import { useCourse, usePublishCourse, useUpdateCourse } from './courses.hooks'
import { ContentBlockEditor } from './components/ContentBlockEditor'
import { GalleryEditor } from './components/GalleryEditor'
import { ModuleManager } from './components/ModuleManager'
import { QuizEditor } from './components/QuizEditor'
import { ImageUpload } from './components/ImageUpload'
import { Loader } from '../../components/Loader'

const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'

export function CourseEditorPage() {
  const { id } = useParams<{ id: string }>()
  const courseId = id ?? ''
  const { data, isLoading } = useCourse(courseId)
  const updateCourse = useUpdateCourse(courseId)
  const publishCourse = usePublishCourse(courseId)

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState<CourseLevel>('beginner')
  const [coverImage, setCoverImage] = useState('')
  const [gallery, setGallery] = useState<string[]>([])
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [saved, setSaved] = useState(false)

  // Инициализируем форму при загрузке курса (только при смене курса, не при каждом рефетче)
  useEffect(() => {
    if (!data?.course) return
    const c = data.course
    setTitle(c.title)
    setSummary(c.summary)
    setCategory(c.category)
    setLevel(c.level)
    setCoverImage(c.coverImage)
    setGallery(c.gallery)
    setContentBlocks(c.contentBlocks)
  }, [data?.course?._id])

  if (isLoading || !data) return <Loader />

  const { course, modules, lessons } = data

  const save = async () => {
    await updateCourse.mutateAsync({ title, summary, category, level, coverImage, gallery, contentBlocks })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <RouterLink to="/teach" className="text-sm text-indigo-600 hover:underline">
          ← Мои курсы
        </RouterLink>
        <div className="flex items-center gap-3">
          <RouterLink
            to={`/courses/${courseId}`}
            className="text-sm text-slate-600 hover:underline"
          >
            Предпросмотр
          </RouterLink>
          <button
            type="button"
            onClick={() => publishCourse.mutate(course.status !== 'published')}
            disabled={publishCourse.isPending}
            className={
              course.status === 'published'
                ? 'rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200'
                : 'rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700'
            }
          >
            {course.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
          </button>
        </div>
      </header>

      <section className="space-y-3 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="text-lg font-bold">Основное</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название курса" className={inputClass} />
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Краткое описание"
          rows={2}
          className={inputClass}
        />
        <div className="flex gap-2">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Категория"
            className={inputClass}
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseLevel)}
            className="w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="beginner">Начальный</option>
            <option value="intermediate">Средний</option>
            <option value="advanced">Продвинутый</option>
          </select>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Обложка</p>
          {coverImage ? (
            <div className="flex items-center gap-3">
              <img src={coverImage} alt="" className="h-24 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="text-sm text-red-500 hover:underline"
              >
                Убрать
              </button>
            </div>
          ) : (
            <ImageUpload label="Загрузить обложку" onUploaded={setCoverImage} />
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="mb-3 text-lg font-bold">Галерея</h2>
        <GalleryEditor gallery={gallery} onChange={setGallery} />
      </section>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="mb-3 text-lg font-bold">Описание: текст, картинки, графики</h2>
        <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
      </section>

      <button
        type="button"
        onClick={save}
        disabled={updateCourse.isPending}
        className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {saved ? 'Сохранено ✓' : updateCourse.isPending ? 'Сохранение…' : 'Сохранить курс'}
      </button>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="mb-3 text-lg font-bold">Программа</h2>
        <ModuleManager courseId={courseId} modules={modules} lessons={lessons} />
      </section>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="mb-3 text-lg font-bold">Квизы</h2>
        <QuizEditor courseId={courseId} />
      </section>
    </div>
  )
}
