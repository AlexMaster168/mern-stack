import { Schema } from 'mongoose'

/**
 * Блок rich-контента: текст, картинка или график.
 * Переиспользуется в описании курса и в содержимом уроков.
 * - text:  { value }
 * - image: { url, caption? }       — картинки хранятся локально в /uploads
 * - chart: { chartType, data }     — данные для графиков (рисуются на фронте через Recharts)
 */
export const CONTENT_BLOCK_TYPES = ['text', 'image', 'chart'] as const
export const CHART_TYPES = ['bar', 'line', 'pie'] as const

export const contentBlockSchema = new Schema(
  {
    type: { type: String, enum: CONTENT_BLOCK_TYPES, required: true },
    value: { type: String },
    url: { type: String },
    caption: { type: String },
    chartType: { type: String, enum: CHART_TYPES },
    data: { type: Schema.Types.Mixed },
  },
  { _id: false },
)
