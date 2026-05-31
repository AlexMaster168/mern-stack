import { z } from 'zod'

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Некорректный идентификатор')

export const idParams = z.object({ id: objectId })
