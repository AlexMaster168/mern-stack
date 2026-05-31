import { ImageUpload } from './ImageUpload'

interface Props {
  gallery: string[]
  onChange: (gallery: string[]) => void
}

export function GalleryEditor({ gallery, onChange }: Props) {
  return (
    <div className="space-y-3">
      {gallery.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {gallery.map((url, i) => (
            <div key={i} className="group relative">
              <img src={url} alt="" className="h-24 w-full rounded object-cover" />
              <button
                type="button"
                onClick={() => onChange(gallery.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 rounded bg-black/60 px-2 text-white opacity-0 transition group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <ImageUpload label="+ Добавить в галерею" onUploaded={(url) => onChange([...gallery, url])} />
    </div>
  )
}
