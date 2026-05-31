import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

/**
 * Событие перехода по ссылке. Пишется при каждом успешном редиректе/разблокировке.
 * Источник для аналитики (агрегации по дням, рефереру, устройству, браузеру).
 * IP не храним — только производные от User-Agent данные.
 */
const clickEventSchema = new Schema(
  {
    link: { type: Schema.Types.ObjectId, ref: 'Link', required: true },
    ts: { type: Date, default: Date.now },
    referer: { type: String, default: '' },
    device: { type: String, default: 'unknown' }, // desktop | mobile | tablet | unknown
    browser: { type: String, default: 'unknown' },
    os: { type: String, default: 'unknown' },
    country: { type: String, default: '' },
  },
  { timestamps: false },
)

// Под агрегации «клики ссылки по времени»
clickEventSchema.index({ link: 1, ts: 1 })

export type ClickEvent = InferSchemaType<typeof clickEventSchema>
export type ClickEventDocument = HydratedDocument<ClickEvent>
export const ClickEventModel = model('ClickEvent', clickEventSchema)
