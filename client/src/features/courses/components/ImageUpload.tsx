import { useRef, useState, type ChangeEvent } from 'react'
import { uploadImage } from '../courses.api'

interface Props {
  onUploaded: (url: string) => void
  label?: string
}

export function ImageUpload({ onUploaded, label = 'Загрузить картинку' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handle = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(file)
      onUploaded(url)
    } catch {
      setError('Не удалось загрузить файл')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50"
      >
        {uploading ? 'Загрузка…' : label}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handle} className="hidden" />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
