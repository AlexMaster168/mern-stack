import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { nanoid } from 'nanoid'
import { ApiError } from '../utils/ApiError.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads')

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

/** Сохраняет картинку в server/uploads и возвращает публичный путь /uploads/<file>. */
export async function saveImage(
  buffer: Buffer,
  mimetype: string,
  originalName: string,
): Promise<string> {
  if (!ALLOWED_MIME.has(mimetype)) {
    throw ApiError.badRequest('Допустимы только изображения (jpeg, png, webp, gif)')
  }
  await mkdir(UPLOADS_DIR, { recursive: true })
  const ext = path.extname(originalName) || `.${mimetype.split('/')[1] ?? 'bin'}`
  const filename = `${nanoid(16)}${ext}`
  await writeFile(path.join(UPLOADS_DIR, filename), buffer)
  return `/uploads/${filename}`
}
